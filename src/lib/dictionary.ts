import { WordEntry, WordCategory, LevelId } from "@/types";

const LEVEL_ORDER: LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type RawWordEntry = Omit<WordEntry, "minLevel" | "category"> & {
  minLevel: number;
  category?: WordCategory;
};

/** Maps individual characters to the level that introduces them. */
const CHAR_LEVEL: Map<string, LevelId> = new Map([
  // L1: Core Vowels
  ...["ಅ","ಆ","ಇ","ಈ","ಉ","ಊ","ಎ","ಏ","ಒ","ಓ"].map(c => [c, 1 as LevelId] as const),
  // L2: HF Consonants
  ...["ಕ","ನ","ರ","ಲ","ತ","ದ","ಮ","ಸ","ಹ","ಗ"].map(c => [c, 2 as LevelId] as const),
  // L3: Core Kagunita
  ...["ಾ","ಿ","ು"].map(c => [c, 3 as LevelId] as const),
  // L4: Extended Consonants
  ...["ಪ","ಬ","ಜ","ಚ","ಯ","ವ"].map(c => [c, 4 as LevelId] as const),
  // L5: Remaining Kagunita
  ...["ೀ","ೂ","ೆ","ೇ","ೈ","ೊ","ೋ","ೌ","ೃ"].map(c => [c, 5 as LevelId] as const),
  // L6: Anusvara + Visarga
  ...["ಂ","ಃ"].map(c => [c, 6 as LevelId] as const),
  // L7: Aspirated
  ...["ಖ","ಘ","ಛ","ಝ","ಥ","ಧ","ಫ","ಭ"].map(c => [c, 7 as LevelId] as const),
  // L8: Retroflexes
  ...["ಟ","ಠ","ಡ","ಢ","ಣ","ಳ"].map(c => [c, 8 as LevelId] as const),
  // L9: Sibilants + Rare Vowels
  ...["ಶ","ಷ","ಋ","ಐ","ಔ"].map(c => [c, 9 as LevelId] as const),
]);

function charLevelRank(char: string): number {
  const lvl = CHAR_LEVEL.get(char);
  return lvl !== undefined ? LEVEL_ORDER.indexOf(lvl) : LEVEL_ORDER.length;
}

function levelRank(level: LevelId): number {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? idx : LEVEL_ORDER.length;
}

/**
 * Computes the minimum level needed to decode a word by checking EVERY character.
 * This ensures words like "ನೀನು" aren't shown until vowel signs (L3/L5) are mastered.
 */
function recategorizeLevel(entry: RawWordEntry): LevelId {
  if (entry.kannada.includes("\u0CCD")) return 11;
  
  let maxRank = 0;
  const allChars = entry.kannada.split(""); 
  
  for (const char of allChars) {
    const rank = charLevelRank(char);
    if (rank > maxRank) maxRank = rank;
  }
  return LEVEL_ORDER[maxRank] ?? 10;
}

function inferCategory(entry: RawWordEntry): WordCategory {
  if (entry.category) return entry.category;

  const text = `${entry.meaning} ${entry.romanization}`.toLowerCase();

  if (/(mother|father|brother|sister|son|daughter|family|child|children|baby|people)/.test(text)) return "Family";
  if (/(rice|lentil|salt|sugar|coffee|meal|cook|cooking|kitchen|flour|vegetable|drink|milk|honey|fruit|apple|mango)/.test(text)) return "Kitchen";
  if (/(eat|drink|walk|go|come|read|write|learn|play|sleep|hold|wash|tell|listen|ask|pour|do|make|work|join)/.test(text)) return "Actions";
  if (/(river|ocean|mountain|forest|tree|flower|wind|sun|moon|star|sky|earth|rain|cloud|nature|plant|leaf|root|lake)/.test(text)) return "Nature";
  if (/(car|bus|road|door|book|table|wall|school|temple|lamp|picture|story|lesson|wheel|pond|house|city|country|place)/.test(text)) return "Objects";
  if (/(head|eye|ear|mouth|nose|face|stomach|leg|hand)/.test(text)) return "Body";
  if (/(red|blue|green|white|black|colour|color)/.test(text)) return "Colors";
  if (/(one|two|three|four|five|six|seven|hundred|thousand|number)/.test(text)) return "Numbers";
  if (/(yes|no|what|why|who|where|hello|greeting|thank|worship|festival|freedom|victory|music|dance|language|india|karnataka|mysore|bangalore)/.test(text)) return "Culture";
  if (/(government|knowledge|teacher|poet|life|death|memory|time|week|month|night|morning|day|journey|health|success|friendship|love|happiness)/.test(text)) return "Abstract";
  if (/(big|small|long|new|old|hard|soft|good|bad|hot|cold|sweet|bitter)/.test(text)) return "Descriptors";

  return "Objects";
}

