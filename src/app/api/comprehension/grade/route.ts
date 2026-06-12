import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { passage, correctTranslation, userTranslation } = await request.json() as {
      passage: string;
      correctTranslation: string;
      userTranslation: string;
    };

    if (!passage || !correctTranslation || userTranslation === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: passage, correctTranslation, userTranslation." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a warm, encouraging Kannada language tutor.
Evaluate the student's English translation of the Kannada passage by comparing it to the correct translation.

Kannada Passage:
"${passage}"

Correct English Translation:
"${correctTranslation}"

Student's Translation:
"${userTranslation}"

Provide a structured evaluation in JSON format containing:
1. "rating": One of "excellent" (almost fully correct, 90%+), "good" (got the main message correct but missed minor details, 70-89%), "partial" (got some details but missed key concepts, 40-69%), or "incorrect" (got almost everything wrong, <40%).
2. "score": An integer score from 0 to 100 based on comprehension accuracy.
3. "feedback": A paragraph in English giving constructive feedback. Praise what they got right, gently correct errors, and explain any nuances they missed.
4. "details": A breakdown of key semantic details/events from the correct translation. For each detail, provide:
   - "item": A brief description of the detail in English (e.g. "Going home", "Mother is cooking").
   - "correct": A boolean indicating if the student successfully captured this detail in their translation.

Respond strictly in JSON format. Do not include markdown codeblocks (e.g. \`\`\`json). The response must be a single, valid JSON object with keys:
{
  "rating": "excellent" | "good" | "partial" | "incorrect",
  "score": number,
  "feedback": "string",
  "details": [
    { "item": "string", "correct": boolean }
  ]
}`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Grade my translation." }
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API returned status: ${response.status}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Received empty completion from Nvidia NIM.");

    const jsonText = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API error in grade route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
