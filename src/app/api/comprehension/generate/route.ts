import { NextResponse } from "next/server";
import { isTextDecodable } from "@/lib/comprehensionValidator";

export const maxDuration = 30; // next.js runtime limit

export async function POST(request: Request) {
  try {
    const { masteredCharacters, levelId } = await request.json() as {
      masteredCharacters: string[];
      levelId: number;
    };

    if (!masteredCharacters || !Array.isArray(masteredCharacters) || masteredCharacters.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty masteredCharacters list." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured on the server. Please add it to your .env file." },
        { status: 500 }
      );
    }

    const maxRetries = 3;
    let attempts = 0;
    let passageData = null;

    // Allowed punctuation/special characters for prompt reference
    const allowedListString = masteredCharacters.join(", ");
    const lengthGuideline = levelId <= 3 
      ? "Write exactly 1 or 2 short sentences." 
      : "Write a short paragraph of 3 to 5 sentences.";

    const systemPrompt = `You are a professional Kannada language tutor.
The student is learning Kannada step-by-step. They have only unlocked a limited set of letters.

CRITICAL INSTRUCTION: You MUST write a short reading comprehension passage using ONLY the characters (letters, vowel signs, structural markings, and vattus) present in the following list:
[${allowedListString}]

DO NOT use any other Kannada consonants, vowels, vowel signs (matras), virama/halant (್), or vattu conjunct subscripts that are not in the list. Double check every single letter in your generated text.

${lengthGuideline}

Respond strictly in JSON format. Do not include markdown codeblocks (e.g. \`\`\`json). The response must be a single, valid JSON object with the exact keys:
{
  "kannada": "The generated Kannada passage",
  "english": "Detailed English translation of the passage",
  "romanization": "Space-separated romanized pronunciation of the Kannada text"
}`;

    while (attempts < maxRetries) {
      attempts++;
      try {
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
              { role: "user", content: "Generate a reading comprehension passage." }
            ],
            temperature: 0.1, // low temperature for high instruction adherence
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

        // Strip markdown code block wrappers if the model included them
        const jsonText = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(jsonText) as {
          kannada: string;
          english: string;
          romanization: string;
        };

        if (parsed.kannada && isTextDecodable(parsed.kannada, masteredCharacters)) {
          passageData = parsed;
          break; // Validation passed!
        }
      } catch (err) {
        console.warn(`Attempt ${attempts} failed:`, err);
      }
    }

    const FALLBACK_PASSAGES = [
      {
        kannada: "ಮಗ ಈಗ ನಗು. ತಾತ ಸದಾ ನಗು.",
        english: "Son, smile now. Grandfather always smiles.",
        romanization: "maga eega nagu. taata sadaa nagu."
      },
      {
        kannada: "ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ.",
        english: "I am going home.",
        romanization: "naanu manege hoogutteene."
      },
      {
        kannada: "ನೀನು ನೀರು ಕುಡಿ. ಅವನು ಹಣ್ಣು ತಿನ್ನುತ್ತಾನೆ.",
        english: "You, drink water. He is eating fruit.",
        romanization: "neenu neeru kudi. avan hannu tinnuttaane."
      }
    ];

    if (!passageData) {
      const decodableFallback = FALLBACK_PASSAGES.find(p => isTextDecodable(p.kannada, masteredCharacters));
      if (decodableFallback) {
        passageData = decodableFallback;
      }
    }

    if (!passageData) {
      return NextResponse.json(
        { 
          error: "Failed to generate a passage that strictly adheres to your unlocked characters after multiple attempts. Please try again."
        },
        { status: 502 }
      );
    }

    return NextResponse.json(passageData);
  } catch (error) {
    console.error("API error in generate route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
