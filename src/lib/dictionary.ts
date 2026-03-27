import { WordEntry, WordCategory, LevelId } from "@/types";

const LEVEL_ORDER: LevelId[] = [1, 2, "3a", "3b", "3c", 4, 5, 6];

type RawWordEntry = Omit<WordEntry, "minLevel" | "category"> & {
  minLevel: number;
  category?: WordCategory;
};

const TOP_SIGNS = new Set(["ಿ", "ೀ", "ೆ", "ೇ", "ೈ"]);
const SIDE_WRAP_SIGNS = new Set(["ಾ", "ೊ", "ೋ", "ೌ"]);
const BOTTOM_SIGNS = new Set(["ು", "ೂ", "ೃ"]);

function recategorizeLevel(entry: RawWordEntry): LevelId {
  if (entry.minLevel !== 3) return entry.minLevel as LevelId;

  if (entry.requiredChars.some((char) => TOP_SIGNS.has(char))) return "3a";
  if (entry.requiredChars.some((char) => SIDE_WRAP_SIGNS.has(char))) return "3b";
  if (entry.requiredChars.some((char) => BOTTOM_SIGNS.has(char))) return "3c";

  // Level 3 words should always have kagunita signs, but default to top-sign track.
  return "3a";
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

/**
 * 200+ common Kannada words organised by minimum level required.
 * requiredChars lists the base consonants / vowel-signs / special symbols
 * needed — the engine checks these against the user's mastered set.
 */
const RAW_DICTIONARY: RawWordEntry[] = [
  /* ───────────────────────────────────────────────────────────
   * Level 2 — words using only basic consonants (inherent 'a')
   * ─────────────────────────────────────────────────────────── */
  { kannada: "ನಮ", romanization: "nama", meaning: "bow / salute", requiredChars: ["ನ", "ಮ"], minLevel: 2 },
  { kannada: "ಮನ", romanization: "mana", meaning: "mind", requiredChars: ["ಮ", "ನ"], minLevel: 2 },
  { kannada: "ವನ", romanization: "vana", meaning: "forest", requiredChars: ["ವ", "ನ"], minLevel: 2 },
  { kannada: "ಜನ", romanization: "jana", meaning: "people", requiredChars: ["ಜ", "ನ"], minLevel: 2 },
  { kannada: "ಬಲ", romanization: "bala", meaning: "strength", requiredChars: ["ಬ", "ಲ"], minLevel: 2 },
  { kannada: "ಮರ", romanization: "mara", meaning: "tree", requiredChars: ["ಮ", "ರ"], minLevel: 2 },
  { kannada: "ಕರ", romanization: "kara", meaning: "hand / do", requiredChars: ["ಕ", "ರ"], minLevel: 2 },
  { kannada: "ಹಸ", romanization: "hasa", meaning: "laugh", requiredChars: ["ಹ", "ಸ"], minLevel: 2 },
  { kannada: "ಸರ", romanization: "sara", meaning: "line / chain", requiredChars: ["ಸ", "ರ"], minLevel: 2 },
  { kannada: "ಪರ", romanization: "para", meaning: "other", requiredChars: ["ಪ", "ರ"], minLevel: 2 },
  { kannada: "ತರ", romanization: "tara", meaning: "bring", requiredChars: ["ತ", "ರ"], minLevel: 2 },
  { kannada: "ದಯ", romanization: "daya", meaning: "kindness", requiredChars: ["ದ", "ಯ"], minLevel: 2 },
  { kannada: "ಜಲ", romanization: "jala", meaning: "water", requiredChars: ["ಜ", "ಲ"], minLevel: 2 },
  { kannada: "ಗಜ", romanization: "gaja", meaning: "elephant", requiredChars: ["ಗ", "ಜ"], minLevel: 2 },
  { kannada: "ನಗ", romanization: "naga", meaning: "serpent / mountain", requiredChars: ["ನ", "ಗ"], minLevel: 2 },
  { kannada: "ರವ", romanization: "rava", meaning: "sound", requiredChars: ["ರ", "ವ"], minLevel: 2 },
  { kannada: "ಹರ", romanization: "hara", meaning: "garland / Shiva", requiredChars: ["ಹ", "ರ"], minLevel: 2 },
  { kannada: "ಸಮ", romanization: "sama", meaning: "equal", requiredChars: ["ಸ", "ಮ"], minLevel: 2 },
  { kannada: "ಕಲ", romanization: "kala", meaning: "stone", requiredChars: ["ಕ", "ಲ"], minLevel: 2 },
  { kannada: "ಬರ", romanization: "bara", meaning: "come", requiredChars: ["ಬ", "ರ"], minLevel: 2 },
  { kannada: "ಮಲ", romanization: "mala", meaning: "garland", requiredChars: ["ಮ", "ಲ"], minLevel: 2 },
  { kannada: "ಪದ", romanization: "pada", meaning: "word / foot", requiredChars: ["ಪ", "ದ"], minLevel: 2 },
  { kannada: "ಮನಸ", romanization: "manasa", meaning: "mind / heart", requiredChars: ["ಮ", "ನ", "ಸ"], minLevel: 2 },
  { kannada: "ಕಮಲ", romanization: "kamala", meaning: "lotus", requiredChars: ["ಕ", "ಮ", "ಲ"], minLevel: 2 },
  { kannada: "ನಗರ", romanization: "nagara", meaning: "city", requiredChars: ["ನ", "ಗ", "ರ"], minLevel: 2 },

  /* ───────────────────────────────────────────────────────────
   * Level 3 — words requiring vowel signs (Kagunita)
   * ─────────────────────────────────────────────────────────── */
  { kannada: "ನೀರು", romanization: "neeru", meaning: "water", requiredChars: ["ನ", "ೀ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಕಾಲ", romanization: "kaala", meaning: "time / era", requiredChars: ["ಕ", "ಾ", "ಲ"], minLevel: 3 },
  { kannada: "ಮನೆ", romanization: "mane", meaning: "house", requiredChars: ["ಮ", "ನ", "ೆ"], minLevel: 3 },
  { kannada: "ಹಣ", romanization: "hana", meaning: "money", requiredChars: ["ಹ", "ಣ"], minLevel: 4 },
  { kannada: "ಹಾಲು", romanization: "haalu", meaning: "milk", requiredChars: ["ಹ", "ಾ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಬೆಳೆ", romanization: "bele", meaning: "crop / grow", requiredChars: ["ಬ", "ೆ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ಕೈ", romanization: "kai", meaning: "hand", requiredChars: ["ಕ", "ೈ"], minLevel: 3 },
  { kannada: "ನಾಯಿ", romanization: "naayi", meaning: "dog", requiredChars: ["ನ", "ಾ", "ಯ", "ಿ"], minLevel: 3 },
  { kannada: "ಹೂವು", romanization: "huuvu", meaning: "flower", requiredChars: ["ಹ", "ೂ", "ವ", "ು"], minLevel: 3 },
  { kannada: "ಮೀನು", romanization: "meenu", meaning: "fish", requiredChars: ["ಮ", "ೀ", "ನ", "ು"], minLevel: 3 },
  { kannada: "ಬೆಕ್ಕು", romanization: "bekku", meaning: "cat", requiredChars: ["ಬ", "ೆ", "ಕ", "ು"], minLevel: 3 },
  { kannada: "ಮಳೆ", romanization: "male", meaning: "rain", requiredChars: ["ಮ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ಬೆಳಕು", romanization: "belaku", meaning: "light", requiredChars: ["ಬ", "ೆ", "ಳ", "ಕ", "ು"], minLevel: 3 },
  { kannada: "ಕಣ್ಣು", romanization: "kannu", meaning: "eye", requiredChars: ["ಕ", "ಣ", "ು"], minLevel: 4 },
  { kannada: "ಹಸಿವು", romanization: "hasivu", meaning: "hunger", requiredChars: ["ಹ", "ಸ", "ಿ", "ವ", "ು"], minLevel: 3 },
  { kannada: "ಮಾತು", romanization: "maatu", meaning: "word / speech", requiredChars: ["ಮ", "ಾ", "ತ", "ು"], minLevel: 3 },
  { kannada: "ರಾಜ", romanization: "raaja", meaning: "king", requiredChars: ["ರ", "ಾ", "ಜ"], minLevel: 3 },
  { kannada: "ಗಾಳಿ", romanization: "gaali", meaning: "wind", requiredChars: ["ಗ", "ಾ", "ಳ", "ಿ"], minLevel: 3 },
  { kannada: "ಊರು", romanization: "uuru", meaning: "town / village", requiredChars: ["ಊ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಾಗಿಲು", romanization: "baagilu", meaning: "door", requiredChars: ["ಬ", "ಾ", "ಗ", "ಿ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಮೊಲ", romanization: "mola", meaning: "rabbit", requiredChars: ["ಮ", "ೊ", "ಲ"], minLevel: 3 },
  { kannada: "ಕೊಡ", romanization: "koda", meaning: "give", requiredChars: ["ಕ", "ೊ", "ಡ"], minLevel: 4 },
  { kannada: "ಹಾವು", romanization: "haavu", meaning: "snake", requiredChars: ["ಹ", "ಾ", "ವ", "ು"], minLevel: 3 },
  { kannada: "ನಾಡು", romanization: "naadu", meaning: "land / country", requiredChars: ["ನ", "ಾ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಹಾಡು", romanization: "haadu", meaning: "song", requiredChars: ["ಹ", "ಾ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಸೂರ್ಯ", romanization: "suurya", meaning: "sun", requiredChars: ["ಸ", "ೂ", "ರ", "ಯ"], minLevel: 3 },
  { kannada: "ಕವಿ", romanization: "kavi", meaning: "poet", requiredChars: ["ಕ", "ವ", "ಿ"], minLevel: 3 },
  { kannada: "ಗುರು", romanization: "guru", meaning: "teacher", requiredChars: ["ಗ", "ು", "ರ", "ು"], minLevel: 3 },
  { kannada: "ದೇವ", romanization: "deva", meaning: "god", requiredChars: ["ದ", "ೇ", "ವ"], minLevel: 3 },
  { kannada: "ಪುಸ್ತಕ", romanization: "pustaka", meaning: "book", requiredChars: ["ಪ", "ು", "ಸ", "ತ", "ಕ"], minLevel: 3 },
  { kannada: "ಹಕ್ಕಿ", romanization: "hakki", meaning: "bird", requiredChars: ["ಹ", "ಕ", "ಿ"], minLevel: 3 },
  { kannada: "ಬೆಟ್ಟ", romanization: "betta", meaning: "hill", requiredChars: ["ಬ", "ೆ", "ಟ"], minLevel: 4 },
  { kannada: "ಮಗು", romanization: "magu", meaning: "child", requiredChars: ["ಮ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಬೀಜ", romanization: "beeja", meaning: "seed", requiredChars: ["ಬ", "ೀ", "ಜ"], minLevel: 3 },
  { kannada: "ಸೀರೆ", romanization: "seere", meaning: "saree", requiredChars: ["ಸ", "ೀ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಚಲ", romanization: "chala", meaning: "movement", requiredChars: ["ಚ", "ಲ"], minLevel: 2 },
  { kannada: "ಹಲ", romanization: "hala", meaning: "plough", requiredChars: ["ಹ", "ಲ"], minLevel: 2 },
  { kannada: "ಗೋಡೆ", romanization: "goode", meaning: "wall", requiredChars: ["ಗ", "ೋ", "ಡ", "ೆ"], minLevel: 4 },
  { kannada: "ಕೆರೆ", romanization: "kere", meaning: "lake", requiredChars: ["ಕ", "ೆ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಮೇಜು", romanization: "maeju", meaning: "table", requiredChars: ["ಮ", "ೇ", "ಜ", "ು"], minLevel: 3 },
  { kannada: "ಕುರಿ", romanization: "kuri", meaning: "sheep", requiredChars: ["ಕ", "ು", "ರ", "ಿ"], minLevel: 3 },
  { kannada: "ಬಟ್ಟೆ", romanization: "batte", meaning: "cloth", requiredChars: ["ಬ", "ಟ", "ೆ"], minLevel: 4 },
  { kannada: "ಕಿವಿ", romanization: "kivi", meaning: "ear", requiredChars: ["ಕ", "ಿ", "ವ", "ಿ"], minLevel: 3 },
  { kannada: "ಹಣ್ಣು", romanization: "hannu", meaning: "fruit", requiredChars: ["ಹ", "ಣ", "ು"], minLevel: 4 },
  { kannada: "ಬಾಳೆ", romanization: "baale", meaning: "banana", requiredChars: ["ಬ", "ಾ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ಕೂಸು", romanization: "kuusu", meaning: "baby", requiredChars: ["ಕ", "ೂ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ತಾಯಿ", romanization: "taayi", meaning: "mother", requiredChars: ["ತ", "ಾ", "ಯ", "ಿ"], minLevel: 3 },
  { kannada: "ನೀಲಿ", romanization: "neeli", meaning: "blue", requiredChars: ["ನ", "ೀ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಕೆಂಪು", romanization: "kempu", meaning: "red", requiredChars: ["ಕ", "ೆ", "ಪ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಹಸಿರು", romanization: "hasiru", meaning: "green", requiredChars: ["ಹ", "ಸ", "ಿ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಿಳಿ", romanization: "bili", meaning: "white", requiredChars: ["ಬ", "ಿ", "ಳ", "ಿ"], minLevel: 3 },
  { kannada: "ಕಪ್ಪು", romanization: "kappu", meaning: "black", requiredChars: ["ಕ", "ಪ", "ು"], minLevel: 3 },
  { kannada: "ಕಾಡು", romanization: "kaadu", meaning: "forest", requiredChars: ["ಕ", "ಾ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಜೇನು", romanization: "jaenu", meaning: "honey", requiredChars: ["ಜ", "ೇ", "ನ", "ು"], minLevel: 3 },
  { kannada: "ಹಾದಿ", romanization: "haadi", meaning: "path", requiredChars: ["ಹ", "ಾ", "ದ", "ಿ"], minLevel: 3 },
  { kannada: "ರಾತ್ರಿ", romanization: "raatri", meaning: "night", requiredChars: ["ರ", "ಾ", "ತ", "ಿ"], minLevel: 3 },
  { kannada: "ಬೆಳಗು", romanization: "belagu", meaning: "morning", requiredChars: ["ಬ", "ೆ", "ಳ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ದಿನ", romanization: "dina", meaning: "day", requiredChars: ["ದ", "ಿ", "ನ"], minLevel: 3 },
  { kannada: "ವಾರ", romanization: "vaara", meaning: "week", requiredChars: ["ವ", "ಾ", "ರ"], minLevel: 3 },
  { kannada: "ತಿಂಗಳು", romanization: "tingalu", meaning: "month / moon", requiredChars: ["ತ", "ಿ", "ಗ", "ಳ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಮಗ", romanization: "maga", meaning: "son", requiredChars: ["ಮ", "ಗ"], minLevel: 2 },
  { kannada: "ಮಗಳು", romanization: "magalu", meaning: "daughter", requiredChars: ["ಮ", "ಗ", "ಳ", "ು"], minLevel: 3 },
  { kannada: "ಅಪ್ಪ", romanization: "appa", meaning: "father", requiredChars: ["ಅ", "ಪ"], minLevel: 2 },
  { kannada: "ಅಮ್ಮ", romanization: "amma", meaning: "mother", requiredChars: ["ಅ", "ಮ"], minLevel: 2 },
  { kannada: "ಅಕ್ಕ", romanization: "akka", meaning: "elder sister", requiredChars: ["ಅ", "ಕ"], minLevel: 2 },
  { kannada: "ಅಣ್ಣ", romanization: "anna", meaning: "elder brother", requiredChars: ["ಅ", "ಣ"], minLevel: 4 },
  { kannada: "ತಮ್ಮ", romanization: "tamma", meaning: "younger brother", requiredChars: ["ತ", "ಮ"], minLevel: 2 },
  { kannada: "ಕಾರು", romanization: "kaaru", meaning: "car", requiredChars: ["ಕ", "ಾ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬಸ್ಸು", romanization: "bassu", meaning: "bus", requiredChars: ["ಬ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ರಸ್ತೆ", romanization: "raste", meaning: "road", requiredChars: ["ರ", "ಸ", "ತ", "ೆ"], minLevel: 3 },
  { kannada: "ಎಲೆ", romanization: "ele", meaning: "leaf", requiredChars: ["ಎ", "ಲ", "ೆ"], minLevel: 3 },
  { kannada: "ಬೇರು", romanization: "baeru", meaning: "root", requiredChars: ["ಬ", "ೇ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಮೋಡ", romanization: "mooda", meaning: "cloud", requiredChars: ["ಮ", "ೋ", "ಡ"], minLevel: 4 },
  { kannada: "ನೆಲ", romanization: "nela", meaning: "ground / floor", requiredChars: ["ನ", "ೆ", "ಲ"], minLevel: 3 },
  { kannada: "ಗಿಡ", romanization: "gida", meaning: "plant", requiredChars: ["ಗ", "ಿ", "ಡ"], minLevel: 4 },
  { kannada: "ಕೆಲಸ", romanization: "kelasa", meaning: "work", requiredChars: ["ಕ", "ೆ", "ಲ", "ಸ"], minLevel: 3 },
  { kannada: "ಜೀವ", romanization: "jeeva", meaning: "life", requiredChars: ["ಜ", "ೀ", "ವ"], minLevel: 3 },
  { kannada: "ಸೇಬು", romanization: "saebu", meaning: "apple", requiredChars: ["ಸ", "ೇ", "ಬ", "ು"], minLevel: 3 },
  { kannada: "ಮಾವು", romanization: "maavu", meaning: "mango tree", requiredChars: ["ಮ", "ಾ", "ವ", "ು"], minLevel: 3 },
  { kannada: "ತೆಂಗು", romanization: "tengu", meaning: "coconut", requiredChars: ["ತ", "ೆ", "ಗ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಹಸು", romanization: "hasu", meaning: "cow", requiredChars: ["ಹ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ಕುದುರೆ", romanization: "kudure", meaning: "horse", requiredChars: ["ಕ", "ು", "ದ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಆನೆ", romanization: "aane", meaning: "elephant", requiredChars: ["ಆ", "ನ", "ೆ"], minLevel: 3 },
  { kannada: "ಸಿಹಿ", romanization: "sihi", meaning: "sweet", requiredChars: ["ಸ", "ಿ", "ಹ", "ಿ"], minLevel: 3 },
  { kannada: "ಕಹಿ", romanization: "kahi", meaning: "bitter", requiredChars: ["ಕ", "ಹ", "ಿ"], minLevel: 3 },
  { kannada: "ಬಿಸಿ", romanization: "bisi", meaning: "hot", requiredChars: ["ಬ", "ಿ", "ಸ", "ಿ"], minLevel: 3 },
  { kannada: "ತಣ್ಣ", romanization: "tanna", meaning: "cool (root)", requiredChars: ["ತ", "ಣ"], minLevel: 4 },
  { kannada: "ಹೊಸ", romanization: "hosa", meaning: "new", requiredChars: ["ಹ", "ೊ", "ಸ"], minLevel: 3 },
  { kannada: "ಹಳೆ", romanization: "hale", meaning: "old", requiredChars: ["ಹ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ದೊಡ್ಡ", romanization: "dodda", meaning: "big", requiredChars: ["ದ", "ೊ", "ಡ"], minLevel: 4 },
  { kannada: "ಸಣ್ಣ", romanization: "sanna", meaning: "small", requiredChars: ["ಸ", "ಣ"], minLevel: 4 },
  { kannada: "ಉದ್ದ", romanization: "udda", meaning: "long", requiredChars: ["ಉ", "ದ"], minLevel: 2 },
  { kannada: "ಗಟ್ಟಿ", romanization: "gatti", meaning: "hard / strong", requiredChars: ["ಗ", "ಟ", "ಿ"], minLevel: 4 },
  { kannada: "ಮೆತ್ತ", romanization: "metta", meaning: "soft (root)", requiredChars: ["ಮ", "ೆ", "ತ"], minLevel: 3 },
  { kannada: "ಒಳ್ಳೆ", romanization: "olle", meaning: "good", requiredChars: ["ಒ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ಕೆಟ್ಟ", romanization: "ketta", meaning: "bad", requiredChars: ["ಕ", "ೆ", "ಟ"], minLevel: 4 },
  { kannada: "ನೋಡು", romanization: "noodu", meaning: "see / look", requiredChars: ["ನ", "ೋ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಕೇಳು", romanization: "kaelu", meaning: "listen / ask", requiredChars: ["ಕ", "ೇ", "ಳ", "ು"], minLevel: 3 },
  { kannada: "ಹೇಳು", romanization: "haelu", meaning: "tell / say", requiredChars: ["ಹ", "ೇ", "ಳ", "ು"], minLevel: 3 },
  { kannada: "ಮಾಡು", romanization: "maadu", meaning: "do / make", requiredChars: ["ಮ", "ಾ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಹೋಗು", romanization: "hoogu", meaning: "go", requiredChars: ["ಹ", "ೋ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಬರು", romanization: "baru", meaning: "come", requiredChars: ["ಬ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ತಿನ್ನು", romanization: "tinnu", meaning: "eat", requiredChars: ["ತ", "ಿ", "ನ", "ು"], minLevel: 3 },
  { kannada: "ಕುಡಿ", romanization: "kudi", meaning: "drink", requiredChars: ["ಕ", "ು", "ಡ", "ಿ"], minLevel: 4 },
  { kannada: "ಓದು", romanization: "oodu", meaning: "read", requiredChars: ["ಓ", "ದ", "ು"], minLevel: 3 },
  { kannada: "ಬರೆ", romanization: "bare", meaning: "write", requiredChars: ["ಬ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಕಲಿ", romanization: "kali", meaning: "learn", requiredChars: ["ಕ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಆಡು", romanization: "aadu", meaning: "play", requiredChars: ["ಆ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ನಡೆ", romanization: "nade", meaning: "walk", requiredChars: ["ನ", "ಡ", "ೆ"], minLevel: 4 },
  { kannada: "ನಗು", romanization: "nagu", meaning: "smile / laugh", requiredChars: ["ನ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಮಲಗು", romanization: "malagu", meaning: "sleep", requiredChars: ["ಮ", "ಲ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಕೂಡು", romanization: "kuudu", meaning: "join / also", requiredChars: ["ಕ", "ೂ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಬಿಡು", romanization: "bidu", meaning: "leave / let go", requiredChars: ["ಬ", "ಿ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಹಿಡಿ", romanization: "hidi", meaning: "hold / catch", requiredChars: ["ಹ", "ಿ", "ಡ", "ಿ"], minLevel: 4 },
  { kannada: "ಸುರಿ", romanization: "suri", meaning: "pour", requiredChars: ["ಸ", "ು", "ರ", "ಿ"], minLevel: 3 },
  { kannada: "ತೊಳೆ", romanization: "tole", meaning: "wash", requiredChars: ["ತ", "ೊ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ನೆನಪು", romanization: "nenapu", meaning: "memory", requiredChars: ["ನ", "ೆ", "ಪ", "ು"], minLevel: 3 },
  { kannada: "ಸಮಯ", romanization: "samaya", meaning: "time", requiredChars: ["ಸ", "ಮ", "ಯ"], minLevel: 2 },
  { kannada: "ಜಾಗ", romanization: "jaaga", meaning: "place", requiredChars: ["ಜ", "ಾ", "ಗ"], minLevel: 3 },
  { kannada: "ಕತೆ", romanization: "kate", meaning: "story", requiredChars: ["ಕ", "ತ", "ೆ"], minLevel: 3 },
  { kannada: "ಪಾಠ", romanization: "paaTha", meaning: "lesson", requiredChars: ["ಪ", "ಾ", "ಠ"], minLevel: 4 },
  { kannada: "ಶಾಲೆ", romanization: "shaale", meaning: "school", requiredChars: ["ಶ", "ಾ", "ಲ", "ೆ"], minLevel: 4 },
  { kannada: "ಮಾರು", romanization: "maaru", meaning: "sell", requiredChars: ["ಮ", "ಾ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಕೊಳ", romanization: "kola", meaning: "pond / buy", requiredChars: ["ಕ", "ೊ", "ಳ"], minLevel: 3 },
  { kannada: "ಅಡಿಗೆ", romanization: "adige", meaning: "cooking", requiredChars: ["ಅ", "ಡ", "ಿ", "ಗ", "ೆ"], minLevel: 4 },
  { kannada: "ಊಟ", romanization: "uuTa", meaning: "meal", requiredChars: ["ಊ", "ಟ"], minLevel: 4 },
  { kannada: "ಸಕ್ಕರೆ", romanization: "sakkare", meaning: "sugar", requiredChars: ["ಸ", "ಕ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಉಪ್ಪು", romanization: "uppu", meaning: "salt", requiredChars: ["ಉ", "ಪ", "ು"], minLevel: 3 },
  { kannada: "ಅಕ್ಕಿ", romanization: "akki", meaning: "rice", requiredChars: ["ಅ", "ಕ", "ಿ"], minLevel: 3 },
  { kannada: "ಬೇಳೆ", romanization: "baele", meaning: "lentil", requiredChars: ["ಬ", "ೇ", "ಳ", "ೆ"], minLevel: 3 },
  { kannada: "ತರಕಾರಿ", romanization: "tarakaari", meaning: "vegetable", requiredChars: ["ತ", "ರ", "ಕ", "ಾ", "ಿ"], minLevel: 3 },
  { kannada: "ಹಿಟ್ಟು", romanization: "hittu", meaning: "flour", requiredChars: ["ಹ", "ಿ", "ಟ", "ು"], minLevel: 4 },
  { kannada: "ಕಾಫಿ", romanization: "kaafi", meaning: "coffee", requiredChars: ["ಕ", "ಾ", "ಫ", "ಿ"], minLevel: 4 },
  { kannada: "ನೀರಾವರಿ", romanization: "neeraavari", meaning: "irrigation", requiredChars: ["ನ", "ೀ", "ರ", "ಾ", "ವ", "ಿ"], minLevel: 3 },
  { kannada: "ಭಾರತ", romanization: "bhaarata", meaning: "India", requiredChars: ["ಭ", "ಾ", "ರ", "ತ"], minLevel: 4 },
  { kannada: "ಕರ್ನಾಟಕ", romanization: "karnaaTaka", meaning: "Karnataka", requiredChars: ["ಕ", "ರ", "ನ", "ಾ", "ಟ"], minLevel: 4 },
  { kannada: "ಮೈಸೂರು", romanization: "maisuuru", meaning: "Mysore", requiredChars: ["ಮ", "ೈ", "ಸ", "ೂ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಬೆಂಗಳೂರು", romanization: "bengaluuru", meaning: "Bangalore", requiredChars: ["ಬ", "ೆ", "ಗ", "ಳ", "ೂ", "ರ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ನಮಸ್ಕಾರ", romanization: "namaskaara", meaning: "greeting / hello", requiredChars: ["ನ", "ಮ", "ಸ", "ಕ", "ಾ", "ರ"], minLevel: 3 },
  { kannada: "ಧನ್ಯವಾದ", romanization: "dhanyavaada", meaning: "thank you", requiredChars: ["ಧ", "ನ", "ಯ", "ವ", "ಾ", "ದ"], minLevel: 4 },
  { kannada: "ಹೌದು", romanization: "haudu", meaning: "yes", requiredChars: ["ಹ", "ೌ", "ದ", "ು"], minLevel: 3 },
  { kannada: "ಇಲ್ಲ", romanization: "illa", meaning: "no / not", requiredChars: ["ಇ", "ಲ"], minLevel: 2 },
  { kannada: "ಯಾಕೆ", romanization: "yaake", meaning: "why", requiredChars: ["ಯ", "ಾ", "ಕ", "ೆ"], minLevel: 3 },
  { kannada: "ಏನು", romanization: "aenu", meaning: "what", requiredChars: ["ಏ", "ನ", "ು"], minLevel: 3 },
  { kannada: "ಯಾರು", romanization: "yaaru", meaning: "who", requiredChars: ["ಯ", "ಾ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಎಲ್ಲಿ", romanization: "elli", meaning: "where", requiredChars: ["ಎ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಹೊಟ್ಟೆ", romanization: "hoTTe", meaning: "stomach", requiredChars: ["ಹ", "ೊ", "ಟ", "ೆ"], minLevel: 4 },
  { kannada: "ತಲೆ", romanization: "tale", meaning: "head", requiredChars: ["ತ", "ಲ", "ೆ"], minLevel: 3 },
  { kannada: "ಕಾಲು", romanization: "kaalu", meaning: "leg", requiredChars: ["ಕ", "ಾ", "ಲ", "ು"], minLevel: 3 },
  { kannada: "ಬಾಯಿ", romanization: "baayi", meaning: "mouth", requiredChars: ["ಬ", "ಾ", "ಯ", "ಿ"], minLevel: 3 },
  { kannada: "ಮೂಗು", romanization: "muugu", meaning: "nose", requiredChars: ["ಮ", "ೂ", "ಗ", "ು"], minLevel: 3 },
  { kannada: "ಮುಖ", romanization: "mukha", meaning: "face", requiredChars: ["ಮ", "ು", "ಖ"], minLevel: 4 },
  { kannada: "ಒಂದು", romanization: "ondu", meaning: "one", requiredChars: ["ಒ", "ದ", "ು", "ಂ"], minLevel: 6 },
  { kannada: "ಎರಡು", romanization: "eradu", meaning: "two", requiredChars: ["ಎ", "ರ", "ಡ", "ು"], minLevel: 4 },
  { kannada: "ಮೂರು", romanization: "muuru", meaning: "three", requiredChars: ["ಮ", "ೂ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ನಾಲ್ಕು", romanization: "naalku", meaning: "four", requiredChars: ["ನ", "ಾ", "ಲ", "ಕ", "ು"], minLevel: 3 },
  { kannada: "ಐದು", romanization: "aidu", meaning: "five", requiredChars: ["ಐ", "ದ", "ು"], minLevel: 3 },
  { kannada: "ಆರು", romanization: "aaru", meaning: "six", requiredChars: ["ಆ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಏಳು", romanization: "aelu", meaning: "seven", requiredChars: ["ಏ", "ಳ", "ು"], minLevel: 3 },
  { kannada: "ನೂರು", romanization: "nuuru", meaning: "hundred", requiredChars: ["ನ", "ೂ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಸಾವಿರ", romanization: "saavira", meaning: "thousand", requiredChars: ["ಸ", "ಾ", "ವ", "ಿ", "ರ"], minLevel: 3 },
  { kannada: "ದೇಶ", romanization: "desha", meaning: "country", requiredChars: ["ದ", "ೇ", "ಶ"], minLevel: 4 },
  { kannada: "ಭಾಷೆ", romanization: "bhaashe", meaning: "language", requiredChars: ["ಭ", "ಾ", "ಷ", "ೆ"], minLevel: 4 },
  { kannada: "ಪ್ರೀತಿ", romanization: "preeti", meaning: "love", requiredChars: ["ಪ", "ರ", "ೀ", "ತ", "ಿ"], minLevel: 5 },
  { kannada: "ಸ್ನೇಹ", romanization: "sneha", meaning: "friendship", requiredChars: ["ಸ", "ನ", "ೇ", "ಹ"], minLevel: 5 },
  { kannada: "ಸಂತೋಷ", romanization: "santosha", meaning: "happiness", requiredChars: ["ಸ", "ತ", "ೋ", "ಷ", "ಂ"], minLevel: 6 },
  { kannada: "ಆಕಾಶ", romanization: "aakaasha", meaning: "sky", requiredChars: ["ಆ", "ಕ", "ಾ", "ಶ"], minLevel: 4 },
  { kannada: "ಭೂಮಿ", romanization: "bhuumi", meaning: "earth", requiredChars: ["ಭ", "ೂ", "ಮ", "ಿ"], minLevel: 4 },
  { kannada: "ನದಿ", romanization: "nadi", meaning: "river", requiredChars: ["ನ", "ದ", "ಿ"], minLevel: 3 },
  { kannada: "ಸಮುದ್ರ", romanization: "samudra", meaning: "ocean", requiredChars: ["ಸ", "ಮ", "ು", "ದ", "ರ"], minLevel: 3 },
  { kannada: "ಪರ್ವತ", romanization: "parvata", meaning: "mountain", requiredChars: ["ಪ", "ರ", "ವ", "ತ"], minLevel: 2 },
  { kannada: "ಬೆಂಕಿ", romanization: "benki", meaning: "fire", requiredChars: ["ಬ", "ೆ", "ಕ", "ಿ", "ಂ"], minLevel: 6 },
  { kannada: "ಗಾಲಿ", romanization: "gaali", meaning: "wheel", requiredChars: ["ಗ", "ಾ", "ಲ", "ಿ"], minLevel: 3 },
  { kannada: "ಚಂದ್ರ", romanization: "chandra", meaning: "moon", requiredChars: ["ಚ", "ದ", "ರ", "ಂ"], minLevel: 6 },
  { kannada: "ನಕ್ಷತ್ರ", romanization: "nakshatra", meaning: "star", requiredChars: ["ನ", "ಕ", "ಷ", "ತ", "ರ"], minLevel: 4 },
  { kannada: "ಮಕ್ಕಳು", romanization: "makkalu", meaning: "children", requiredChars: ["ಮ", "ಕ", "ಳ", "ು"], minLevel: 3 },
  { kannada: "ಹೆಸರು", romanization: "hesaru", meaning: "name", requiredChars: ["ಹ", "ೆ", "ಸ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಜನರು", romanization: "janaru", meaning: "people", requiredChars: ["ಜ", "ನ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಸರಕಾರ", romanization: "sarkaara", meaning: "government", requiredChars: ["ಸ", "ರ", "ಕ", "ಾ"], minLevel: 3 },
  { kannada: "ವಿದ್ಯೆ", romanization: "vidye", meaning: "knowledge", requiredChars: ["ವ", "ಿ", "ದ", "ಯ", "ೆ"], minLevel: 3 },
  { kannada: "ಹಬ್ಬ", romanization: "habba", meaning: "festival", requiredChars: ["ಹ", "ಬ"], minLevel: 2 },
  { kannada: "ದೀಪ", romanization: "deepa", meaning: "lamp", requiredChars: ["ದ", "ೀ", "ಪ"], minLevel: 3 },
  { kannada: "ಪೂಜೆ", romanization: "puuje", meaning: "worship", requiredChars: ["ಪ", "ೂ", "ಜ", "ೆ"], minLevel: 3 },
  { kannada: "ದೇವರು", romanization: "devaru", meaning: "god", requiredChars: ["ದ", "ೇ", "ವ", "ರ", "ು"], minLevel: 3 },
  { kannada: "ಮಂದಿರ", romanization: "mandira", meaning: "temple", requiredChars: ["ಮ", "ದ", "ಿ", "ರ", "ಂ"], minLevel: 6 },
  { kannada: "ಪ್ರಕೃತಿ", romanization: "prakruti", meaning: "nature", requiredChars: ["ಪ", "ರ", "ಕ", "ೃ", "ತ", "ಿ"], minLevel: 5 },
  { kannada: "ಸ್ವಾತಂತ್ರ್ಯ", romanization: "svaatantrya", meaning: "freedom", requiredChars: ["ಸ", "ವ", "ಾ", "ತ", "ಯ", "ಂ"], minLevel: 6 },
  { kannada: "ಕಥೆ", romanization: "kathe", meaning: "story", requiredChars: ["ಕ", "ಥ", "ೆ"], minLevel: 4 },
  { kannada: "ಚಿತ್ರ", romanization: "chitra", meaning: "picture", requiredChars: ["ಚ", "ಿ", "ತ", "ರ"], minLevel: 3 },
  { kannada: "ಸಂಗೀತ", romanization: "sangeeta", meaning: "music", requiredChars: ["ಸ", "ಗ", "ೀ", "ತ", "ಂ"], minLevel: 6 },
  { kannada: "ನೃತ್ಯ", romanization: "nrutya", meaning: "dance", requiredChars: ["ನ", "ೃ", "ತ", "ಯ"], minLevel: 3 },
  { kannada: "ಆಟ", romanization: "aaTa", meaning: "game", requiredChars: ["ಆ", "ಟ"], minLevel: 4 },
  { kannada: "ಪಂದ್ಯ", romanization: "pandya", meaning: "match (sport)", requiredChars: ["ಪ", "ದ", "ಯ", "ಂ"], minLevel: 6 },
  { kannada: "ಬಣ್ಣ", romanization: "banna", meaning: "colour", requiredChars: ["ಬ", "ಣ"], minLevel: 4 },
  { kannada: "ರೂಪ", romanization: "ruupa", meaning: "form / beauty", requiredChars: ["ರ", "ೂ", "ಪ"], minLevel: 3 },
  { kannada: "ಶಕ್ತಿ", romanization: "shakti", meaning: "power", requiredChars: ["ಶ", "ಕ", "ತ", "ಿ"], minLevel: 4 },
  { kannada: "ಬುದ್ಧಿ", romanization: "buddhi", meaning: "intelligence", requiredChars: ["ಬ", "ು", "ದ", "ಿ"], minLevel: 3 },
  { kannada: "ವಿಜಯ", romanization: "vijaya", meaning: "victory", requiredChars: ["ವ", "ಿ", "ಜ", "ಯ"], minLevel: 3 },
  { kannada: "ಜಯ", romanization: "jaya", meaning: "victory", requiredChars: ["ಜ", "ಯ"], minLevel: 2 },
  { kannada: "ಪ್ರಯಾಣ", romanization: "prayaaNa", meaning: "journey", requiredChars: ["ಪ", "ರ", "ಯ", "ಾ", "ಣ"], minLevel: 5 },
  { kannada: "ಆರೋಗ್ಯ", romanization: "aarogya", meaning: "health", requiredChars: ["ಆ", "ರ", "ೋ", "ಗ", "ಯ"], minLevel: 3 },
  { kannada: "ಜೀವನ", romanization: "jeevana", meaning: "life / living", requiredChars: ["ಜ", "ೀ", "ವ", "ನ"], minLevel: 3 },
  { kannada: "ಮರಣ", romanization: "maraNa", meaning: "death", requiredChars: ["ಮ", "ರ", "ಣ"], minLevel: 4 },
  { kannada: "ಕನಸು", romanization: "kanasu", meaning: "dream", requiredChars: ["ಕ", "ನ", "ಸ", "ು"], minLevel: 3 },
  { kannada: "ನಿದ್ರೆ", romanization: "nidre", meaning: "sleep", requiredChars: ["ನ", "ಿ", "ದ", "ರ", "ೆ"], minLevel: 3 },
  { kannada: "ಪದವಿ", romanization: "padavi", meaning: "degree / rank", requiredChars: ["ಪ", "ದ", "ವ", "ಿ"], minLevel: 3 },
  { kannada: "ಯಶಸ್ಸು", romanization: "yashassu", meaning: "success", requiredChars: ["ಯ", "ಶ", "ಸ", "ು"], minLevel: 4 },
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

function levelRank(level: LevelId): number {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? idx : LEVEL_ORDER.length;
}

function hasRestrictedGlyphsForLevel(word: string, currentLevel: LevelId): boolean {
  if (levelRank(currentLevel) < levelRank(5) && word.includes(VIRAMA)) return true;
  if (
    levelRank(currentLevel) < levelRank(6) &&
    (word.includes(ANUSVARA) || word.includes(VISARGA))
  ) {
    return true;
  }
  return false;
}

export function getAnchorWordsForCharacters(
  glyphs: string[],
  currentLevel: LevelId,
  knownGlyphs: string[],
  limit: number = Math.max(glyphs.length, 8)
): GuideWord[] {
  const allowedGlyphs = new Set([...glyphs, ...knownGlyphs]);

  const decodableCandidates: WordEntry[] = DICTIONARY
    .filter((word) => !hasRestrictedGlyphsForLevel(word.kannada, currentLevel))
    .filter((word) => word.requiredChars.every((glyph) => allowedGlyphs.has(glyph)))
    .filter((word) => glyphs.some((glyph) => word.requiredChars.includes(glyph) || word.kannada.includes(glyph)))
    .sort((a, b) => {
      const levelDelta = levelRank(a.minLevel) - levelRank(b.minLevel);
      if (levelDelta !== 0) return levelDelta;
      return a.requiredChars.length - b.requiredChars.length;
    });

  const selected: GuideWord[] = [];
  const usedWords = new Set<string>();

  for (const glyph of glyphs) {
    const uniquePick = decodableCandidates.find(
      (word) =>
        !usedWords.has(word.kannada) &&
        (word.requiredChars.includes(glyph) || word.kannada.includes(glyph))
    );
    const fallbackPick = decodableCandidates.find(
      (word) => word.requiredChars.includes(glyph) || word.kannada.includes(glyph)
    );
    const chosen = uniquePick ?? fallbackPick;
    if (!chosen) continue;
    usedWords.add(chosen.kannada);
    selected.push({ ...chosen, focusGlyph: glyph });
  }

  for (const word of decodableCandidates) {
    if (selected.length >= limit) break;
    if (usedWords.has(word.kannada)) continue;
    const focusGlyph = glyphs.find(
      (glyph) => word.requiredChars.includes(glyph) || word.kannada.includes(glyph)
    );
    if (!focusGlyph) continue;
    selected.push({ ...word, focusGlyph });
    usedWords.add(word.kannada);
  }

  if (selected.length > 0) return selected;

  return DICTIONARY
    .filter((word) => !hasRestrictedGlyphsForLevel(word.kannada, currentLevel))
    .slice(0, limit)
    .map((word) => ({
      ...word,
      focusGlyph: glyphs.find((glyph) => word.kannada.includes(glyph)) ?? glyphs[0] ?? "",
    }))
    .filter((word) => word.focusGlyph.length > 0);
}
