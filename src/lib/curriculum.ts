import { Character, Level } from "@/types";

/* ─── L1: Complete Vowels (Swaras & Yogavaahas - 15) ────────────────────── */
const completeVowels: Character[] = [
  { glyph: "ಅ", romanization: "a", aliases: ["a"], type: "vowel", audioLabel: "ಅ", frequencyRank: 1 },
  { glyph: "ಆ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel", audioLabel: "ಆ", frequencyRank: 2, parentGlyph: "ಅ", vdtDelta: "Downward hook extended from the right arm" },
  { glyph: "ಇ", romanization: "i", aliases: ["i"], type: "vowel", audioLabel: "ಇ", frequencyRank: 3 },
  { glyph: "ಈ", romanization: "ee", aliases: ["ee", "ī", "I"], type: "vowel", audioLabel: "ಈ", frequencyRank: 4, parentGlyph: "ಇ", vdtDelta: "Right-side tail elongated and looped over" },
  { glyph: "ಉ", romanization: "u", aliases: ["u"], type: "vowel", audioLabel: "ಉ", frequencyRank: 5 },
  { glyph: "ಊ", romanization: "uu", aliases: ["uu", "ū", "U"], type: "vowel", audioLabel: "ಊ", frequencyRank: 6, parentGlyph: "ಉ", vdtDelta: "Extended right arm with a downward hook" },
  { glyph: "ಋ", romanization: "ru", aliases: ["ru"], type: "vowel", audioLabel: "ಋ", frequencyRank: 13 },
  { glyph: "ಎ", romanization: "e", aliases: ["e"], type: "vowel", audioLabel: "ಎ", frequencyRank: 7 },
  { glyph: "ಏ", romanization: "ē", aliases: ["ē", "ae", "E"], type: "vowel", audioLabel: "ಏ", frequencyRank: 8, parentGlyph: "ಎ", vdtDelta: "Extended right arm hooked downwards" },
  { glyph: "ಐ", romanization: "ai", aliases: ["ai"], type: "vowel", audioLabel: "ಐ", frequencyRank: 11 },
  { glyph: "ಒ", romanization: "o", aliases: ["o"], type: "vowel", audioLabel: "ಒ", frequencyRank: 9 },
  { glyph: "ಓ", romanization: "oo", aliases: ["oo", "ō", "O"], type: "vowel", audioLabel: "ಓ", frequencyRank: 10, parentGlyph: "ಒ", vdtDelta: "Extended right arm hooked downwards" },
  { glyph: "ಔ", romanization: "au", aliases: ["au", "ow"], type: "vowel", audioLabel: "ಔ", frequencyRank: 12 },
  { glyph: "ಅಂ", romanization: "am", aliases: ["am"], type: "yogavaaha", audioLabel: "ಅಂ", frequencyRank: 14, parentGlyph: "ಅ", vdtDelta: "Added zero (anusvara) to the right", description: "Anusvara" },
  { glyph: "ಅಃ", romanization: "aha", aliases: ["aha"], type: "yogavaaha", audioLabel: "ಅಃ", frequencyRank: 15, parentGlyph: "ಅ", vdtDelta: "Added double zero (visarga) to the right", description: "Visarga" },
];

/* ─── L2: Primary Consonants (10) ─────────────────────────── */
const primaryConsonants: Character[] = [
  { glyph: "ಕ", romanization: "ka", aliases: ["ka", "k"], type: "consonant", audioLabel: "ಕ" },
  { glyph: "ನ", romanization: "na", aliases: ["na", "n"], type: "consonant", audioLabel: "ನ" },
  { glyph: "ರ", romanization: "ra", aliases: ["ra", "r"], type: "consonant", audioLabel: "ರ" },
  { glyph: "ಲ", romanization: "la", aliases: ["la", "l"], type: "consonant", audioLabel: "ಲ" },
  { glyph: "ತ", romanization: "ta", aliases: ["ta", "t"], type: "consonant", audioLabel: "ತ" },
  { glyph: "ದ", romanization: "da", aliases: ["da", "d"], type: "consonant", audioLabel: "ದ" },
  { glyph: "ಮ", romanization: "ma", aliases: ["ma", "m"], type: "consonant", audioLabel: "ಮ" },
  { glyph: "ಸ", romanization: "sa", aliases: ["sa", "s"], type: "consonant", audioLabel: "ಸ" },
  { glyph: "ಹ", romanization: "ha", aliases: ["ha", "h"], type: "consonant", audioLabel: "ಹ" },
  { glyph: "ಗ", romanization: "ga", aliases: ["ga", "g"], type: "consonant", audioLabel: "ಗ" },
];

