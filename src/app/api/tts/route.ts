import { NextResponse } from "next/server";

function deprecated() {
  return NextResponse.json(
    {
      error: "Deprecated",
      message: "This endpoint was retired. Speech now uses local FreeTTS-generated MP3 assets.",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET() {
  return deprecated();
}

export async function POST() {
  return deprecated();
}
