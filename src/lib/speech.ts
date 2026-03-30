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

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

async function speakWithSarvam(text: string): Promise<void> {
  // 1. Synchronous Unlock: If this function is called from an onClick handler,
  // calling resume() immediately will unlock iOS Safari audio context permanently.
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

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

  // Decode base64 → ArrayBuffer
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

  if (!ctx) throw new Error("AudioContext not supported on this browser");

  let audioBuffer: AudioBuffer;
  try {
    // Older Safari needs the Promise wrapper for decodeAudioData
    audioBuffer = await new Promise((resolve, reject) => {
      ctx.decodeAudioData(
        bytes.buffer.slice(0),
        (buffer) => resolve(buffer),
        (err) => reject(err)
      );
    });
  } catch (error) {
    console.error("[TTS] decodeAudioData failed", error);
    throw new Error("Failed to decode audio format");
  }

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  return new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    source.onended = () => {
      if (timeout) clearTimeout(timeout);
      resolve();
    };
    
    // Fallback if onended doesn't fire
    timeout = setTimeout(() => resolve(), (audioBuffer.duration * 1000) + 1000);
    
    try {
      source.start(0);
    } catch (error) {
      if (timeout) clearTimeout(timeout);
      reject(error);
    }
  });
}

export async function speak(text: string): Promise<void> {
  return speakWithSarvam(text);
}

export function preloadVoices(): void {
  // Just touch the audio context to unlock it proactively on first interaction
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}