/* ─── L3: Vowel Signs I (6) ──────────────────────────────── */
const vowelSignsPart1: Character[] = [
  { glyph: "ಾ", romanization: "aa", aliases: ["aa", "ā"], type: "vowel-sign", audioLabel: "ಕಾ" },
  { glyph: "ಿ", romanization: "i", aliases: ["i"], type: "vowel-sign", audioLabel: "ಕಿ" },
  { glyph: "ೀ", romanization: "ee", aliases: ["ee", "ī"], type: "vowel-sign", audioLabel: "ಕೀ", parentGlyph: "ಿ", vdtDelta: "Tail extended and looped downwards" },
  { glyph: "ು", romanization: "u", aliases: ["u"], type: "vowel-sign", audioLabel: "ಕು" },
  { glyph: "ೂ", romanization: "uu", aliases: ["uu", "ū"], type: "vowel-sign", audioLabel: "ಕೂ", parentGlyph: "ು", vdtDelta: "Right loop extended downwards" },
  { glyph: "ೃ", romanization: "ri", aliases: ["ri", "ru"], type: "vowel-sign", audioLabel: "ಕೃ" },
];

/* ─── L4: Secondary & Nasals (8) ─────────────────────────── */
const secondaryConsonants: Character[] = [
  { glyph: "ಪ", romanization: "pa", aliases: ["pa", "p"], type: "consonant", audioLabel: "ಪ" },
  { glyph: "ಬ", romanization: "ba", aliases: ["ba", "b"], type: "consonant", audioLabel: "ಬ" },
  { glyph: "ಜ", romanization: "ja", aliases: ["ja", "j"], type: "consonant", audioLabel: "ಜ" },
  { glyph: "ಚ", romanization: "cha", aliases: ["cha", "ch"], type: "consonant", audioLabel: "ಚ" },
  { glyph: "ಯ", romanization: "ya", aliases: ["ya", "y"], type: "consonant", audioLabel: "ಯ" },
  { glyph: "ವ", romanization: "va", aliases: ["va", "v"], type: "consonant", audioLabel: "ವ" },
  { glyph: "ಙ", romanization: "nga", aliases: ["nga"], type: "consonant", audioLabel: "ಙ" },
  { glyph: "ಞ", romanization: "ña", aliases: ["nya", "ña"], type: "consonant", audioLabel: "ಞ", description: "Palatal nasal, avoid confusing with ನ್+ಯ" },
];

/* ─── L5: Vowel Signs II (6) ─────────────────────────────── */
const vowelSignsPart2: Character[] = [
  { glyph: "ೆ", romanization: "e", aliases: ["e"], type: "vowel-sign", audioLabel: "ಕೆ" },
  { glyph: "ೇ", romanization: "ē", aliases: ["ē", "ae"], type: "vowel-sign", audioLabel: "ಕೇ", parentGlyph: "ೆ", vdtDelta: "Extended right arm hooked downwards" },
  { glyph: "ೈ", romanization: "ai", aliases: ["ai"], type: "vowel-sign", audioLabel: "ಕೈ", parentGlyph: "ೆ", vdtDelta: "Bottom secondary loop added below" },
  { glyph: "ೊ", romanization: "o", aliases: ["o"], type: "vowel-sign", audioLabel: "ಕೊ" },
  { glyph: "ೋ", romanization: "oo", aliases: ["oo", "ō"], type: "vowel-sign", audioLabel: "ಕೋ", parentGlyph: "ೊ", vdtDelta: "Extended right arm hooked downwards" },
  { glyph: "ೌ", romanization: "au", aliases: ["au", "ow"], type: "vowel-sign", audioLabel: "ಕೌ", parentGlyph: "ೊ", vdtDelta: "Bottom secondary loop added below" },
];

/* ─── L6: Structural Logic (1) ───────────────────────────── */
const structuralModifiers: Character[] = [
  { glyph: "್", romanization: "halant", aliases: ["halant", "virama"], type: "special", audioLabel: "ಕ್", description: "Vowel killer" },
];

