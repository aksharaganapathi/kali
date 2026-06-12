import { NextResponse } from "next/server";
import { DICTIONARY } from "@/lib/dictionary";

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

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server. Please add it to your .env file." },
        { status: 500 }
      );
    }

    // Compile list of real, decodable words for this user's current mastered set
    const masteredSet = new Set(masteredCharacters);
    const decodableWords = DICTIONARY.filter((word) => {
      // Every character/modifier of the word must be in the mastered set
      return word.requiredChars.every((c) => masteredSet.has(c));
    }).map((word) => word.kannada);

    // Shuffle and select a random subset of 25 words to maximize variety in generated stories
    const shuffledWords = [...decodableWords].sort(() => Math.random() - 0.5);
    const wordSubset = shuffledWords.slice(0, 25);

    const allowedListString = masteredCharacters.join(", ");
    const decodableWordsString = wordSubset.join(", ");

    const lengthGuideline = levelId <= 3 
      ? "Write exactly 1 or 2 short sentences." 
      : "Write a short paragraph of 3 to 5 sentences.";

    const vocabularyGuideline = decodableWords.length > 0
      ? `CRITICAL CONSTRAINT: You are ONLY allowed to build sentences using the exact words in the following list: [${decodableWordsString}]. 
DO NOT add any suffixes, prefixes, grammatical endings, or characters to these words. You must only combine them using spaces and standard punctuation (periods or commas) to form simple, logical sentences.
Example of a valid sentence: "ಮಗ ಈಗ ನಗು. ತಾತ ಸದಾ ನಗು."`
      : "Since the student only knows individual characters/vowels, you can output a simple sequence of these characters to form basic sounds.";

    const systemPrompt = `You are a professional Kannada language tutor.
The student is learning Kannada step-by-step. They have only unlocked a limited set of letters.

CRITICAL INSTRUCTION: You MUST write a short reading comprehension passage using ONLY the characters (letters, vowel signs, structural markings, and vattus) present in the following list:
[${allowedListString}]

DO NOT use any other Kannada consonants, vowels, vowel signs, virama, or vattu conjunct subscripts. Double check every single letter in your generated text.

${vocabularyGuideline}

${lengthGuideline}

Respond strictly in JSON format. Do not include markdown codeblocks (e.g. \`\`\`json). The response must be a single, valid JSON object with the exact keys:
{
  "kannada": "The generated Kannada passage",
  "english": "Detailed English translation of the passage",
  "romanization": "Space-separated romanized pronunciation of the Kannada text"
}`;

    const userPrompt = decodableWords.length > 0
      ? `Generate a Kannada reading comprehension passage.
CRITICAL CONSTRAINTS:
1. You MUST ONLY use the allowed characters: [${allowedListString}]
2. You MUST ONLY build sentences using the exact words in this list: [${decodableWordsString}]. DO NOT use any other words, prefixes, suffixes, or vowel signs.
3. ${lengthGuideline}
Example: "ಮಗ ಈಗ ನಗು. ತಾತ ಸದಾ ನಗು."`
      : `Generate a short pattern of Kannada sounds.
CRITICAL CONSTRAINTS:
1. You MUST ONLY use the characters present in this list: [${allowedListString}]
2. Output a simple sequence of these characters to form basic sounds.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status: ${response.status}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Received empty completion from Groq API.");

    // Robust JSON extraction using regex to capture everything between curly braces
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : content;
    
    // Sanitize: Replace literal line breaks/carriage returns with spaces to prevent JSON parser crashing on raw newlines inside strings
    const sanitizedJson = jsonText.replace(/[\n\r]/g, " ");
    
    const parsed = JSON.parse(sanitizedJson) as {
      kannada: string;
      english: string;
      romanization: string;
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API error in generate route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
