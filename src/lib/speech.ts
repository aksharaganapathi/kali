import { ALL_CHARACTERS } from "./curriculum";

const KANNADA_RE = /[\u0C80-\u0CFF]/;
const SENTENCE_END_RE = /[.!?\u0964]$/;
const BASE64_AUDIO_RE = /^[A-Za-z0-9+/=_-]+$/;

const ROMANIZATION_BY_LABEL = new Map<string, string>();
for (const char of ALL_CHARACTERS) {
  if (char.glyph) ROMANIZATION_BY_LABEL.set(char.glyph, char.romanization);
  if (char.context) ROMANIZATION_BY_LABEL.set(char.context, char.romanization);
  if (char.audioLabel) ROMANIZATION_BY_LABEL.set(char.audioLabel, char.romanization);
}

let consecutiveSpeechFailures = 0;

function detectAudioMimeType(bytes: Uint8Array): "audio/wav" | "audio/mpeg" | null {
  const hasWavHeader =
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x41 && // A
    bytes[10] === 0x56 && // V
    bytes[11] === 0x45; // E
  if (hasWavHeader) return "audio/wav";

  const hasId3Header = bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
  const hasMp3FrameSync = bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
  if (hasId3Header || hasMp3FrameSync) return "audio/mpeg";

  return null;
}


function normalizePrompt(text: string): {
  original: string;
  normalized: string;
  addedPunctuation: boolean;
} {
  const original = text;
  const trimmed = text.trim();
  const core = trimmed;

  let normalized = core;
  let addedPunctuation = false;
  
  const isShortKannada = KANNADA_RE.test(core) && core.replace(/\s+/g, "").length <= 4;
  
  if (isShortKannada) {
    normalized = `This is pronounced as ${core}.`;
    addedPunctuation = true;
  } else if (core.length > 0 && !SENTENCE_END_RE.test(core)) {
    const endsWithKannada = KANNADA_RE.test(core.slice(-1));
    normalized = `${core}${endsWithKannada ? "\u0964" : "."}`;
    addedPunctuation = true;
  }

  return {
    original,
    normalized: normalized.length > 0 ? normalized : original,
    addedPunctuation,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postTts(text: string): Promise<Response> {
  const payload = JSON.stringify({ text });
  const maxAttempts = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (res.ok) return res;

      if ((res.status >= 500 || res.status === 429) && attempt < maxAttempts) {
        await delay(250 * attempt);
        continue;
      }

      return res;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await delay(250 * attempt);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Unknown TTS error");
}

export function isSpeechAvailable(): boolean {
  // Sarvam is always available (key is server-side); we only need a browser context
  return typeof window !== "undefined";
}

async function speakWithSarvam(text: string): Promise<void> {
  const { normalized, original, addedPunctuation } = normalizePrompt(text);
  if (normalized !== original) {
    console.debug("[TTS] normalize", {
      original,
      normalized,
      addedPunctuation,
    });
  }

  const res = await postTts(normalized);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sarvam TTS error: ${err}`);
  }

  const data = await res.json() as { audios?: unknown };
  const audios = Array.isArray(data.audios) ? data.audios : [];
  const base64Audio = audios.join("").replace(/\s+/g, "");
  if (!base64Audio) {
    throw new Error("No audio returned from Sarvam TTS");
  }

  if (!BASE64_AUDIO_RE.test(base64Audio)) {
    console.warn("[TTS] invalid base64 payload", { length: base64Audio.length });
    throw new Error("Invalid base64 audio from Sarvam TTS");
  }

  const normalizedBase64 = base64Audio
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(base64Audio.length / 4) * 4, "=");

  // Decode base64 → Blob → Object URL → play
  let binary: string;
  try {
    binary = atob(normalizedBase64);
  } catch (error) {
    console.error("[TTS] base64 decode failed", error);
    throw new Error("Failed to decode audio");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (bytes.length < 32) {
    console.warn("[TTS] audio payload too small", { length: bytes.length });
    throw new Error("Invalid audio payload from TTS service");
  }

  const mimeType = detectAudioMimeType(bytes);
  if (!mimeType) {
    console.warn("[TTS] unrecognized audio header", {
      firstBytes: Array.from(bytes.slice(0, 12)),
      length: bytes.length,
    });
    throw new Error("Unsupported audio format from TTS service");
  }

  if (mimeType === "audio/wav" && bytes.length < 44) {
    throw new Error("Corrupted WAV payload from TTS service");
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  const estimatedDurationMs = Math.ceil((bytes.length / (24000 * 2)) * 1000);
  const playbackTimeoutMs = Math.max(15000, Math.min(30000, estimatedDurationMs + 5000));

  return new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const startTimeout = () => {
      timeout = setTimeout(() => {
        audio.pause();
        URL.revokeObjectURL(url);
        reject(new Error("Audio playback timed out"));
      }, playbackTimeoutMs);
    };

    audio.onplaying = () => {
      if (!timeout) startTimeout();
    };

    audio.onended = () => {
      if (timeout) clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      if (timeout) clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };

    audio.play().catch((err) => {
      if (timeout) clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(err);
    });
  });
}

export async function speak(text: string): Promise<void> {
  try {
    await speakWithSarvam(text);
    consecutiveSpeechFailures = 0;
  } catch (error) {
    consecutiveSpeechFailures += 1;
    const detail = error instanceof Error ? error.message : "Unknown speech error";

    if (consecutiveSpeechFailures >= 2) {
      throw new Error(`Audio is temporarily unavailable (${detail}). Continue with text hints and retry shortly.`);
    }

    throw new Error(detail);
  }
}

export function preloadVoices(): void {}
