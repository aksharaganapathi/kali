/**
 * Helper to validate if a generated Kannada text is fully decodable
 * based on the user's mastered characters list.
 * 
 * Kannada unicode structure:
 * - Base consonants: e.g. ಕ, ನ
 * - Vowels: e.g. ಅ, ಆ
 * - Vowel signs: e.g. ಾ, ಿ
 * - Vattus: e.g. ್ಮ, ್ಯ (represented as halant \u0CCD + consonant)
 * - Yogavaahas: e.g. ಂ, ಃ
 */
export function isTextDecodable(text: string, masteredCharacters: string[]): boolean {
  const masteredSet = new Set(masteredCharacters);
  
  // Characters that are always allowed (punctuation, common whitespace, digits)
  const alwaysAllowed = new Set([
    " ", "\t", "\n", "\r", 
    ".", ",", "?", "!", "-", "_", ":", ";", "(", ")", "[", "]", "{", "}", "\"", "'",
    // Kannada digits & western digits
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"
  ]);

  let i = 0;
  while (i < text.length) {
    const char = text[i];

    if (alwaysAllowed.has(char)) {
      i++;
      continue;
    }

    // Check for vattu (virama \u0CCD followed by another consonant)
    if (char === "\u0CCD" && i + 1 < text.length) {
      const nextChar = text[i + 1];
      const vattuGlyph = "\u0CCD" + nextChar;
      
      // The user must have mastered the specific vattu shape (e.g. "್ಮ")
      if (masteredSet.has(vattuGlyph)) {
        i += 2;
        continue;
      }
    }

    // Check standard character (vowel, consonant, vowel sign, anusvara, visarga, etc.)
    if (masteredSet.has(char)) {
      i++;
      continue;
    }

    // If it is anusvara or visarga attached to a learned letter:
    // e.g. ಅ೦ is actually two characters: ಅ and ಂ.
    // If the user has mastered the anusvara/visarga character itself, they can read it.
    // In curriculum.ts, anusvara is represented in "ಅಂ" which is separate. 
    // Let's make sure we also allow ಂ and ಃ if the user unlocked Level 1 (which introduces ಅಂ and ಅಃ).
    if ((char === "ಂ" && masteredSet.has("ಅಂ")) || (char === "ಃ" && masteredSet.has("ಅಃ"))) {
      i++;
      continue;
    }

    // Found an unlearned character or modifier
    return false;
  }

  return true;
}