/* ─── L7: Aspirated Stops (Non-Retroflex) (8) ────────────── */
const aspiratedConsonants: Character[] = [
  { glyph: "ಖ", romanization: "kha", aliases: ["kha", "kh"], type: "consonant", audioLabel: "ಖ", parentGlyph: "ಕ", vdtDelta: "Bottom downward stroke (vottu) added" },
  { glyph: "ಘ", romanization: "gha", aliases: ["gha", "gh"], type: "consonant", audioLabel: "ಘ" },
  { glyph: "ಛ", romanization: "chha", aliases: ["chha", "chh"], type: "consonant", audioLabel: "ಛ", parentGlyph: "ಚ", vdtDelta: "Bottom downward stroke (vottu) added" },
  { glyph: "ಝ", romanization: "jha", aliases: ["jha", "jh"], type: "consonant", audioLabel: "ಝ", parentGlyph: "ಜ", vdtDelta: "Right vertical loop added" },
  { glyph: "ಥ", romanization: "tha", aliases: ["tha", "th"], type: "consonant", audioLabel: "ಥ", parentGlyph: "ತ", vdtDelta: "Dot added to the center inside loop" },
  { glyph: "ಧ", romanization: "dha", aliases: ["dha", "dh"], type: "consonant", audioLabel: "ಧ", parentGlyph: "ದ", vdtDelta: "Top right vertical upward stroke added" },
  { glyph: "ಫ", romanization: "pha", aliases: ["pha", "fa", "f"], type: "consonant", audioLabel: "ಫ", parentGlyph: "ಪ", vdtDelta: "Bottom downward stroke (vottu) added", description: "Often pronounced as 'fa' in modern usage" },
  { glyph: "ಭ", romanization: "bha", aliases: ["bha", "bh"], type: "consonant", audioLabel: "ಭ", parentGlyph: "ಬ", vdtDelta: "Bottom downward stroke (vottu) added" },
];

/* ─── L8: Retroflexes & Sibilants (8) ────────────────────── */
const retroflexesAndSibilants: Character[] = [
  { glyph: "ಟ", romanization: "Ta", aliases: ["Ta", "T"], type: "consonant", audioLabel: "ಟ" },
  { glyph: "ಠ", romanization: "Tha", aliases: ["Tha", "Th"], type: "consonant", audioLabel: "ಠ", parentGlyph: "ಟ", vdtDelta: "Dot added to the center inside loop" },
  { glyph: "ಡ", romanization: "Da", aliases: ["Da", "D"], type: "consonant", audioLabel: "ಡ" },
  { glyph: "ಢ", romanization: "Dha", aliases: ["Dha", "Dh"], type: "consonant", audioLabel: "ಢ", parentGlyph: "ಡ", vdtDelta: "Bottom downward stroke (vottu) added" },
  { glyph: "ಣ", romanization: "Na", aliases: ["Na", "N"], type: "consonant", audioLabel: "ಣ" },
  { glyph: "ಳ", romanization: "La", aliases: ["La", "L"], type: "consonant", audioLabel: "ಳ" },
  { glyph: "ಶ", romanization: "sha", aliases: ["sha", "sh"], type: "consonant", audioLabel: "ಶ" },
  { glyph: "ಷ", romanization: "Sha", aliases: ["Sha", "Sh"], type: "consonant", audioLabel: "ಷ", parentGlyph: "ಪ", vdtDelta: "Horizontal belly stroke split/notched" },
];

