import { Character, Level } from "@/types";

/* ─── L1: Vowels (Swaras) ─────────────────────────────────── */
const vowels: Character[] = [
  { glyph: "ಅ", romanization: "a", aliases: ["a"], type: "vowel", audioLabel: "ಅ" },
  { glyph: "ಆ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel", audioLabel: "ಆ" },
  { glyph: "ಇ", romanization: "i", aliases: ["i"], type: "vowel", audioLabel: "ಇ" },
  { glyph: "ಈ", romanization: "ee", aliases: ["ee", "ii", "ī"], type: "vowel", audioLabel: "ಈ" },
  { glyph: "ಉ", romanization: "u", aliases: ["u"], type: "vowel", audioLabel: "ಉ" },
  { glyph: "ಊ", romanization: "uu", aliases: ["uu", "oo", "ū"], type: "vowel", audioLabel: "ಊ" },
  { glyph: "ಋ", romanization: "ru", aliases: ["ru", "ṛ", "ri"], type: "vowel", audioLabel: "ಋ" },
  { glyph: "ಎ", romanization: "e", aliases: ["e"], type: "vowel", audioLabel: "ಎ" },
  { glyph: "ಏ", romanization: "ae", aliases: ["ae", "ē", "ay", "ee"], type: "vowel", audioLabel: "ಏ" },
  { glyph: "ಐ", romanization: "ai", aliases: ["ai"], type: "vowel", audioLabel: "ಐ" },
  { glyph: "ಒ", romanization: "o", aliases: ["o"], type: "vowel", audioLabel: "ಒ" },
  { glyph: "ಓ", romanization: "oo", aliases: ["oo", "ō", "oh"], type: "vowel", audioLabel: "ಓ" },
  { glyph: "ಔ", romanization: "au", aliases: ["au", "ow"], type: "vowel", audioLabel: "ಔ" },
];

/* ─── L2: Basic Consonants (Vyanjanas) ────────────────────── */
const basicConsonants: Character[] = [
  { glyph: "ಕ", romanization: "ka", aliases: ["ka"], type: "consonant", audioLabel: "ಕ" },
  { glyph: "ಗ", romanization: "ga", aliases: ["ga"], type: "consonant", audioLabel: "ಗ" },
  { glyph: "ಚ", romanization: "cha", aliases: ["cha", "ca"], type: "consonant", audioLabel: "ಚ" },
  { glyph: "ಜ", romanization: "ja", aliases: ["ja"], type: "consonant", audioLabel: "ಜ" },
  { glyph: "ತ", romanization: "ta", aliases: ["ta", "tha"], type: "consonant", audioLabel: "ತ" },
  { glyph: "ದ", romanization: "da", aliases: ["da", "dha"], type: "consonant", audioLabel: "ದ" },
  { glyph: "ನ", romanization: "na", aliases: ["na"], type: "consonant", audioLabel: "ನ" },
  { glyph: "ಪ", romanization: "pa", aliases: ["pa"], type: "consonant", audioLabel: "ಪ" },
  { glyph: "ಬ", romanization: "ba", aliases: ["ba"], type: "consonant", audioLabel: "ಬ" },
  { glyph: "ಮ", romanization: "ma", aliases: ["ma"], type: "consonant", audioLabel: "ಮ" },
  { glyph: "ಯ", romanization: "ya", aliases: ["ya"], type: "consonant", audioLabel: "ಯ" },
  { glyph: "ರ", romanization: "ra", aliases: ["ra"], type: "consonant", audioLabel: "ರ" },
  { glyph: "ಲ", romanization: "la", aliases: ["la"], type: "consonant", audioLabel: "ಲ" },
  { glyph: "ವ", romanization: "va", aliases: ["va", "wa"], type: "consonant", audioLabel: "ವ" },
  { glyph: "ಸ", romanization: "sa", aliases: ["sa"], type: "consonant", audioLabel: "ಸ" },
  { glyph: "ಹ", romanization: "ha", aliases: ["ha"], type: "consonant", audioLabel: "ಹ" },
];

