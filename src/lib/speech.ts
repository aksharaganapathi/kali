export function isSpeechAvailable(): boolean {
  // Sarvam is always available (key is server-side); we only need a browser context
  return typeof window !== "undefined";
}

async function speakWithSarvam(text: string): Promise<void> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sarvam TTS error: ${err}`);
  }

  const data = await res.json() as { audios: string[] };
  const base64Audio = data.audios?.[0];
  if (!base64Audio) {
    throw new Error("No audio returned from Sarvam TTS");
  }

  // Decode base64 → Blob → Object URL → play
  const binary = atob(base64Audio);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      audio.pause();
      URL.revokeObjectURL(url);
      resolve();
    }, 10000);

    audio.onended = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };

    audio.play().catch((err) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(err);
    });
  });
}

export async function speak(text: string): Promise<void> {
  return speakWithSarvam(text);
}

export function preloadVoices(): void {}