/* ─── L9: Visual Exceptions & Ligatures (15) ───────────── */
const visualExceptions: Character[] = [
  { glyph: "ರು", romanization: "ru", aliases: ["ru"], type: "syllable", audioLabel: "ರು" },
  { glyph: "ರೂ", romanization: "ruu", aliases: ["ruu", "rū"], type: "syllable", audioLabel: "ರೂ", parentGlyph: "ರು", vdtDelta: "Extended right tail loop" },
  { glyph: "ರ್ಕ", romanization: "rka", aliases: ["rka"], type: "syllable", audioLabel: "ರ್ಕ", description: "Ra as leading consonant in conjunct" },
  { glyph: "ಮೈ", romanization: "mai", aliases: ["mai"], type: "syllable", audioLabel: "ಮೈ", parentGlyph: "ಮ", vdtDelta: "Vowel sign integrates into base glyph", description: "Ma + ai ligature" },
  { glyph: "ಮೊ", romanization: "mo", aliases: ["mo"], type: "syllable", audioLabel: "ಮೊ", parentGlyph: "ಮ", vdtDelta: "Vowel sign wraps entirely around base", description: "Ma + o ligature" },
  { glyph: "ಮೋ", romanization: "moo", aliases: ["moo"], type: "syllable", audioLabel: "ಮೋ", parentGlyph: "ಮೊ", vdtDelta: "Right tail extended on wrap", description: "Ma + oo ligature" },
  { glyph: "ಯಾ", romanization: "yaa", aliases: ["yaa", "yā"], type: "syllable", audioLabel: "ಯಾ", parentGlyph: "ಯ", vdtDelta: "Base shape rounds off, absorbing the long marker", description: "Ya + aa visual exception" },
  { glyph: "ಯೇ", romanization: "yē", aliases: ["yē", "yae"], type: "syllable", audioLabel: "ಯೇ", parentGlyph: "ಯ", vdtDelta: "Marker integrates internally into the loop", description: "Ya + ē visual exception" },
  { glyph: "ಯೋ", romanization: "yoo", aliases: ["yoo", "yō"], type: "syllable", audioLabel: "ಯೋ", parentGlyph: "ಯ", vdtDelta: "Marker fully shapes the top geometry", description: "Ya + oo visual exception" },
  { glyph: "ಪು", romanization: "pu", aliases: ["pu"], type: "syllable", audioLabel: "ಪು", parentGlyph: "ಪ", vdtDelta: "Marker shifted horizontally to the right", description: "Horizontal shift for u marker" },
  { glyph: "ಪೂ", romanization: "puu", aliases: ["puu"], type: "syllable", audioLabel: "ಪೂ", parentGlyph: "ಪು", vdtDelta: "Marker tail extended downwards", description: "Horizontal shift for uu marker" },
  { glyph: "ವು", romanization: "vu", aliases: ["vu"], type: "syllable", audioLabel: "ವು", parentGlyph: "ವ", vdtDelta: "Marker shifted horizontally to the right", description: "Horizontal shift for u marker" },
  { glyph: "ವೂ", romanization: "vuu", aliases: ["vuu"], type: "syllable", audioLabel: "ವೂ", parentGlyph: "ವು", vdtDelta: "Marker tail extended downwards", description: "Horizontal shift for uu marker" },
  { glyph: "ಬು", romanization: "bu", aliases: ["bu"], type: "syllable", audioLabel: "ಬು", parentGlyph: "ಬ", vdtDelta: "Marker shifted horizontally to the right", description: "Horizontal shift for u marker" },
  { glyph: "ಬೂ", romanization: "buu", aliases: ["buu"], type: "syllable", audioLabel: "ಬೂ", parentGlyph: "ಬು", vdtDelta: "Marker tail extended downwards", description: "Horizontal shift for uu marker" },
];

/* ─── L10: Minimal Pairs (12) ─────────────── */
const minimalPairs: Character[] = [
  { glyph: "ವ", romanization: "va", aliases: ["va"], type: "consonant", audioLabel: "ವ", description: "Compare with ಪ (pa)" },
  { glyph: "ಪ", romanization: "pa", aliases: ["pa"], type: "consonant", audioLabel: "ಪ", parentGlyph: "ವ", vdtDelta: "Added horizontal belly stroke across the open cup", description: "Compare with ವ (va) and ಷ (Sha)" },
  { glyph: "ಷ", romanization: "Sha", aliases: ["Sha"], type: "consonant", audioLabel: "ಷ", parentGlyph: "ಪ", vdtDelta: "Split the horizontal belly line with an extra notch", description: "Compare with ಪ (pa)" },
  { glyph: "ಮ", romanization: "ma", aliases: ["ma"], type: "consonant", audioLabel: "ಮ", description: "Compare with ಯ (ya)" },
  { glyph: "ಯ", romanization: "ya", aliases: ["ya"], type: "consonant", audioLabel: "ಯ", parentGlyph: "ಮ", vdtDelta: "Enlarged base loop, removed top right closure", description: "Compare with ಮ (ma)" },
  { glyph: "ತ", romanization: "ta", aliases: ["ta"], type: "consonant", audioLabel: "ತ", description: "Compare with ಟ (Ta) and ಭ (bha)" },
  { glyph: "ಭ", romanization: "bha", aliases: ["bha"], type: "consonant", audioLabel: "ಭ", parentGlyph: "ತ", vdtDelta: "Added bottom downward stroke (vottu)", description: "Compare with ತ (ta)" },
  { glyph: "ಟ", romanization: "Ta", aliases: ["Ta"], type: "consonant", audioLabel: "ಟ", parentGlyph: "ತ", vdtDelta: "Full circular bottom closure", description: "Compare with ತ (ta)" },
  { glyph: "ಗ", romanization: "ga", aliases: ["ga"], type: "consonant", audioLabel: "ಗ", description: "Compare with ನ (na)" },
  { glyph: "ನ", romanization: "na", aliases: ["na"], type: "consonant", audioLabel: "ನ", parentGlyph: "ಗ", vdtDelta: "Closed top loop completely", description: "Compare with ಗ (ga)" },
  { glyph: "ದ", romanization: "da", aliases: ["da"], type: "consonant", audioLabel: "ದ", description: "Dental vs Retroflex (ಡ)" },
  { glyph: "ಡ", romanization: "Da", aliases: ["Da"], type: "consonant", audioLabel: "ಡ", description: "Retroflex vs Dental (ದ)" },
];

