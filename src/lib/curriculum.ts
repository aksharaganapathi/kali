import { Character, Level } from "@/types";

/* ─── L1: Core Vowels (10) ─────────────────────────────────── */
const coreVowels: Character[] = [
  { glyph: "ಅ", romanization: "a", aliases: ["a"], type: "vowel", audioLabel: "ಅ", frequencyRank: 1 },
  { glyph: "ಆ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel", audioLabel: "ಆ", frequencyRank: 2, parentGlyph: "ಅ", vdtDelta: "Downward hook extended from the right arm" },
  { glyph: "ಇ", romanization: "i", aliases: ["i"], type: "vowel", audioLabel: "ಇ", frequencyRank: 3 },
  { glyph: "ಈ", romanization: "ee", aliases: ["ee", "ii", "ī"], type: "vowel", audioLabel: "ಈ", frequencyRank: 4, parentGlyph: "ಇ", vdtDelta: "Horizontal bar and hook added to the top right" },
  { glyph: "ಉ", romanization: "u", aliases: ["u"], type: "vowel", audioLabel: "ಉ", frequencyRank: 5 },
  { glyph: "ಊ", romanization: "uu", aliases: ["uu", "oo", "ū"], type: "vowel", audioLabel: "ಊ", frequencyRank: 6, parentGlyph: "ಉ", vdtDelta: "Small upward tick added to the right tail" },
  { glyph: "ಎ", romanization: "e", aliases: ["e"], type: "vowel", audioLabel: "ಎ", frequencyRank: 7 },
  { glyph: "ಏ", romanization: "ae", aliases: ["ae", "ē", "ay", "ee"], type: "vowel", audioLabel: "ಏ", frequencyRank: 8, parentGlyph: "ಎ", vdtDelta: "Downward hook added to the top right" },
  { glyph: "ಒ", romanization: "o", aliases: ["o"], type: "vowel", audioLabel: "ಒ", frequencyRank: 9, confusablesWith: ["ಬ"] },
  { glyph: "ಓ", romanization: "oo", aliases: ["oo", "ō", "oh"], type: "vowel", audioLabel: "ಓ", frequencyRank: 10, parentGlyph: "ಒ", vdtDelta: "Downward hook added to the top right", confusablesWith: ["ಬ"] },
];

/* ─── L2: High-Frequency Consonants (10) ──────────────────── */
const hfConsonants: Character[] = [
  { glyph: "ಕ", romanization: "ka", aliases: ["ka"], type: "consonant", audioLabel: "ಕ", frequencyRank: 1, confusablesWith: ["ಖ"] },
  { glyph: "ನ", romanization: "na", aliases: ["na"], type: "consonant", audioLabel: "ನ", frequencyRank: 2, confusablesWith: ["ಹ", "ಳ"] },
  { glyph: "ರ", romanization: "ra", aliases: ["ra"], type: "consonant", audioLabel: "ರ", frequencyRank: 3 },
  { glyph: "ಲ", romanization: "la", aliases: ["la"], type: "consonant", audioLabel: "ಲ", frequencyRank: 4 },
  { glyph: "ತ", romanization: "ta", aliases: ["ta", "tha"], type: "consonant", audioLabel: "ತ", frequencyRank: 5, confusablesWith: ["ಥ"] },
  { glyph: "ದ", romanization: "da", aliases: ["da", "dha"], type: "consonant", audioLabel: "ದ", frequencyRank: 6, confusablesWith: ["ಧ", "ಥ"] },
  { glyph: "ಮ", romanization: "ma", aliases: ["ma"], type: "consonant", audioLabel: "ಮ", frequencyRank: 7, confusablesWith: ["ಯ"] },
  { glyph: "ಸ", romanization: "sa", aliases: ["sa"], type: "consonant", audioLabel: "ಸ", frequencyRank: 8, confusablesWith: ["ಗ"] },
  { glyph: "ಹ", romanization: "ha", aliases: ["ha"], type: "consonant", audioLabel: "ಹ", frequencyRank: 9, confusablesWith: ["ನ"] },
  { glyph: "ಗ", romanization: "ga", aliases: ["ga"], type: "consonant", audioLabel: "ಗ", frequencyRank: 10, confusablesWith: ["ಘ", "ಸ"] },
];

