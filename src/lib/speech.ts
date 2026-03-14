import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
}

let _client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
  if (!_client) {
    _client = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
    });
  }
  return _client;
}

async function speakWithElevenLabs(text: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "";

  if (!apiKey) {
    console.warn("ElevenLabs API Key missing in environment variables.");
    throw new Error("Missing API Key");
  }

  const client = getClient();

  const stream = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_v3",
    languageCode: "kn",
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.2,
    },
  });

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
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
      reject(new Error("Audio playback blocked"));
    };

    audio.play().catch((err) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(err);
    });
  });
}

export async function speak(text: string): Promise<void> {
  return speakWithElevenLabs(text);
}

/**
 * Kept for compatibility with existing app initialization.
 */
export function preloadVoices(): void {
  // ElevenLabs-only mode does not require local voice warm-up.
}