/* ─── L11: Unique Conjuncts (12) ─────────────── */
const conjuncts: Character[] = [
  { glyph: "್ಮ", romanization: "ma-vattu", aliases: ["ma-vattu", "mma"], type: "vattu", audioLabel: "ತ್ಮ", parentGlyph: "ಮ", vdtDelta: "Changes to purely lower-right subscript loop", description: "Unique shape for Ma" },
  { glyph: "್ಯ", romanization: "ya-vattu", aliases: ["ya-vattu", "yya"], type: "vattu", audioLabel: "ತ್ಯ", parentGlyph: "ಯ", vdtDelta: "Extends as a long sweeping right-side curve", description: "Unique shape for Ya" },
  { glyph: "್ವ", romanization: "va-vattu", aliases: ["va-vattu", "vva"], type: "vattu", audioLabel: "ತ್ವ", parentGlyph: "ವ", vdtDelta: "Shrinks into a right-side subscript hook", description: "Unique shape for Va" },
  { glyph: "್ತ", romanization: "ta-vattu", aliases: ["ta-vattu", "tta"], type: "vattu", audioLabel: "ತ್ತ", parentGlyph: "ತ", vdtDelta: "Forms a solid oval hook below base", description: "Unique shape for Ta" },
  { glyph: "್ನ", romanization: "na-vattu", aliases: ["na-vattu", "nna"], type: "vattu", audioLabel: "ನ್ನ", parentGlyph: "ನ", vdtDelta: "Forms an angled subscript hook below base", description: "Unique shape for Na" },
  { glyph: "್ಲ", romanization: "la-vattu", aliases: ["la-vattu", "lla"], type: "vattu", audioLabel: "ಲ್ಲ", parentGlyph: "ಲ", vdtDelta: "Forms an open right-facing cup below base", description: "Unique shape for La" },
  { glyph: "್ರ", romanization: "ra-vattu", aliases: ["ra-vattu", "rra"], type: "vattu", audioLabel: "ತ್ರ", parentGlyph: "ರ", vdtDelta: "Attaches as an angular hook to the right", description: "Unique shape for Ra" },
  { glyph: "್ಸ", romanization: "sa-vattu", aliases: ["sa-vattu", "ssa"], type: "vattu", audioLabel: "ಸ್ಸ", parentGlyph: "ಸ", vdtDelta: "Subscript form can blend visually with surrounding text", description: "Can blend visually with text" },
  { glyph: "್ಚ", romanization: "cha-vattu", aliases: ["cha-vattu", "ccha"], type: "vattu", audioLabel: "ಚ್ಚ", parentGlyph: "ಚ", vdtDelta: "Subscript form can blend visually with surrounding text", description: "Can blend visually with text" },
  { glyph: "್ಷ", romanization: "Sha-vattu", aliases: ["Sha-vattu", "ShSha"], type: "vattu", audioLabel: "ಕ್ಷ", parentGlyph: "ಷ", vdtDelta: "Shrinks to miniature base shape", description: "Miniature base shape, matches Retroflex Sha" },
  { glyph: "ಕ್ಷ", romanization: "ksha", aliases: ["ksha", "x"], type: "conjunct", audioLabel: "ಕ್ಷ" },
  { glyph: "ಜ್ಞ", romanization: "gnya", aliases: ["gnya", "jna"], type: "conjunct", audioLabel: "ಜ್ಞ", description: "Pronunciation varies" },
];

