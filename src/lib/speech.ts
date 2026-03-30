import { ALL_CHARACTERS } from "./curriculum";

const KANNADA_RE = /[\u0C80-\u0CFF]/;
const SENTENCE_END_RE = /[.!?\u0964]$/;

const ROMANIZATION_BY_LABEL = new Map<string, string>();
for (const char of ALL_CHARACTERS) {
  if (char.glyph) ROMANIZATION_BY_LABEL.set(char.glyph, char.romanization);
  if (char.context) ROMANIZATION_BY_LABEL.set(char.context, char.romanization);
  if (char.audioLabel) ROMANIZATION_BY_LABEL.set(char.audioLabel, char.romanization);
}


function normalizePrompt(text: string): {
  original: string;
  normalized: string;
  addedPunctuation: boolean;
} {
  const original = text;
  const trimmed = text.trim();
  let core = trimmed;

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
  // Safari Hack 1: Create Audio element synchronously before any 'await'
  const audio = new Audio();
  // Call play() immediately to bind it to the current user gesture
  audio.play().catch(() => {});

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

  if (!/^[A-Za-z0-9+/=_-]+$/.test(base64Audio)) {
    console.warn("[TTS] invalid base64 payload", { length: base64Audio.length });
    throw new Error("Invalid base64 audio from Sarvam TTS");
  }

  // Decode base64 → Blob → Object URL → play
  let binary: string;
  try {
    binary = atob(base64Audio);
  } catch (error) {
    console.error("[TTS] base64 decode failed", error);
    throw new Error("Failed to decode audio");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (bytes.length < 44) {
    console.warn("[TTS] audio payload too small", { length: bytes.length });
  }

  const blob = new Blob([bytes], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  
  // Safari Hack 1 (cont): Update the src on our pre-created element
  audio.src = url;

  return new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const startTimeout = () => {
      timeout = setTimeout(() => {
        audio.pause();
        URL.revokeObjectURL(url);
        reject(new Error("Audio playback timed out"));
      }, 15000);
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
  return speakWithSarvam(text);
}

export function preloadVoices(): void {}

// --- Safari / iOS Global Audio Unlocker ---
let audioUnlocked = false;

if (typeof window !== "undefined") {
  const unlock = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Tiny silent MP3 base64 to trick Safari into globally unlocking the Web Audio engine
    const silentAudio = new Audio("data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
    silentAudio.play().catch(() => {});
    
    // Cleanup listeners
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("click", unlock, true);
  };
  
  // Use capture phase to ensure it catches clicks even if React stops propagation
  window.addEventListener("touchstart", unlock, { once: true, capture: true });
  window.addEventListener("click", unlock, { once: true, capture: true });
}