const RAW_DICTIONARY: RawWordEntry[] = [
  /* ───────────────────────────────────────────────────────────
   * Level 1 — Pure Vowels
   * ─────────────────────────────────────────────────────────── */
  { kannada: "ಆ", romanization: "aa", meaning: "that", requiredChars: ["ಆ"], minLevel: 1, category: "Abstract" },
  { kannada: "ಈ", romanization: "ee", meaning: "this", requiredChars: ["ಈ"], minLevel: 1, category: "Abstract" },

  /* ───────────────────────────────────────────────────────────
   * Standard Vocabulary
   * ─────────────────────────────────────────────────────────── */
  { kannada: "ಆಗ", romanization: "aaga", meaning: "then / that time", requiredChars: ["ಆ", "ಗ"], minLevel: 2 },
  { kannada: "ಈಗ", romanization: "eega", meaning: "now", requiredChars: ["ಈ", "ಗ"], minLevel: 2 },
  { kannada: "ನಾನು", romanization: "naanu", meaning: "I / me", requiredChars: ["ನ", "ಾ", "ು"], minLevel: 3 },
  { kannada: "ನೀನು", romanization: "neenu", meaning: "you (singular)", requiredChars: ["ನ", "ೀ", "ು"], minLevel: 5 },
  { kannada: "ಅವನು", romanization: "avanu", meaning: "he", requiredChars: ["ಅ", "ವ", "ನ", "ು"], minLevel: 4 },
  { kannada: "ಇವನು", romanization: "ivanu", meaning: "he (this person)", requiredChars: ["ಇ", "ವ", "ನ", "ು"], minLevel: 4 },
  { kannada: "ನಾವು", romanization: "naavu", meaning: "we", requiredChars: ["ನ", "ಾ", "ವ", "ು"], minLevel: 4 },
  { kannada: "ನೀವು", romanization: "neevu", meaning: "you (plural)", requiredChars: ["ನ", "ೀ", "ವ", "ು"], minLevel: 5 },
  { kannada: "ಪಾಪ", romanization: "paapa", meaning: "pity / sin", requiredChars: ["ಪ", "ಾ"], minLevel: 4 },
  { kannada: "ಬೇಗ", romanization: "baega", meaning: "quickly", requiredChars: ["ಬ", "ೇ", "ಗ"], minLevel: 5 },
  { kannada: "ಸದಾ", romanization: "sadaa", meaning: "always", requiredChars: ["ಸ", "ದ", "ಾ"], minLevel: 3 },
  { kannada: "ಜಗ", romanization: "jaga", meaning: "world", requiredChars: ["ಜ", "ಗ"], minLevel: 4 },
  { kannada: "ಲಯ", romanization: "laya", meaning: "rhythm", requiredChars: ["ಲ", "ಯ"], minLevel: 4 },
  { kannada: "ರಂಜನ", romanization: "ranjana", meaning: "entertainment", requiredChars: ["ರ", "ಂ", "ಜ", "ನ"], minLevel: 6 },
  { kannada: "ನಾಯಕ", romanization: "naayaka", meaning: "leader / hero", requiredChars: ["ನ", "ಾ", "ಯ", "ಕ"], minLevel: 4 },
  { kannada: "ಹಾರ", romanization: "haara", meaning: "garland / necklace", requiredChars: ["ಹ", "ಾ", "ರ"], minLevel: 3 },
  { kannada: "ಗಾನ", romanization: "gaana", meaning: "song / music", requiredChars: ["ಗ", "ಾ", "ನ"], minLevel: 3 },
  { kannada: "ಕಾಗೆ", romanization: "kaage", meaning: "crow", requiredChars: ["ಕ", "ಾ", "ಗ", "ೆ"], minLevel: 5 },
  { kannada: "ಬಾವಿ", romanization: "baavi", meaning: "well (water)", requiredChars: ["ಬ", "ಾ", "ವ", "ಿ"], minLevel: 4 },
  { kannada: "ಬೀದಿ", romanization: "beedi", meaning: "street", requiredChars: ["ಬ", "ೀ", "ದ", "ಿ"], minLevel: 5 },
  { kannada: "ದಾಹ", romanization: "daaha", meaning: "thirst", requiredChars: ["ದ", "ಾ", "ಹ"], minLevel: 3 },
  { kannada: "ಮಾಮ", romanization: "maama", meaning: "uncle", requiredChars: ["ಮ", "ಾ"], minLevel: 3 },
  { kannada: "ಕಾಕಾ", romanization: "kaakaa", meaning: "uncle", requiredChars: ["ಕ", "ಾ"], minLevel: 3 },
  { kannada: "ನಮನ", romanization: "namana", meaning: "bow / salute", requiredChars: ["ನ", "ಮ"], minLevel: 2 },
  { kannada: "ಮನ", romanization: "mana", meaning: "mind", requiredChars: ["ಮ", "ನ"], minLevel: 2 },
  { kannada: "ವನ", romanization: "vana", meaning: "forest", requiredChars: ["ವ", "ನ"], minLevel: 4 },
  { kannada: "ಜನ", romanization: "jana", meaning: "people", requiredChars: ["ಜ", "ನ"], minLevel: 4 },
  { kannada: "ಬಲ", romanization: "bala", meaning: "strength", requiredChars: ["ಬ", "ಲ"], minLevel: 4 },
  { kannada: "ಮರ", romanization: "mara", meaning: "tree", requiredChars: ["ಮ", "ರ"], minLevel: 2 },
  { kannada: "ಕರ", romanization: "kara", meaning: "hand / do", requiredChars: ["ಕ", "ರ"], minLevel: 2 },
  { kannada: "ಸರ", romanization: "sara", meaning: "line / chain", requiredChars: ["ಸ", "ರ"], minLevel: 2 },
  { kannada: "ಪರ", romanization: "para", meaning: "other", requiredChars: ["ಪ", "ರ"], minLevel: 4 },
  { kannada: "ತರ", romanization: "tara", meaning: "like / kind", requiredChars: ["ತ", "ರ"], minLevel: 2 },
  { kannada: "ದಯ", romanization: "daya", meaning: "kindness", requiredChars: ["ದ", "ಯ"], minLevel: 4 },
  { kannada: "ಜಲ", romanization: "jala", meaning: "water", requiredChars: ["ಜ", "ಲ"], minLevel: 4 },
  { kannada: "ಗಜ", romanization: "gaja", meaning: "elephant", requiredChars: ["ಗ", "ಜ"], minLevel: 4 },
  { kannada: "ನಗ", romanization: "naga", meaning: "serpent / mountain", requiredChars: ["ನ", "ಗ"], minLevel: 2 },
  { kannada: "ರವ", romanization: "rava", meaning: "sound", requiredChars: ["ರ", "ವ"], minLevel: 4 },
  { kannada: "ಹರ", romanization: "hara", meaning: "garland / Shiva", requiredChars: ["ಹ", "ರ"], minLevel: 2 },
  { kannada: "ಸಮ", romanization: "sama", meaning: "equal", requiredChars: ["ಸ", "ಮ"], minLevel: 2 },
  { kannada: "ಕಲ", romanization: "kala", meaning: "art / skill", requiredChars: ["ಕ", "ಲ"], minLevel: 2 },
  { kannada: "ಬರ", romanization: "bara", meaning: "famine / drought", requiredChars: ["ಬ", "ರ"], minLevel: 4 },
  { kannada: "ಪದ", romanization: "pada", meaning: "word / foot", requiredChars: ["ಪ", "ದ"], minLevel: 4 },
  { kannada: "ಕಮಲ", romanization: "kamala", meaning: "lotus", requiredChars: ["ಕ", "ಮ", "ಲ"], minLevel: 2 },
  { kannada: "ನಗರ", romanization: "nagara", meaning: "city", requiredChars: ["ನ", "ಗ", "ರ"], minLevel: 2 },
  { kannada: "ನೀರು", romanization: "neeru", meaning: "water", requiredChars: ["ನ", "ೀ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಕಾಲ", romanization: "kaala", meaning: "time / era", requiredChars: ["ಕ", "ಾ", "ಲ"], minLevel: 3 },
  { kannada: "ಮನೆ", romanization: "mane", meaning: "house", requiredChars: ["ಮ", "ನ", "ೆ"], minLevel: 5 },
  { kannada: "ಹಣ", romanization: "hana", meaning: "money", requiredChars: ["ಹ", "ಣ"], minLevel: 8 },
  { kannada: "ಹಾಲು", romanization: "haalu", meaning: "milk", requiredChars: ["ಹ", "ಾ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಬೆಳೆ", romanization: "bele", meaning: "crop / grow", requiredChars: ["ಬ", "ೆ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ಕೈ", romanization: "kai", meaning: "hand", requiredChars: ["ಕ", "ೈ"], minLevel: 9 },
  { kannada: "ನಾಯಿ", romanization: "naayi", meaning: "dog", requiredChars: ["ನ", "ಾ", "ಯ", "ಿ"], minLevel: 4 },
  { kannada: "ಹೂವು", romanization: "huuvu", meaning: "flower", requiredChars: ["ಹ", "ೂ", "ವ", "ು"], minLevel: 5 },
  { kannada: "ಮೀನು", romanization: "meenu", meaning: "fish", requiredChars: ["ಮ", "ೀ", "ನ", "ು"], minLevel: 5 },
  { kannada: "ಬೆಕ್ಕು", romanization: "bekku", meaning: "cat", requiredChars: ["ಬ", "ೆ", "ಕ", "ು"], minLevel: 5 },
  { kannada: "ಮಳೆ", romanization: "male", meaning: "rain", requiredChars: ["ಮ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ಬೆಳಕು", romanization: "belaku", meaning: "light", requiredChars: ["ಬ", "ೆ", "ಳ", "ಕ", "ು"], minLevel: 8 },
  { kannada: "ಕಣ್ಣು", romanization: "kannu", meaning: "eye", requiredChars: ["ಕ", "ಣ", "ು"], minLevel: 8 },
  { kannada: "ಹಸಿವು", romanization: "hasivu", meaning: "hunger", requiredChars: ["ಹ", "ಸ", "ಿ", "ವ", "ು"], minLevel: 4 },
  { kannada: "ಮಾತು", romanization: "maatu", meaning: "word / speech", requiredChars: ["ಮ", "ಾ", "ತ", "ು"], minLevel: 3 },
  { kannada: "ರಾಜ", romanization: "raaja", meaning: "king", requiredChars: ["ರ", "ಾ", "ಜ"], minLevel: 4 },
  { kannada: "ಗಾಳಿ", romanization: "gaali", meaning: "wind", requiredChars: ["ಗ", "ಾ", "ಳ", "ಿ"], minLevel: 8 },
  { kannada: "ಊರು", romanization: "ooru", meaning: "town / village", requiredChars: ["ಊ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಾಗಿಲು", romanization: "baagilu", meaning: "door", requiredChars: ["ಬ", "ಾ", "ಗ", "ಿ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಮೊಲ", romanization: "mola", meaning: "rabbit", requiredChars: ["ಮ", "ೊ", "ಲ"], minLevel: 5 },
  { kannada: "ಕೊಡ", romanization: "koda", meaning: "give", requiredChars: ["ಕ", "ೊ", "ಡ"], minLevel: 8 },
  { kannada: "ಹಾವು", romanization: "haavu", meaning: "snake", requiredChars: ["ಹ", "ಾ", "ವ", "ು"], minLevel: 4 },
  { kannada: "ನಾಡು", romanization: "naadu", meaning: "land / country", requiredChars: ["ನ", "ಾ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಹಾಡು", romanization: "haadu", meaning: "song", requiredChars: ["ಹ", "ಾ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಸೂರ್ಯ", romanization: "suurya", meaning: "sun", requiredChars: ["ಸ", "ೂ", "ರ", "ಯ"], minLevel: 5 },
  { kannada: "ಕವಿ", romanization: "kavi", meaning: "poet", requiredChars: ["ಕ", "ವ", "ಿ"], minLevel: 4 },
  { kannada: "ಗುರು", romanization: "guru", meaning: "teacher", requiredChars: ["ಗ", "ು", "ರ", "ು"], minLevel: 3 },
  { kannada: "ದೇವ", romanization: "deva", meaning: "god", requiredChars: ["ದ", "ೇ", "ವ"], minLevel: 5 },
  { kannada: "ಪುಸ್ತಕ", romanization: "pustaka", meaning: "book", requiredChars: ["ಪ", "ು", "ಸ", "ತ", "ಕ"], minLevel: 5 },
  { kannada: "ಹಕ್ಕಿ", romanization: "hakki", meaning: "bird", requiredChars: ["ಹ", "ಕ", "ಿ"], minLevel: 5 },
  { kannada: "ಬೆಟ್ಟ", romanization: "betta", meaning: "hill", requiredChars: ["ಬ", "ೆ", "ಟ"], minLevel: 8 },
  { kannada: "ಮಗು", romanization: "magu", meaning: "child", requiredChars: ["ಮ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಬೀಜ", romanization: "beeja", meaning: "seed", requiredChars: ["ಬ", "ೀ", "ಜ"], minLevel: 5 },
  { kannada: "ಸೀರೆ", romanization: "seere", meaning: "saree", requiredChars: ["ಸ", "ೀ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಗೋಡೆ", romanization: "goode", meaning: "wall", requiredChars: ["ಗ", "ೋ", "ಡ", "ೆ"], minLevel: 8 },
  { kannada: "ಕೆರೆ", romanization: "kere", meaning: "lake", requiredChars: ["ಕ", "ೆ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಮೇಜು", romanization: "meju", meaning: "table", requiredChars: ["ಮ", "ೇ", "ಜ", "ು"], minLevel: 5 },
  { kannada: "ಕುರಿ", romanization: "kuri", meaning: "sheep", requiredChars: ["ಕ", "ು", "ರ", "ಿ"], minLevel: 3 },
  { kannada: "ಬಟ್ಟೆ", romanization: "batte", meaning: "cloth", requiredChars: ["ಬ", "ಟ", "ೆ"], minLevel: 8 },
  { kannada: "ಕಿವಿ", romanization: "kivi", meaning: "ear", requiredChars: ["ಕ", "ಿ", "ವ", "ಿ"], minLevel: 4 },
  { kannada: "ಹಣ್ಣು", romanization: "hannu", meaning: "fruit", requiredChars: ["ಹ", "ಣ", "ು"], minLevel: 8 },
  { kannada: "ಬಾಳೆ", romanization: "baale", meaning: "banana", requiredChars: ["ಬ", "ಾ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ಕೂಸು", romanization: "kuusu", meaning: "baby", requiredChars: ["ಕ", "ೂ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ತಾಯಿ", romanization: "taayi", meaning: "mother", requiredChars: ["ತ", "ಾ", "ಯ", "ಿ"], minLevel: 4 },
  { kannada: "ನೀಲಿ", romanization: "neeli", meaning: "blue", requiredChars: ["ನ", "ೀ", "ಲ", "ಿ"], minLevel: 5 },
  { kannada: "ಕೆಂಪು", romanization: "kempu", meaning: "red", requiredChars: ["ಕ", "ೆ", "ಪ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಹಸಿರು", romanization: "hasiru", meaning: "green", requiredChars: ["ಹ", "ಸ", "ಿ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಿಳಿ", romanization: "bili", meaning: "white", requiredChars: ["ಬ", "ಿ", "ಳ", "ಿ"], minLevel: 8 },
  { kannada: "ಕಪ್ಪು", romanization: "kappu", meaning: "black", requiredChars: ["ಕ", "ಪ", "ು"], minLevel: 5 },
  { kannada: "ಕಾಡು", romanization: "kaadu", meaning: "forest", requiredChars: ["ಕ", "ಾ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಜೇನು", romanization: "jaenu", meaning: "honey", requiredChars: ["ಜ", "ೇ", "ನ", "ು"], minLevel: 5 },
  { kannada: "ಹಾದಿ", romanization: "haadi", meaning: "path", requiredChars: ["ಹ", "ಾ", "ದ", "ಿ"], minLevel: 3 },
  { kannada: "ರಾತ್ರಿ", romanization: "raatri", meaning: "night", requiredChars: ["ರ", "ಾ", "ತ", "ಿ"], minLevel: 5 },
  { kannada: "ಬೆಳಗು", romanization: "belagu", meaning: "morning", requiredChars: ["ಬ", "ೆ", "ಳ", "ಗ", "ು"], minLevel: 8 },
  { kannada: "ದಿನ", romanization: "dina", meaning: "day", requiredChars: ["ದ", "ಿ", "ನ"], minLevel: 3 },
  { kannada: "ವಾರ", romanization: "vaara", meaning: "week", requiredChars: ["ವ", "ಾ", "ರ"], minLevel: 3 },
  { kannada: "ತಿಂಗಳು", romanization: "tingalu", meaning: "month / moon", requiredChars: ["ತ", "ಿ", "ಗ", "ಳ", "ು", "ಂ"], minLevel: 8 },
  { kannada: "ಮಗ", romanization: "maga", meaning: "son", requiredChars: ["ಮ", "ಗ"], minLevel: 2 },
  { kannada: "ಮಗಳು", romanization: "magalu", meaning: "daughter", requiredChars: ["ಮ", "ಗ", "ಳ", "ು"], minLevel: 8 },
  { kannada: "ಅಪ್ಪ", romanization: "appa", meaning: "father", requiredChars: ["ಅ", "ಪ"], minLevel: 5 },
  { kannada: "ಅಮ್ಮ", romanization: "amma", meaning: "mother", requiredChars: ["ಅ", "ಮ"], minLevel: 5 },
  { kannada: "ಅಕ್ಕ", romanization: "akka", meaning: "elder sister", requiredChars: ["ಅ", "ಕ"], minLevel: 5 },
  { kannada: "ಅಣ್ಣ", romanization: "anna", meaning: "elder brother", requiredChars: ["ಅ", "ಣ"], minLevel: 8 },
  { kannada: "ತಮ್ಮ", romanization: "tamma", meaning: "younger brother", requiredChars: ["ತ", "ಮ"], minLevel: 5 },
  { kannada: "ಕಾರು", romanization: "kaaru", meaning: "car", requiredChars: ["ಕ", "ಾ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಸ್ಸು", romanization: "bassu", meaning: "bus", requiredChars: ["ಬ", "ಸ", "ು"], minLevel: 5 },
  { kannada: "ರಸ್ತೆ", romanization: "raste", meaning: "road", requiredChars: ["ರ", "ಸ", "ತ", "ೆ"], minLevel: 5 },
  { kannada: "ಎಲೆ", romanization: "ele", meaning: "leaf", requiredChars: ["ಎ", "ಲ", "ೆ"], minLevel: 5 },
  { kannada: "ಬೇರು", romanization: "baeru", meaning: "root", requiredChars: ["ಬ", "ೇ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಮೋಡ", romanization: "mooda", meaning: "cloud", requiredChars: ["ಮ", "ೋ", "ಡ"], minLevel: 8 },
  { kannada: "ನೆಲ", romanization: "nela", meaning: "ground / floor", requiredChars: ["ನ", "ೆ", "ಲ"], minLevel: 5 },
  { kannada: "ಗಿಡ", romanization: "gida", meaning: "plant", requiredChars: ["ಗ", "ಿ", "ಡ"], minLevel: 8 },
  { kannada: "ಕೆಲಸ", romanization: "kelasa", meaning: "work", requiredChars: ["ಕ", "ೆ", "ಲ", "ಸ"], minLevel: 5 },
  { kannada: "ಜೀವ", romanization: "jeeva", meaning: "life", requiredChars: ["ಜ", "ೀ", "ವ"], minLevel: 5 },
  { kannada: "ಸೇಬು", romanization: "sebu", meaning: "apple", requiredChars: ["ಸ", "ೇ", "ಬ", "ು"], minLevel: 5 },
  { kannada: "ಮಾವು", romanization: "maavu", meaning: "mango tree", requiredChars: ["ಮ", "ಾ", "ವ", "ು"], minLevel: 4 },
  { kannada: "ತೆಂಗು", romanization: "tengu", meaning: "coconut", requiredChars: ["ತ", "ೆ", "ಗ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಹಸು", romanization: "hasu", meaning: "cow", requiredChars: ["ಹ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ಕುದುರೆ", romanization: "kudure", meaning: "horse", requiredChars: ["ಕ", "ು", "ದ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಆನೆ", romanization: "aane", meaning: "elephant", requiredChars: ["ಆ", "ನ", "ೆ"], minLevel: 5 },
  { kannada: "ಸಿಹಿ", romanization: "sihi", meaning: "sweet", requiredChars: ["ಸ", "ಿ", "ಹ", "ಿ"], minLevel: 3 },
  { kannada: "ಕಹಿ", romanization: "kahi", meaning: "bitter", requiredChars: ["ಕ", "ಹ", "ಿ"], minLevel: 3 },
  { kannada: "ಬಿಸಿ", romanization: "bisi", meaning: "hot", requiredChars: ["ಬ", "ಿ", "ಸ", "ಿ"], minLevel: 3 },
  { kannada: "ತಂಪು", romanization: "tampu", meaning: "cool", requiredChars: ["ತ", "ಪ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಹೊಸ", romanization: "hosa", meaning: "new", requiredChars: ["ಹ", "ೊ", "ಸ"], minLevel: 5 },
  { kannada: "ಹಳೆ", romanization: "hale", meaning: "old", requiredChars: ["ಹ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ದೊಡ್ಡ", romanization: "dodda", meaning: "big", requiredChars: ["ದ", "ೊ", "ಡ"], minLevel: 8 },
  { kannada: "ಸಣ್ಣ", romanization: "sanna", meaning: "small", requiredChars: ["ಸ", "ಣ"], minLevel: 8 },
  { kannada: "ಉದ್ದ", romanization: "udda", meaning: "long", requiredChars: ["ಉ", "ದ"], minLevel: 5 },
  { kannada: "ಗಟ್ಟಿ", romanization: "gatti", meaning: "hard / strong", requiredChars: ["ಗ", "ಟ", "ಿ"], minLevel: 8 },
  { kannada: "ಮೃದು", romanization: "mrudu", meaning: "soft", requiredChars: ["ಮ", "ೃ", "ದ", "ು"], minLevel: 5 },
  { kannada: "ಒಳ್ಳೆ", romanization: "olle", meaning: "good", requiredChars: ["ಒ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ಕೆಟ್ಟ", romanization: "ketta", meaning: "bad", requiredChars: ["ಕ", "ೆ", "ಟ"], minLevel: 8 },
  { kannada: "ನೋಡು", romanization: "noodu", meaning: "see / look", requiredChars: ["ನ", "ೋ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಕೇಳು", romanization: "kaelu", meaning: "listen / ask", requiredChars: ["ಕ", "ೇ", "ಳ", "ು"], minLevel: 8 },
  { kannada: "ಹೇಳು", romanization: "haelu", meaning: "tell / say", requiredChars: ["ಹ", "ೇ", "ಳ", "ು"], minLevel: 8 },
  { kannada: "ಮಾಡು", romanization: "maadu", meaning: "do / make", requiredChars: ["ಮ", "ಾ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಹೋಗು", romanization: "hoogu", meaning: "go", requiredChars: ["ಹ", "ೋ", "ಗ", "ು"], minLevel: 5 },
  { kannada: "ಬರು", romanization: "baru", meaning: "come", requiredChars: ["ಬ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ತಿನ್ನು", romanization: "tinnu", meaning: "eat", requiredChars: ["ತ", "ಿ", "ನ", "ು"], minLevel: 5 },
  { kannada: "ಕುಡಿ", romanization: "kudi", meaning: "drink", requiredChars: ["ಕ", "ು", "ಡ", "ಿ"], minLevel: 8 },
  { kannada: "ಓದು", romanization: "oodu", meaning: "read", requiredChars: ["ಓ", "ದ", "ು"], minLevel: 3 },
  { kannada: "ಬರೆ", romanization: "bare", meaning: "write", requiredChars: ["ಬ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಕಲಿ", romanization: "kali", meaning: "learn", requiredChars: ["ಕ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಆಡು", romanization: "aadu", meaning: "play", requiredChars: ["ಆ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ನಡೆ", romanization: "nade", meaning: "walk", requiredChars: ["ನ", "ಡ", "ೆ"], minLevel: 8 },
  { kannada: "ನಗು", romanization: "nagu", meaning: "smile / laugh", requiredChars: ["ನ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಮಲಗು", romanization: "malagu", meaning: "sleep", requiredChars: ["ಮ", "ಲ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಕೂಡು", romanization: "kuudu", meaning: "join / also", requiredChars: ["ಕ", "ೂ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಬಿಡು", romanization: "bidu", meaning: "leave / let go", requiredChars: ["ಬ", "ಿ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಹಿಡಿ", romanization: "hidi", meaning: "hold / catch", requiredChars: ["ಹ", "ಿ", "ಡ", "ಿ"], minLevel: 8 },
  { kannada: "ಸುರಿ", romanization: "suri", meaning: "pour", requiredChars: ["ಸ", "ು", "ರ", "ಿ"], minLevel: 3 },
  { kannada: "ತೊಳೆ", romanization: "tole", meaning: "wash", requiredChars: ["ತ", "ೊ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ನೆನಪು", romanization: "nenapu", meaning: "memory", requiredChars: ["ನ", "ೆ", "ಪ", "ು"], minLevel: 5 },
  { kannada: "ಸಮಯ", romanization: "samaya", meaning: "time", requiredChars: ["ಸ", "ಮ", "ಯ"], minLevel: 4 },
  { kannada: "ಜಾಗ", romanization: "jaaga", meaning: "place", requiredChars: ["ಜ", "ಾ", "ಗ"], minLevel: 4 },
  { kannada: "ಕತೆ", romanization: "kate", meaning: "story", requiredChars: ["ಕ", "ತ", "ೆ"], minLevel: 5 },
  { kannada: "ಪಾಠ", romanization: "paaTha", meaning: "lesson", requiredChars: ["ಪ", "ಾ", "ಠ"], minLevel: 8 },
  { kannada: "ಶಾಲೆ", romanization: "shaale", meaning: "school", requiredChars: ["ಶ", "ಾ", "ಲ", "ೆ"], minLevel: 9 },
  { kannada: "ಮಾರು", romanization: "maaru", meaning: "sell", requiredChars: ["ಮ", "ಾ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಕೊಳ", romanization: "kola", meaning: "pond", requiredChars: ["ಕ", "ೊ", "ಳ"], minLevel: 8 },
  { kannada: "ಅಡುಗೆ", romanization: "aduge", meaning: "cooking", requiredChars: ["ಅ", "ಡ", "ು", "ಗ", "ೆ"], minLevel: 8 },
  { kannada: "ಊಟ", romanization: "uuTa", meaning: "meal", requiredChars: ["ಊ", "ಟ"], minLevel: 8 },
  { kannada: "ಸಕ್ಕರೆ", romanization: "sakkare", meaning: "sugar", requiredChars: ["ಸ", "ಕ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಉಪ್ಪು", romanization: "uppu", meaning: "salt", requiredChars: ["ಉ", "ಪ", "ು"], minLevel: 5 },
  { kannada: "ಅಕ್ಕಿ", romanization: "akki", meaning: "rice", requiredChars: ["ಅ", "ಕ", "ಿ"], minLevel: 5 },
  { kannada: "ಬೇಳೆ", romanization: "baele", meaning: "lentil", requiredChars: ["ಬ", "ೇ", "ಳ", "ೆ"], minLevel: 8 },
  { kannada: "ತರಕಾರಿ", romanization: "tarakaari", meaning: "vegetable", requiredChars: ["ತ", "ರ", "ಕ", "ಾ", "ಿ"], minLevel: 3 },
  { kannada: "ಹಿಟ್ಟು", romanization: "hittu", meaning: "flour", requiredChars: ["ಹ", "ಿ", "ಟ", "ು"], minLevel: 8 },
  { kannada: "ಕಾಫಿ", romanization: "kaafi", meaning: "coffee", requiredChars: ["ಕ", "ಾ", "ಫ", "ಿ"], minLevel: 7 },
  { kannada: "ನೀರಾವರಿ", romanization: "neeraavari", meaning: "irrigation", requiredChars: ["ನ", "ೀ", "ರ", "ಾ", "ವ", "ಿ"], minLevel: 5 },
  { kannada: "ಭಾರತ", romanization: "bhaarata", meaning: "India", requiredChars: ["ಭ", "ಾ", "ರ", "ತ"], minLevel: 7 },
  { kannada: "ಕರ್ನಾಟಕ", romanization: "karnaaTaka", meaning: "Karnataka", requiredChars: ["ಕ", "ರ", "ನ", "ಾ", "ಟ"], minLevel: 8 },
  { kannada: "ಮೈಸೂರು", romanization: "maisuuru", meaning: "Mysore", requiredChars: ["ಮ", "ೈ", "ಸ", "ೂ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಬೆಂಗಳೂರು", romanization: "bengaluuru", meaning: "Bangalore", requiredChars: ["ಬ", "ೆ", "ಗ", "ಳ", "ೂ", "ರ", "ು", "ಂ"], minLevel: 8 },
  { kannada: "ನಮಸ್ಕಾರ", romanization: "namaskaara", meaning: "greeting / hello", requiredChars: ["ನ", "ಮ", "ಸ", "ಕ", "ಾ", "ರ"], minLevel: 2 },
  { kannada: "ಧನ್ಯವಾದ", romanization: "dhanyavaada", meaning: "thank you", requiredChars: ["ಧ", "ನ", "ಯ", "ವ", "ಾ", "ದ"], minLevel: 9 },
  { kannada: "ಹೌದು", romanization: "haudu", meaning: "yes", requiredChars: ["ಹ", "ೌ", "ದ", "ು"], minLevel: 5 },
  { kannada: "ಇಲ್ಲ", romanization: "illa", meaning: "no / not", requiredChars: ["ಇ", "ಲ"], minLevel: 2 },
  { kannada: "ಯಾಕೆ", romanization: "yaake", meaning: "why", requiredChars: ["ಯ", "ಾ", "ಕ", "ೆ"], minLevel: 5 },
  { kannada: "ಏನು", romanization: "aenu", meaning: "what", requiredChars: ["ಏ", "ನ", "ು"], minLevel: 5 },
  { kannada: "ಯಾರು", romanization: "yaaru", meaning: "who", requiredChars: ["ಯ", "ಾ", "ರ", "ು"], minLevel: 4 },
  { kannada: "ಎಲ್ಲಿ", romanization: "elli", meaning: "where", requiredChars: ["ಎ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಹೊಟ್ಟೆ", romanization: "hoTTe", meaning: "stomach", requiredChars: ["ಹ", "ೊ", "ಟ", "ೆ"], minLevel: 8 },
  { kannada: "ತಲೆ", romanization: "tale", meaning: "head", requiredChars: ["ತ", "ಲ", "ೆ"], minLevel: 5 },
  { kannada: "ಕಾಲು", romanization: "kaalu", meaning: "leg", requiredChars: ["ಕ", "ಾ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಬಾಯಿ", romanization: "baayi", meaning: "mouth", requiredChars: ["ಬ", "ಾ", "ಯ", "ಿ"], minLevel: 4 },
  { kannada: "ಮೂಗು", romanization: "muugu", meaning: "nose", requiredChars: ["ಮ", "ೂ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಮುಖ", romanization: "mukha", meaning: "face", requiredChars: ["ಮ", "ು", "ಖ"], minLevel: 7 },
  { kannada: "ಒಂದು", romanization: "ondu", meaning: "one", requiredChars: ["ಒ", "ದ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಎರಡು", romanization: "eradu", meaning: "two", requiredChars: ["ಎ", "ರ", "ಡ", "ು"], minLevel: 8 },
  { kannada: "ಮೂರು", romanization: "muuru", meaning: "three", requiredChars: ["ಮ", "ೂ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ನಾಲ್ಕು", romanization: "naalku", meaning: "four", requiredChars: ["ನ", "ಾ", "ಲ", "ಕ", "ು"], minLevel: 5 },
  { kannada: "ಐದು", romanization: "aidu", meaning: "five", requiredChars: ["ಐ", "ದ", "ು"], minLevel: 9 },
  { kannada: "ಆರು", romanization: "aaru", meaning: "six", requiredChars: ["ಆ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಏಳು", romanization: "aelu", meaning: "seven", requiredChars: ["ಏ", "ಳ", "ು"], minLevel: 8 },
  { kannada: "ನೂರು", romanization: "nuuru", meaning: "hundred", requiredChars: ["ನ", "ೂ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಸಾವಿರ", romanization: "saavira", meaning: "thousand", requiredChars: ["ಸ", "ಾ", "ವ", "ಿ", "ರ"], minLevel: 3 },
  { kannada: "ದೇಶ", romanization: "desha", meaning: "country", requiredChars: ["ದ", "ೇ", "ಶ"], minLevel: 9 },
  { kannada: "ಭಾಷೆ", romanization: "bhaashe", meaning: "language", requiredChars: ["ಭ", "ಾ", "ಷ", "ೆ"], minLevel: 9 },
  { kannada: "ಪ್ರೀತಿ", romanization: "preeti", meaning: "love", requiredChars: ["ಪ", "ರ", "ೀ", "ತ", "ಿ"], minLevel: 5 },
  { kannada: "ಸ್ನೇಹ", romanization: "sneha", meaning: "friendship", requiredChars: ["ಸ", "ನ", "ೇ", "ಹ"], minLevel: 5 },
  { kannada: "ಸಂತೋಷ", romanization: "santosha", meaning: "happiness", requiredChars: ["ಸ", "ತ", "ೋ", "ಷ", "ಂ"], minLevel: 9 },
  { kannada: "ಆಕಾಶ", romanization: "aakaasha", meaning: "sky", requiredChars: ["ಆ", "ಕ", "ಾ", "ಶ"], minLevel: 9 },
  { kannada: "ಭೂಮಿ", romanization: "bhuumi", meaning: "earth", requiredChars: ["ಭ", "ೂ", "ಮ", "ಿ"], minLevel: 5 },
  { kannada: "ನದಿ", romanization: "nadi", meaning: "river", requiredChars: ["ನ", "ದ", "ಿ"], minLevel: 4 },
  { kannada: "ಸಮುದ್ರ", romanization: "samudra", meaning: "ocean", requiredChars: ["ಸ", "ಮ", "ು", "ದ", "ರ"], minLevel: 4 },
  { kannada: "ಪರ್ವತ", romanization: "parvata", meaning: "mountain", requiredChars: ["ಪ", "ರ", "ವ", "ತ"], minLevel: 4 },
  { kannada: "ಬೆಂಕಿ", romanization: "benki", meaning: "fire", requiredChars: ["ಬ", "ೆ", "ಕ", "ಿ", "ಂ"], minLevel: 6 },
  { kannada: "ಗಾಲಿ", romanization: "gaali", meaning: "wheel", requiredChars: ["ಗ", "ಾ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಚಂದ್ರ", romanization: "chandra", meaning: "moon", requiredChars: ["ಚ", "ದ", "ರ", "ಂ"], minLevel: 6 },
  { kannada: "ನಕ್ಷತ್ರ", romanization: "nakshatra", meaning: "star", requiredChars: ["ನ", "ಕ", "ಷ", "ತ", "ರ"], minLevel: 9 },
  { kannada: "ಮಕ್ಕಳು", romanization: "makkalu", meaning: "children", requiredChars: ["ಮ", "ಕ", "ಳ", "ು"], minLevel: 8 },
  { kannada: "ಹೆಸರು", romanization: "hesaru", meaning: "name", requiredChars: ["ಹ", "ೆ", "ಸ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಜನರು", romanization: "janaru", meaning: "people", requiredChars: ["ಜ", "ನ", "ರ", "ು"], minLevel: 4 },
  { kannada: "ಸರಕಾರ", romanization: "sarkaara", meaning: "government", requiredChars: ["ಸ", "ರ", "ಕ", "ಾ"], minLevel: 3 },
  { kannada: "ವಿದ್ಯೆ", romanization: "vidye", meaning: "knowledge", requiredChars: ["ವ", "ಿ", "ದ", "ಯ", "ೆ"], minLevel: 5 },
  { kannada: "ಹಬ್ಬ", romanization: "habba", meaning: "festival", requiredChars: ["ಹ", "ಬ"], minLevel: 5 },
  { kannada: "ದೀಪ", romanization: "deepa", meaning: "lamp", requiredChars: ["ದ", "ೀ", "ಪ"], minLevel: 5 },
  { kannada: "ಪೂಜೆ", romanization: "puuje", meaning: "worship", requiredChars: ["ಪ", "ೂ", "ಜ", "ೆ"], minLevel: 5 },
  { kannada: "ದೇವರು", romanization: "devaru", meaning: "god", requiredChars: ["ದ", "ೇ", "ವ", "ರ", "ು"], minLevel: 5 },
  { kannada: "ಮಂದಿರ", romanization: "mandira", meaning: "temple", requiredChars: ["ಮ", "ದ", "ಿ", "ರ", "ಂ"], minLevel: 6 },
  { kannada: "ಪ್ರಕೃತಿ", romanization: "prakruti", meaning: "nature", requiredChars: ["ಪ", "ರ", "ಕ", "ೃ", "ತ", "ಿ"], minLevel: 5 },
  { kannada: "ಸ್ವಾತಂತ್ರ್ಯ", romanization: "svaatantrya", meaning: "freedom", requiredChars: ["ಸ", "ವ", "ಾ", "ತ", "ಯ", "ಂ"], minLevel: 6 },
  { kannada: "ಕಥೆ", romanization: "kathe", meaning: "story", requiredChars: ["ಕ", "ಥ", "ೆ"], minLevel: 7 },
  { kannada: "ಚಿತ್ರ", romanization: "chitra", meaning: "picture", requiredChars: ["ಚ", "ಿ", "ತ", "ರ"], minLevel: 4 },
  { kannada: "ಸಂಗೀತ", romanization: "sangeeta", meaning: "music", requiredChars: ["ಸ", "ಗ", "ೀ", "ತ", "ಂ"], minLevel: 6 },
  { kannada: "ನೃತ್ಯ", romanization: "nrutya", meaning: "dance", requiredChars: ["ನ", "ೃ", "ತ", "ಯ"], minLevel: 5 },
  { kannada: "ಆಟ", romanization: "aaTa", meaning: "game", requiredChars: ["ಆ", "ಟ"], minLevel: 8 },
  { kannada: "ಪಂದ್ಯ", romanization: "pandya", meaning: "match (sport)", requiredChars: ["ಪ", "ದ", "ಯ", "ಂ"], minLevel: 6 },
  { kannada: "ಬಣ್ಣ", romanization: "banna", meaning: "colour", requiredChars: ["ಬ", "ಣ"], minLevel: 8 },
  { kannada: "ರೂಪ", romanization: "ruupa", meaning: "form / beauty", requiredChars: ["ರ", "ೂ", "ಪ"], minLevel: 5 },
  { kannada: "ಶಕ್ತಿ", romanization: "shakti", meaning: "power", requiredChars: ["ಶ", "ಕ", "ತ", "ಿ"], minLevel: 9 },
  { kannada: "ಬುದ್ಧಿ", romanization: "buddhi", meaning: "intelligence", requiredChars: ["ಬ", "ು", "ದ", "ಿ"], minLevel: 4 },
  { kannada: "ವಿಜಯ", romanization: "vijaya", meaning: "victory", requiredChars: ["ವ", "ಿ", "ಜ", "ಯ"], minLevel: 4 },
  { kannada: "ಜಯ", romanization: "jaya", meaning: "victory", requiredChars: ["ಜ", "ಯ"], minLevel: 4 },
  { kannada: "ಪ್ರಯಾಣ", romanization: "prayaaNa", meaning: "journey", requiredChars: ["ಪ", "ರ", "ಯ", "ಾ", "ಣ"], minLevel: 8 },
  { kannada: "ಆರೋಗ್ಯ", romanization: "aarogya", meaning: "health", requiredChars: ["ಆ", "ರ", "ೋ", "ಗ", "ಯ"], minLevel: 5 },
  { kannada: "ಜೀವನ", romanization: "jeevana", meaning: "life / living", requiredChars: ["ಜ", "ೀ", "ವ", "ನ"], minLevel: 5 },
  { kannada: "ಮರಣ", romanization: "maraNa", meaning: "death", requiredChars: ["ಮ", "ರ", "ಣ"], minLevel: 8 },
  { kannada: "ಕನಸು", romanization: "kanasu", meaning: "dream", requiredChars: ["ಕ", "ನ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ನಿದ್ರೆ", romanization: "nidre", meaning: "sleep", requiredChars: ["ನ", "ಿ", "ದ", "ರ", "ೆ"], minLevel: 5 },
  { kannada: "ಪದವಿ", romanization: "padavi", meaning: "degree / rank", requiredChars: ["ಪ", "ದ", "ವ", "ಿ"], minLevel: 4 },
  { kannada: "ಯಶಸ್ಸು", romanization: "yashassu", meaning: "success", requiredChars: ["ಯ", "ಶ", "ಸ", "ು"], minLevel: 9 },
];

export const DICTIONARY: WordEntry[] = RAW_DICTIONARY.map((entry) => ({
  ...entry,
  minLevel: recategorizeLevel(entry),
  category: inferCategory(entry),
}));

export type GuideWord = WordEntry & { focusGlyph: string };

const VIRAMA = "\u0CCD";
const ANUSVARA = "\u0C82";
const VISARGA = "\u0C83";

/**
 * FIXED: Returns anchor words that are 100% decodable based on characters
 * learned so far. Prevents advanced words from leaking into lower levels.
 */
export function getAnchorWordsForCharacters(
  glyphs: string[],
  currentLevel: LevelId,
  knownGlyphs: string[],
  limit: number = Math.max(glyphs.length, 8)
): GuideWord[] {
  const allowedGlyphs = new Set([...glyphs, ...knownGlyphs]);

  const decodableCandidates: WordEntry[] = DICTIONARY
    .filter((word) => {
        // 1. Level Gate: Word rank cannot exceed the user's current rank.
        if (levelRank(word.minLevel) > levelRank(currentLevel)) return false;

        // 2. Strict Character Check: Every character in the word must be mastered.
        const wordChars = word.kannada.split("");
        return wordChars.every(char => {
            if (char === VIRAMA) return levelRank(currentLevel) >= levelRank(10);
            if (char === ANUSVARA || char === VISARGA) return levelRank(currentLevel) >= levelRank(6);
            return allowedGlyphs.has(char);
        });
    })
    .sort((a, b) => {
      const levelDelta = levelRank(a.minLevel) - levelRank(b.minLevel);
      if (levelDelta !== 0) return levelDelta;
      return a.kannada.length - b.kannada.length; // Prefer shorter, simpler words.
    });

  const selected: GuideWord[] = [];
  const usedWords = new Set<string>();

  // Priority 1: Find unique words for each new glyph introduced in this level.
  for (const glyph of glyphs) {
    const pick = decodableCandidates.find(
      (word) => !usedWords.has(word.kannada) && word.kannada.includes(glyph)
    );
    if (pick) {
      usedWords.add(pick.kannada);
      selected.push({ ...pick, focusGlyph: glyph });
    }
  }

  // Priority 2: Fill remaining slots with other decodable words.
  for (const word of decodableCandidates) {
    if (selected.length >= limit) break;
    if (usedWords.has(word.kannada)) continue;
    
    const focusGlyph = glyphs.find((g) => word.kannada.includes(g)) ?? glyphs[0] ?? "";
    selected.push({ ...word, focusGlyph });
    usedWords.add(word.kannada);
  }

  // Priority 3: Fallback. If NO words are decodable (likely Level 1), 
  // treat the glyphs themselves as the study items to avoid showing 
  // un-decodable dictionary words.
  if (selected.length === 0) {
      return glyphs.map(g => ({
          kannada: g,
          romanization: g,
          meaning: "Individual Character",
          requiredChars: [g],
          minLevel: CHAR_LEVEL.get(g) ?? 1,
          category: "Abstract",
          focusGlyph: g
      }));
  }

  return selected;
}