/* ─── L12: Numerals (10) ─────────────────────────────────── */
const numerals: Character[] = [
  { glyph: "೦", romanization: "0", aliases: ["0", "zero"], type: "numeral", audioLabel: "ಸೊನ್ನೆ" },
  { glyph: "೧", romanization: "1", aliases: ["1", "one"], type: "numeral", audioLabel: "ಒಂದು" },
  { glyph: "೨", romanization: "2", aliases: ["2", "two"], type: "numeral", audioLabel: "ಎರಡು" },
  { glyph: "೩", romanization: "3", aliases: ["3", "three"], type: "numeral", audioLabel: "ಮೂರು" },
  { glyph: "೪", romanization: "4", aliases: ["4", "four"], type: "numeral", audioLabel: "ನಾಲ್ಕು" },
  { glyph: "೫", romanization: "5", aliases: ["5", "five"], type: "numeral", audioLabel: "ಐದು" },
  { glyph: "೬", romanization: "6", aliases: ["6", "six"], type: "numeral", audioLabel: "ಆರು" },
  { glyph: "೭", romanization: "7", aliases: ["7", "seven"], type: "numeral", audioLabel: "ಏಳು" },
  { glyph: "೮", romanization: "8", aliases: ["8", "eight"], type: "numeral", audioLabel: "ಎಂಟು" },
  { glyph: "೯", romanization: "9", aliases: ["9", "nine"], type: "numeral", audioLabel: "ಒಂಬತ್ತು" },
];

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Vowels",
    kannadaName: "ಸ್ವರಗಳು",
    description: "Complete vowel set including anusvara and visarga.",
    characters: completeVowels,
  },
  {
    id: 2,
    name: "Core Consonants",
    kannadaName: "ಮೂಲ ವ್ಯಂಜನಗಳು",
    description: "Most frequent consonants used to start decoding words.",
    characters: primaryConsonants,
  },
  {
    id: 3,
    name: "Kagunita Part 1",
    kannadaName: "ಕಾಗುಣಿತ ಭಾಗ 1",
    description: "First set of vowel signs for common consonant-vowel combinations.",
    characters: vowelSignsPart1,
  },
  {
    id: 4,
    name: "Secondary & Nasals",
    kannadaName: "ದ್ವಿತೀಯ ವ್ಯಂಜನಗಳು ಮತ್ತು ನಾಸಿಕಗಳು",
    description: "Additional consonants and nasal letters.",
    characters: secondaryConsonants,
  },
  {
    id: 5,
    name: "Kagunita Part 2",
    kannadaName: "ಕಾಗುಣಿತ ಭಾಗ 2",
    description: "Remaining vowel signs to complete core kagunita patterns.",
    characters: vowelSignsPart2,
  },
  {
    id: 6,
    name: "Structural Logic",
    kannadaName: "ರಚನಾ ನಿಯಮಗಳು",
    description: "Script modifiers such as halant and their structural role.",
    characters: structuralModifiers,
  },
  {
    id: 7,
    name: "Aspirated Stops (Non-Retroflex)",
    kannadaName: "ಮಹಾಪ್ರಾಣ ಸ್ಪರ್ಶಗಳು",
    description: "Non-retroflex aspirated stop consonants and visual deltas.",
    characters: aspiratedConsonants,
  },
  {
    id: 8,
    name: "Retroflexes & Sibilants",
    kannadaName: "ಮೂರ್ಧನ್ಯ ಮತ್ತು ಊಷ್ಮ ಧ್ವನಿಗಳು",
    description: "Retroflex series and key sibilants.",
    characters: retroflexesAndSibilants,
  },
  {
    id: 9,
    name: "Visual Exceptions & Ligatures",
    kannadaName: "ದೃಶ್ಯ ವಿನಾಯಿತಿಗಳು ಮತ್ತು ಲಿಗೇಚರ್‌ಗಳು",
    description: "Exception glyphs and common visual ligature patterns.",
    characters: visualExceptions,
  },
  {
    id: 10,
    name: "Minimal Pairs",
    kannadaName: "ಕನಿಷ್ಠ ಜೋಡಿಗಳು",
    description: "Look-alike characters trained through contrast pairs.",
    characters: minimalPairs,
  },
  {
    id: 11,
    name: "Unique Conjuncts",
    kannadaName: "ವಿಶಿಷ್ಟ ಒತ್ತಕ್ಷರಗಳು",
    description: "Conjunct and vattu forms that change shape significantly.",
    characters: conjuncts,
  },
  {
    id: 12,
    name: "Numerals",
    kannadaName: "ಅಂಕೆಗಳು",
    description: "Kannada numerals from zero through nine.",
    characters: numerals,
  },
];

/** Flat list of every character across all levels */
export const ALL_CHARACTERS: Character[] = LEVELS.flatMap((l) => l.characters);

/** Quick lookup: glyph → Character */
export const CHAR_MAP = new Map<string, Character>(
  ALL_CHARACTERS.map((c) => [c.glyph, c])
);