/* ─── L3: Core Kagunita — HFF-3 (3) ──────────────────────── */
const coreKagunita: Character[] = [
  { glyph: "ಾ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel-sign", audioLabel: "ಕಾ", context: "ಕಾ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], confusablesWith: [] },
  { glyph: "ಿ", romanization: "i", aliases: ["i"], type: "vowel-sign", audioLabel: "ಕಿ", context: "ಕಿ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], confusablesWith: ["ೀ"] },
  { glyph: "ು", romanization: "u", aliases: ["u"], type: "vowel-sign", audioLabel: "ಕು", context: "ಕು", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], confusablesWith: ["ೂ"] },
];

/* ─── L4: Extended Consonants (6) ─────────────────────────── */
const extendedConsonants: Character[] = [
  { glyph: "ಪ", romanization: "pa", aliases: ["pa"], type: "consonant", audioLabel: "ಪ", confusablesWith: ["ವ", "ಫ"] },
  { glyph: "ಬ", romanization: "ba", aliases: ["ba"], type: "consonant", audioLabel: "ಬ", confusablesWith: ["ಭ", "ಒ"] },
  { glyph: "ಜ", romanization: "ja", aliases: ["ja"], type: "consonant", audioLabel: "ಜ", confusablesWith: ["ಝ"] },
  { glyph: "ಚ", romanization: "cha", aliases: ["cha", "ca"], type: "consonant", audioLabel: "ಚ", confusablesWith: ["ಛ"] },
  { glyph: "ಯ", romanization: "ya", aliases: ["ya"], type: "consonant", audioLabel: "ಯ", confusablesWith: ["ಮ"] },
  { glyph: "ವ", romanization: "va", aliases: ["va", "wa"], type: "consonant", audioLabel: "ವ", confusablesWith: ["ಪ"] },
];

/* ─── L5: Remaining Kagunita (9) ──────────────────────────── */
const remainingKagunita: Character[] = [
  { glyph: "ೀ", romanization: "ee", aliases: ["ee", "ii", "ī"], type: "vowel-sign", audioLabel: "ಕೀ", context: "ಕೀ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], parentGlyph: "ಿ", vdtDelta: "Extended curling tail ending downward", confusablesWith: ["ಿ"] },
  { glyph: "ೂ", romanization: "uu", aliases: ["uu", "oo", "ū"], type: "vowel-sign", audioLabel: "ಕೂ", context: "ಕೂ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], parentGlyph: "ು", vdtDelta: "Bottom hook folds twice into an S-curve", confusablesWith: ["ು"] },
  { glyph: "ೆ", romanization: "e", aliases: ["e"], type: "vowel-sign", audioLabel: "ಕೆ", context: "ಕೆ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], confusablesWith: ["ೇ"] },
  { glyph: "ೇ", romanization: "ae", aliases: ["ae", "ē", "ay"], type: "vowel-sign", audioLabel: "ಕೇ", context: "ಕೇ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], parentGlyph: "ೆ", vdtDelta: "Extended tail sweeping down and right", confusablesWith: ["ೆ"] },
  { glyph: "ೈ", romanization: "ai", aliases: ["ai"], type: "vowel-sign", audioLabel: "ಕೈ", context: "ಕೈ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"] },
  { glyph: "ೊ", romanization: "o", aliases: ["o"], type: "vowel-sign", audioLabel: "ಕೊ", context: "ಕೊ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], confusablesWith: ["ೋ"] },
  { glyph: "ೋ", romanization: "oo", aliases: ["oo", "ō", "oh"], type: "vowel-sign", audioLabel: "ಕೋ", context: "ಕೋ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"], parentGlyph: "ೊ", vdtDelta: "Extended tail sweeping down and right", confusablesWith: ["ೊ"] },
  { glyph: "ೌ", romanization: "au", aliases: ["au", "ow"], type: "vowel-sign", audioLabel: "ಕೌ", context: "ಕೌ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"] },
  { glyph: "ೃ", romanization: "ru", aliases: ["ru", "ṛ", "ri"], type: "vowel-sign", audioLabel: "ಕೃ", context: "ಕೃ", ghostBases: ["ಕ", "ನ", "ಮ", "ಸ"] },
];

/* ─── L6: Anusvara & Visarga (2) ──────────────────────────── */
const anusvaraVisarga: Character[] = [
  { glyph: "ಂ", romanization: "am", aliases: ["am", "ṁ", "m"], type: "special", audioLabel: "ಅಂ", context: "ಅಂ" },
  { glyph: "ಃ", romanization: "aha", aliases: ["aha", "aḥ", "ah"], type: "special", audioLabel: "ಅಃ", context: "ಅಃ" },
];

/* ─── L7: Aspirated Consonants — Parent-Child VDT (8) ─────── */
const aspiratedConsonants: Character[] = [
  { glyph: "ಖ", romanization: "kha", aliases: ["kha"], type: "consonant", audioLabel: "ಖ", confusablesWith: ["ಕ"] },
  { glyph: "ಘ", romanization: "gha", aliases: ["gha"], type: "consonant", audioLabel: "ಘ", confusablesWith: ["ಗ"] },
  { glyph: "ಛ", romanization: "chha", aliases: ["cha", "ca"], type: "consonant", audioLabel: "ಛ", confusablesWith: ["ಚ"] },
  { glyph: "ಝ", romanization: "jha", aliases: ["jha"], type: "consonant", audioLabel: "ಝ", confusablesWith: ["ಜ"] },
  { glyph: "ಥ", romanization: "Tha", aliases: ["tha", "thha"], type: "consonant", audioLabel: "ಥ", confusablesWith: ["ತ", "ದ"] },
  { glyph: "ಧ", romanization: "dha", aliases: ["dha"], type: "consonant", audioLabel: "ಧ",
    parentGlyph: "ದ", vdtDelta: "Extra vertical descender stroke added", confusablesWith: ["ದ"] },
  { glyph: "ಫ", romanization: "pha", aliases: ["pha", "fa"], type: "consonant", audioLabel: "ಫ",
    parentGlyph: "ಪ", vdtDelta: "Right arm gains an outward curve/hook", confusablesWith: ["ಪ"] },
  { glyph: "ಭ", romanization: "bha", aliases: ["bha"], type: "consonant", audioLabel: "ಭ",
    parentGlyph: "ಬ", vdtDelta: "Tail extends below the baseline with a curl", confusablesWith: ["ಬ"] },
];

/* ─── L8: Retroflexes (6) ─────────────────────────────────── */
const retroflexes: Character[] = [
  { glyph: "ಟ", romanization: "Ta", aliases: ["ta", "ṭa"], type: "consonant", audioLabel: "ಟ", confusablesWith: ["ಠ"] },
  { glyph: "ಠ", romanization: "Tha", aliases: ["tha", "ṭha"], type: "consonant", audioLabel: "ಠ", confusablesWith: ["ಟ"] },
  { glyph: "ಡ", romanization: "Da", aliases: ["da", "ḍa"], type: "consonant", audioLabel: "ಡ", confusablesWith: ["ಢ"] },
  { glyph: "ಢ", romanization: "Dha", aliases: ["dha", "ḍha"], type: "consonant", audioLabel: "ಢ", parentGlyph: "ಡ", vdtDelta: "Center dot added to the base loop", confusablesWith: ["ಡ"] },
  { glyph: "ಣ", romanization: "Na", aliases: ["na", "ṇa"], type: "consonant", audioLabel: "ಣ" },
  { glyph: "ಳ", romanization: "La", aliases: ["la", "ḷa"], type: "consonant", audioLabel: "ಳ", confusablesWith: ["ನ"] },
];

/* ─── L9: Sibilants + Rare Vowels (5) ─────────────────────── */
const sibilantsAndRare: Character[] = [
  { glyph: "ಶ", romanization: "sha", aliases: ["sha", "śa"], type: "consonant", audioLabel: "ಶ", confusablesWith: ["ಷ"] },
  { glyph: "ಷ", romanization: "Sha", aliases: ["sha", "ṣa"], type: "consonant", audioLabel: "ಷ", confusablesWith: ["ಶ"] },
  { glyph: "ಋ", romanization: "ru", aliases: ["ru", "ṛ", "ri"], type: "vowel", audioLabel: "ಋ" },
  { glyph: "ಐ", romanization: "ai", aliases: ["ai"], type: "vowel", audioLabel: "ಐ" },
  { glyph: "ಔ", romanization: "au", aliases: ["au", "ow"], type: "vowel", audioLabel: "ಔ" },
];

/* ─── L10: Conjuncts / Ottaksharas (10) ───────────────────── */
const conjuncts: Character[] = [
  { glyph: "ಕ್ಕ", romanization: "kka", aliases: ["kka"], type: "conjunct", audioLabel: "ಕ್ಕ" },
  { glyph: "ತ್ತ", romanization: "tta", aliases: ["tta", "ththa"], type: "conjunct", audioLabel: "ತ್ತ" },
  { glyph: "ನ್ನ", romanization: "nna", aliases: ["nna"], type: "conjunct", audioLabel: "ನ್ನ" },
  { glyph: "ಲ್ಲ", romanization: "lla", aliases: ["lla"], type: "conjunct", audioLabel: "ಲ್ಲ" },
  { glyph: "ಪ್ಪ", romanization: "ppa", aliases: ["ppa"], type: "conjunct", audioLabel: "ಪ್ಪ" },
  { glyph: "ಸ್ತ", romanization: "sta", aliases: ["sta", "stha"], type: "conjunct", audioLabel: "ಸ್ತ" },
  { glyph: "ಪ್ರ", romanization: "pra", aliases: ["pra"], type: "conjunct", audioLabel: "ಪ್ರ" },
  { glyph: "ಗ್ರ", romanization: "gra", aliases: ["gra"], type: "conjunct", audioLabel: "ಗ್ರ" },
  { glyph: "ಕ್ಷ", romanization: "ksha", aliases: ["ksha", "kṣa"], type: "conjunct", audioLabel: "ಕ್ಷ" },
  { glyph: "ಜ್ಞ", romanization: "gnya", aliases: ["gnya", "jña", "dnya"], type: "conjunct", audioLabel: "ಜ್ಞ" },
];

/* ─── Levels ──────────────────────────────────────────────── */
export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Core Vowels",
    kannadaName: "ಮೂಲ ಸ್ವರಗಳು",
    description: "The 10 most common vowel sounds — the foundation of every Kannada syllable.",
    characters: coreVowels,
  },
  {
    id: 2,
    name: "High-Frequency Consonants",
    kannadaName: "ಪ್ರಮುಖ ವ್ಯಂಜನಗಳು",
    description: "The 10 most commonly used consonants. Start decoding real words.",
    characters: hfConsonants,
  },
  {
    id: 3,
    name: "Core Vowel Signs",
    kannadaName: "ಮೂಲ ಕಾಗುಣಿತ",
    description: "The three most common vowel signs (ಾ ಿ ು) — transform consonants into syllables.",
    characters: coreKagunita,
  },
  {
    id: 4,
    name: "Extended Consonants",
    kannadaName: "ಹೆಚ್ಚುವರಿ ವ್ಯಂಜನಗಳು",
    description: "Six more essential consonants that complete everyday vocabulary.",
    characters: extendedConsonants,
  },
  {
    id: 5,
    name: "Full Kagunita",
    kannadaName: "ಪೂರ್ಣ ಕಾಗುಣಿತ",
    description: "All remaining vowel signs — unlock the full syllable system.",
    characters: remainingKagunita,
  },
  {
    id: 6,
    name: "Anusvara & Visarga",
    kannadaName: "ಅನುಸ್ವಾರ ಮತ್ತು ವಿಸರ್ಗ",
    description: "Nasal (ಂ) and breath (ಃ) modifiers — hugely expand your word pool.",
    characters: anusvaraVisarga,
  },
  {
    id: 7,
    name: "Aspirated Consonants",
    kannadaName: "ಮಹಾಪ್ರಾಣ ವ್ಯಂಜನಗಳು",
    description: "Parent-child pairs — spot the visual delta that adds aspiration.",
    characters: aspiratedConsonants,
  },
  {
    id: 8,
    name: "Retroflexes",
    kannadaName: "ಮೂರ್ಧನ್ಯ ವ್ಯಂಜನಗಳು",
    description: "Tongue-curled consonants that give Kannada its distinctive feel.",
    characters: retroflexes,
  },
  {
    id: 9,
    name: "Sibilants & Rare Vowels",
    kannadaName: "ಊಷ್ಮ ಮತ್ತು ಅಪರೂಪದ ಸ್ವರ",
    description: "Hissing consonants and infrequent vowels for complete coverage.",
    characters: sibilantsAndRare,
  },
  {
    id: 10,
    name: "Conjuncts",
    kannadaName: "ಒತ್ತಕ್ಷರಗಳು",
    description: "Consonant clusters — two sounds fused into a single glyph.",
    characters: conjuncts,
  },
];

/** Flat list of every character across all levels */
export const ALL_CHARACTERS: Character[] = LEVELS.flatMap((l) => l.characters);

/** Quick lookup: glyph → Character */
export const CHAR_MAP = new Map<string, Character>(
  ALL_CHARACTERS.map((c) => [c.glyph, c])
);
