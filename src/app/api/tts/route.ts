import { NextRequest, NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 500;
const IS_PROD = process.env.NODE_ENV === "production";
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_AUDIO_PARTS = 4;
const MAX_AUDIO_TOTAL_CHARS = 2_000_000;

function debugLog(message: string, data?: Record<string, unknown>) {
  if (!IS_PROD) {
    console.debug(message, data ?? {});
  }
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

// Only POST is supported
export async function GET() {
  return jsonNoStore({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // Validate Content-Type
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return jsonNoStore({ error: "TTS service not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body === "object" && body !== null && "text" in body
    ? (body as { text: unknown }).text
    : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return jsonNoStore({ error: "Missing or empty text" }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return jsonNoStore(
      { error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const requestPayload = {
    text: text.trim(),
    model: "bulbul:v3",
    speaker: "shubh",
    target_language_code: "kn-IN",
    pace: 1.0,
    speech_sample_rate: 24000,
  };

  debugLog("[TTS API] request", {
    textLength: requestPayload.text.length,
    textPreview: requestPayload.text.slice(0, 32),
    model: requestPayload.model,
    speaker: requestPayload.speaker,
    targetLanguageCode: requestPayload.target_language_code,
  });

  let res: Response;
  try {
    res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.error("[TTS API] upstream timeout", { timeoutMs: UPSTREAM_TIMEOUT_MS });
      return jsonNoStore({ error: "TTS service timed out" }, { status: 504 });
    }

    console.error("[TTS API] network failure", error);
    return jsonNoStore({ error: "TTS service unreachable" }, { status: 502 });
  }

  if (!res.ok) {
    // Do NOT forward raw upstream error bodies — they may leak internal details
    const status = res.status;
    if (status === 429) {
      return jsonNoStore({ error: "TTS rate limit reached, please try again later" }, { status: 429 });
    }
    if (status >= 400 && status < 500) {
      return jsonNoStore({ error: "Invalid TTS request" }, { status: 400 });
    }
    return jsonNoStore({ error: "TTS service error" }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch (error) {
    console.error("[TTS API] invalid JSON response", error);
    return jsonNoStore({ error: "Invalid TTS response" }, { status: 502 });
  }

  if (!data || typeof data !== "object") {
    console.error("[TTS API] unexpected response type", { type: typeof data });
    return jsonNoStore({ error: "Invalid TTS response" }, { status: 502 });
  }

  const audios = (data as { audios?: unknown }).audios;
  if (!Array.isArray(audios) || audios.length === 0) {
    console.error("[TTS API] invalid audio payload", {
      audiosType: Array.isArray(audios) ? "array" : typeof audios,
      audiosLength: Array.isArray(audios) ? audios.length : undefined,
    });
    return jsonNoStore({ error: "Invalid TTS audio data" }, { status: 502 });
  }

  if (audios.length > MAX_AUDIO_PARTS) {
    console.error("[TTS API] audio payload exceeded parts limit", {
      maxAllowed: MAX_AUDIO_PARTS,
      received: audios.length,
    });
    return jsonNoStore({ error: "Invalid TTS audio data" }, { status: 502 });
  }

  if (audios.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) {
    console.error("[TTS API] invalid audio chunks", {
      chunkTypes: audios.map((entry) => typeof entry),
    });
    return jsonNoStore({ error: "Invalid TTS audio data" }, { status: 502 });
  }

  const sanitizedAudios = (audios as string[]).map((audio) => audio.trim());
  const totalChars = sanitizedAudios.reduce((sum, audio) => sum + audio.length, 0);
  if (totalChars > MAX_AUDIO_TOTAL_CHARS) {
    console.error("[TTS API] audio payload exceeded size limit", {
      maxChars: MAX_AUDIO_TOTAL_CHARS,
      receivedChars: totalChars,
    });
    return jsonNoStore({ error: "Invalid TTS audio data" }, { status: 502 });
  }

  const requestId = typeof (data as { request_id?: unknown }).request_id === "string"
    ? (data as { request_id: string }).request_id
    : undefined;

  return jsonNoStore(requestId
    ? { request_id: requestId, audios: sanitizedAudios }
    : { audios: sanitizedAudios });
}
