let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;
let voiceLoadPromise: Promise<void> | null = null;
let checkedVoiceAvailability = false;
let hasIndianVoice = false;

/**
 * Returns a promise that resolves once speechSynthesis voices are loaded.
 * Handles the Chrome quirk where getVoices() is empty until the
 * asynchronous "voiceschanged" event fires.
 */
function ensureVoicesLoaded(): Promise<void> {
  if (voicesReady) return Promise.resolve();
  if (voiceLoadPromise) return voiceLoadPromise;

  voiceLoadPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      voicesReady = true;
      resolve();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesReady = true;
      resolve();
      return;
    }

    const onReady = () => {
      voicesReady = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onReady);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onReady);

    // Safety timeout — some browsers never fire voiceschanged
    setTimeout(() => {
      voicesReady = true;
      resolve();
    }, 3000);
  });

  return voiceLoadPromise;
}

function getIndianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();

  // Priority: Kannada > Hindi > any Indian language
  const kn =
    voices.find((v) => v.lang === "kn-IN") ??
    voices.find((v) => v.lang.startsWith("kn")) ??
    null;
  if (kn) {
    cachedVoice = kn;
    return kn;
  }

  // Hindi fallback — can pronounce Kannada text reasonably well
  const hi =
    voices.find((v) => v.lang === "hi-IN") ??
    voices.find((v) => v.lang.startsWith("hi")) ??
    null;
  if (hi) {
    cachedVoice = hi;
    return hi;
  }

  // Any Indian language as last resort
  const indianLangs = ["ta", "te", "ml", "mr", "gu", "bn", "pa"];
  for (const lang of indianLangs) {
    const v = voices.find((v) => v.lang.startsWith(lang));
    if (v) {
      cachedVoice = v;
      return v;
    }
  }

  return null;
}

export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Check if an Indian language voice is actually installed.
 * Call after voices are loaded.
 */
export function isIndianVoiceAvailable(): boolean {
  if (checkedVoiceAvailability) return hasIndianVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return false;

  const voices = window.speechSynthesis.getVoices();
  hasIndianVoice = voices.some((v) => {
    const lang = v.lang.toLowerCase();
    return (
      lang.startsWith("kn") ||
      lang.startsWith("hi") ||
      lang.startsWith("ta") ||
      lang.startsWith("te") ||
      lang.startsWith("ml") ||
      lang.startsWith("mr")
    );
  });
  checkedVoiceAvailability = true;
  return hasIndianVoice;
}

/**
 * Speak text using Google Translate TTS as an audio fallback.
 * Works without any installed voices.
 */
function speakWithGoogleTTS(text: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=kn&client=tw-ob`;
      const audio = new Audio(url);
      audio.playbackRate = 0.9;

      const timeout = setTimeout(() => {
        audio.pause();
        resolve();
      }, 8000);

      audio.onended = () => {
        clearTimeout(timeout);
        resolve();
      };
      audio.onerror = () => {
        clearTimeout(timeout);
        // Silently resolve — caller will handle the visual fallback
        reject(new Error("Google TTS unavailable"));
      };

      audio.play().catch(() => {
        clearTimeout(timeout);
        reject(new Error("Audio playback blocked"));
      });
    } catch {
      reject(new Error("Google TTS failed"));
    }
  });
}

export async function speak(text: string): Promise<void> {
  if (!isSpeechAvailable()) {
    // Try Google TTS as fallback
    return speakWithGoogleTTS(text);
  }

  // Wait for voices to be populated
  await ensureVoicesLoaded();

  const voice = getIndianVoice();

  // If no Indian voice is installed, try Google TTS
  if (!voice) {
    return speakWithGoogleTTS(text);
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  return new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Use the detected voice's language
    utterance.lang = voice.lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.voice = voice;

    // Safety timeout — Chrome sometimes never fires onend/onerror
    const timeout = setTimeout(() => resolve(), 6000);

    utterance.onend = () => {
      clearTimeout(timeout);
      resolve();
    };
    utterance.onerror = (e) => {
      clearTimeout(timeout);
      if (e.error === "interrupted" || e.error === "canceled") {
        resolve();
      } else {
        // Fall back to Google TTS
        speakWithGoogleTTS(text).then(resolve).catch(() => reject(e));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Call once on mount to warm the voice cache.
 */
export function preloadVoices(): void {
  if (!isSpeechAvailable()) return;
  ensureVoicesLoaded().then(() => {
    cachedVoice = null;
    getIndianVoice();
    isIndianVoiceAvailable();
  });
}