/* ─── L3a: Top Signs / Kagunita Hats ──────────────────────── */
const topVowelSigns: Character[] = [
  { glyph: "ಿ", romanization: "i", aliases: ["i"], type: "vowel-sign", audioLabel: "ಕಿ", context: "ಕಿ" },
  { glyph: "ೀ", romanization: "ee", aliases: ["ee", "ii", "ī"], type: "vowel-sign", audioLabel: "ಕೀ", context: "ಕೀ" },
  { glyph: "ೆ", romanization: "e", aliases: ["e"], type: "vowel-sign", audioLabel: "ಕೆ", context: "ಕೆ" },
  { glyph: "ೇ", romanization: "ae", aliases: ["ae", "ē", "ay"], type: "vowel-sign", audioLabel: "ಕೇ", context: "ಕೇ" },
  { glyph: "ೈ", romanization: "ai", aliases: ["ai"], type: "vowel-sign", audioLabel: "ಕೈ", context: "ಕೈ" },
];

/* ─── L3b: Side / Wrap Signs ─────────────────────────────── */
const sideWrapVowelSigns: Character[] = [
  { glyph: "ಾ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel-sign", audioLabel: "ಕಾ", context: "ಕಾ" },
  { glyph: "ೊ", romanization: "o", aliases: ["o"], type: "vowel-sign", audioLabel: "ಕೊ", context: "ಕೊ" },
  { glyph: "ೋ", romanization: "oo", aliases: ["oo", "ō", "oh"], type: "vowel-sign", audioLabel: "ಕೋ", context: "ಕೋ" },
  { glyph: "ೌ", romanization: "au", aliases: ["au", "ow"], type: "vowel-sign", audioLabel: "ಕೌ", context: "ಕೌ" },
];

/* ─── L3c: Bottom Signs / Footers ────────────────────────── */
const bottomVowelSigns: Character[] = [
  { glyph: "ು", romanization: "u", aliases: ["u"], type: "vowel-sign", audioLabel: "ಕು", context: "ಕು" },
  { glyph: "ೂ", romanization: "uu", aliases: ["uu", "oo", "ū"], type: "vowel-sign", audioLabel: "ಕೂ", context: "ಕೂ" },
  { glyph: "ೃ", romanization: "ru", aliases: ["ru", "ṛ", "ri"], type: "vowel-sign", audioLabel: "ಕೃ", context: "ಕೃ" },
];

/* ─── L4: Retroflex & Aspirated Consonants ────────────────── */
const retroflexAspirated: Character[] = [
  { glyph: "ಟ", romanization: "Ta", aliases: ["ta", "ṭa"], type: "consonant", audioLabel: "ಟ" },
  { glyph: "ಠ", romanization: "Tha", aliases: ["tha", "ṭha"], type: "consonant", audioLabel: "ಠ" },
  { glyph: "ಡ", romanization: "Da", aliases: ["da", "ḍa"], type: "consonant", audioLabel: "ಡ" },
  { glyph: "ಢ", romanization: "Dha", aliases: ["dha", "ḍha"], type: "consonant", audioLabel: "ಢ" },
  { glyph: "ಣ", romanization: "Na", aliases: ["na", "ṇa"], type: "consonant", audioLabel: "ಣ" },
  { glyph: "ಖ", romanization: "kha", aliases: ["kha"], type: "consonant", audioLabel: "ಖ" },
  { glyph: "ಘ", romanization: "gha", aliases: ["gha"], type: "consonant", audioLabel: "ಘ" },
  { glyph: "ಛ", romanization: "Cha", aliases: ["chha", "cha"], type: "consonant", audioLabel: "ಛ" },
  { glyph: "ಝ", romanization: "jha", aliases: ["jha"], type: "consonant", audioLabel: "ಝ" },
  { glyph: "ಥ", romanization: "tha", aliases: ["tha"], type: "consonant", audioLabel: "ಥ" },
  { glyph: "ಧ", romanization: "dha", aliases: ["dha"], type: "consonant", audioLabel: "ಧ" },
  { glyph: "ಫ", romanization: "pha", aliases: ["pha", "fa"], type: "consonant", audioLabel: "ಫ" },
  { glyph: "ಭ", romanization: "bha", aliases: ["bha"], type: "consonant", audioLabel: "ಭ" },
  { glyph: "ಶ", romanization: "sha", aliases: ["sha", "śa"], type: "consonant", audioLabel: "ಶ" },
  { glyph: "ಷ", romanization: "Sha", aliases: ["sha", "ṣa"], type: "consonant", audioLabel: "ಷ" },
];

