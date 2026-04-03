import { ALL_CHARACTERS, LEVELS } from "./curriculum";

const AUDIO_BASE_PATH = process.env.NEXT_PUBLIC_FREETTS_AUDIO_BASE_PATH ?? "/audio/freetts";
const AUDIO_VOICE = process.env.NEXT_PUBLIC_FREETTS_VOICE ?? "kn-IN-GaganNeural";
const AUDIO_PLAYBACK_TIMEOUT_MS = 20_000;
const PRELOAD_BUDGET = 18;

type ManifestEntry = {
  glyph: string;
  audioLabel?: string;
  file: string;
};

let activeAudio: HTMLAudioElement | null = null;
let manifestMapPromise: Promise<Map<string, string>> | null = null;
let didPreload = false;
const missingUrls = new Set<string>();

function normalizeKey(value: string): string {
  return value.trim();
}

function glyphToFilename(glyph: string): string {
  const codepoints = Array.from(glyph)
    .map((char) => char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") ?? "0000")
    .join("-");
  const safeGlyph = glyph.replace(/[\\/:*?"<>|]/g, "_");
  return `${codepoints}_${safeGlyph}.mp3`;
}

function buildAudioUrl(fileName: string): string {
  return `${AUDIO_BASE_PATH}/${AUDIO_VOICE}/${encodeURIComponent(fileName)}`;
}

function buildFallbackPromptMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const char of ALL_CHARACTERS) {
    const fileName = glyphToFilename(char.glyph);
    const url = buildAudioUrl(fileName);

    map.set(normalizeKey(char.glyph), url);
    if (char.context) map.set(normalizeKey(char.context), url);
    if (char.audioLabel) map.set(normalizeKey(char.audioLabel), url);
  }
  return map;
}

async function loadManifestPromptMap(): Promise<Map<string, string>> {
  const fallback = buildFallbackPromptMap();
  const manifestUrl = `${AUDIO_BASE_PATH}/${AUDIO_VOICE}/manifest.json`;

  try {
    const res = await fetch(manifestUrl, { cache: "force-cache" });
    if (!res.ok) return fallback;

    const payload = (await res.json()) as unknown;
    if (!Array.isArray(payload)) return fallback;

    for (const item of payload as ManifestEntry[]) {
      if (!item || typeof item.file !== "string" || typeof item.glyph !== "string") continue;

      const audioUrl = buildAudioUrl(item.file);
      fallback.set(normalizeKey(item.glyph), audioUrl);
      if (typeof item.audioLabel === "string" && item.audioLabel.trim().length > 0) {
        fallback.set(normalizeKey(item.audioLabel), audioUrl);
      }
    }
  } catch {
    // Keep silent fallback behavior for offline-first local assets.
  }

  return fallback;
}

async function getPromptMap(): Promise<Map<string, string>> {
  if (!manifestMapPromise) {
    manifestMapPromise = loadManifestPromptMap();
  }
  return manifestMapPromise;
}

function stopActiveAudio(): void {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

async function playAudioUrl(url: string): Promise<void> {
  if (missingUrls.has(url)) {
    throw new Error("Audio file missing for this character");
  }

  stopActiveAudio();

  const audio = new Audio(url);
  audio.preload = "auto";
  activeAudio = audio;

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (activeAudio === audio) {
        stopActiveAudio();
      }
      reject(new Error("Audio playback timed out"));
    }, AUDIO_PLAYBACK_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      audio.onended = null;
      audio.onerror = null;
    };

    audio.onended = () => {
      cleanup();
      if (activeAudio === audio) activeAudio = null;
      resolve();
    };

    audio.onerror = () => {
      cleanup();
      missingUrls.add(url);
      if (activeAudio === audio) activeAudio = null;
      reject(new Error("Audio playback failed"));
    };

    audio.play().catch((error) => {
      cleanup();
      if (activeAudio === audio) activeAudio = null;
      reject(error instanceof Error ? error : new Error("Audio playback failed"));
    });
  });
}

export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined";
}

export async function speak(text: string): Promise<void> {
  if (!isSpeechAvailable()) {
    throw new Error("Speech is unavailable in this environment");
  }

  const key = normalizeKey(text);
  if (!key) {
    throw new Error("Cannot play empty audio prompt");
  }

  const promptMap = await getPromptMap();
  const url = promptMap.get(key);
  if (!url) {
    throw new Error(`No local audio mapping found for: ${text}`);
  }

  await playAudioUrl(url);
}

export function preloadVoices(): void {
  if (!isSpeechAvailable() || didPreload) return;
  didPreload = true;

  void getPromptMap().then((promptMap) => {
    const preloadCandidates: string[] = [];
    for (const char of LEVELS[0]?.characters ?? []) {
      preloadCandidates.push(char.audioLabel, char.glyph, char.context ?? "");
      if (preloadCandidates.length >= PRELOAD_BUDGET) break;
    }

    const uniqueUrls = new Set<string>();
    for (const candidate of preloadCandidates) {
      const key = normalizeKey(candidate);
      if (!key) continue;
      const url = promptMap.get(key);
      if (!url || uniqueUrls.has(url)) continue;
      uniqueUrls.add(url);
      if (uniqueUrls.size >= PRELOAD_BUDGET) break;
    }

    for (const url of uniqueUrls) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = url;
    }
  });
}
