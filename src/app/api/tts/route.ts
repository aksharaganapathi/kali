import { NextRequest, NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 500;

// Only POST is supported
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // Validate Content-Type
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TTS service not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body === "object" && body !== null && "text" in body
    ? (body as { text: unknown }).text
    : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Missing or empty text" }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      text: text.trim(),
      model: "bulbul:v2",
      speaker: "anushka",
      target_language_code: "kn-IN",
      pace: 0.5,
    }),
  });

  if (!res.ok) {
    // Do NOT forward raw upstream error bodies — they may leak internal details
    const status = res.status;
    if (status === 429) {
      return NextResponse.json({ error: "TTS rate limit reached, please try again later" }, { status: 429 });
    }
    if (status >= 400 && status < 500) {
      return NextResponse.json({ error: "Invalid TTS request" }, { status: 400 });
    }
    return NextResponse.json({ error: "TTS service error" }, { status: 502 });
  }

  const data = await res.json() as { request_id: string; audios: string[] };
  return NextResponse.json(data);
}