/* ─── L5: Conjuncts / Ottaksharas ─────────────────────────── */
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

/* ─── L6: Special Symbols ─────────────────────────────────── */
const specialSymbols: Character[] = [
  { glyph: "ಂ", romanization: "am", aliases: ["am", "ṁ", "m"], type: "special", audioLabel: "ಅಂ", context: "ಅಂ" },
  { glyph: "ಃ", romanization: "aha", aliases: ["aha", "aḥ", "ah"], type: "special", audioLabel: "ಅಃ", context: "ಅಃ" },
  { glyph: "಼", romanization: "nukta", aliases: ["nukta"], type: "special", audioLabel: "಼" },
];

/* ─── Levels ──────────────────────────────────────────────── */
export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Vowels",
    kannadaName: "ಸ್ವರಗಳು",
    description: "The 13 foundational vowel sounds — the building blocks of every syllable.",
    characters: vowels,
  },
  {
    id: 2,
    name: "Basic Consonants",
    kannadaName: "ವ್ಯಂಜನಗಳು",
    description: "16 essential consonants that form the backbone of Kannada words.",
    characters: basicConsonants,
  },
  {
    id: "3a",
    name: "Top Signs",
    kannadaName: "ಮೇಲ್ಭಾಗದ ಕಾಗುಣಿತ",
    description: "Hat-like vowel signs for fast top-shape discrimination.",
    characters: topVowelSigns,
  },
  {
    id: "3b",
    name: "Side/Wrap Signs",
    kannadaName: "ಪಕ್ಕದ ಕಾಗುಣಿತ",
    description: "Wrapper signs that reshape syllables around the consonant body.",
    characters: sideWrapVowelSigns,
  },
  {
    id: "3c",
    name: "Bottom Signs",
    kannadaName: "ಕೆಳಭಾಗದ ಕಾಗುಣಿತ",
    description: "Footer signs that hang below the base glyph.",
    characters: bottomVowelSigns,
  },
  {
    id: 4,
    name: "Retroflex & Aspirated",
    kannadaName: "ಮಹಾಪ್ರಾಣ",
    description: "Advanced consonants with tongue-curled and breathy sounds.",
    characters: retroflexAspirated,
  },
  {
    id: 5,
    name: "Conjuncts",
    kannadaName: "ಒತ್ತಕ್ಷರಗಳು",
    description: "Consonant clusters — two sounds fused into a single glyph.",
    characters: conjuncts,
  },
  {
    id: 6,
    name: "Special Symbols",
    kannadaName: "ವಿಶೇಷ ಚಿಹ್ನೆಗಳು",
    description: "Nasalization (Anusvara), aspiration (Visarga), and the Nukta modifier.",
    characters: specialSymbols,
  },
];

/** Flat list of every character across all levels */
export const ALL_CHARACTERS: Character[] = LEVELS.flatMap((l) => l.characters);

/** Quick lookup: glyph → Character */
export const CHAR_MAP = new Map<string, Character>(
  ALL_CHARACTERS.map((c) => [c.glyph, c])
);
