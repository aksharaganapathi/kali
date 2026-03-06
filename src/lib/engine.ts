import { Exercise, Character } from "@/types";
import { LEVELS, ALL_CHARACTERS } from "./curriculum";
import { DICTIONARY } from "./dictionary";

/* ─── Utilities ───────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

let exerciseCounter = 0;
function uid(): string {
  return `ex_${++exerciseCounter}_${Date.now()}`;
}

/* ─── Dynamic Word Filter ─────────────────────────────────── */

export function getDynamicWords(masteredCharacters: string[]) {
  const set = new Set(masteredCharacters);
  return DICTIONARY.filter((w) => w.requiredChars.every((c) => set.has(c)));
}

/* ─── Distractor Generation ───────────────────────────────── */

function generateDistractors(
  correct: string,
  pool: string[],
  count: number = 3
): string[] {
  const others = pool.filter((p) => p !== correct);
  return pick(others, Math.min(count, others.length));
}

/* ─── Spaced Repetition: Review Characters ────────────────── */

function getReviewCharacters(
  currentLevelId: number,
  masteredChars: string[]
): Character[] {
  const masteredSet = new Set(masteredChars);
  const reviewPool: Character[] = [];

  for (const level of LEVELS) {
    if (level.id >= currentLevelId) break;
    for (const char of level.characters) {
      if (masteredSet.has(char.glyph)) {
        reviewPool.push(char);
      }
    }
  }

  return reviewPool;
}

/* ─── Exercise Generators ─────────────────────────────────── */

function createVisualExercise(
  char: Character,
  pool: Character[]
): Exercise {
  const distractorRomanizations = generateDistractors(
    char.romanization,
    pool.map((c) => c.romanization)
  );
  const options = shuffle([char.romanization, ...distractorRomanizations]);

  return {
    id: uid(),
    phase: "visual",
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    options,
    aliases: char.aliases,
  };
}

function createAudioExercise(
  char: Character,
  pool: Character[]
): Exercise {
  const distractorGlyphs = generateDistractors(
    char.context ?? char.glyph,
    pool.map((c) => c.context ?? c.glyph)
  );
  const options = shuffle([char.context ?? char.glyph, ...distractorGlyphs]);

  return {
    id: uid(),
    phase: "audio",
    prompt: char.audioLabel,
    correctAnswer: char.context ?? char.glyph,
    options,
  };
}

function createWordMeaningExercise(
  word: { kannada: string; romanization: string; meaning: string },
  pool: { meaning: string }[]
): Exercise {
  const distractorMeanings = generateDistractors(
    word.meaning,
    pool.map((w) => w.meaning)
  );
  const options = shuffle([word.meaning, ...distractorMeanings]);

  return {
    id: uid(),
    phase: "word-meaning",
    prompt: word.kannada,
    correctAnswer: word.meaning,
    options,
    aliases: [word.romanization],
  };
}

function createScrambleExercise(
  word: { kannada: string; romanization: string; meaning: string }
): Exercise {
  const parts = splitKannadaWord(word.kannada);
  return {
    id: uid(),
    phase: "scramble",
    prompt: word.meaning,
    correctAnswer: word.kannada,
    scrambledParts: shuffle(parts),
    aliases: [word.romanization],
  };
}

function createPhoneticExercise(
  word: { kannada: string; romanization: string }
): Exercise {
  return {
    id: uid(),
    phase: "phonetic",
    prompt: word.kannada,
    correctAnswer: word.romanization,
    aliases: [word.romanization.toLowerCase()],
  };
}

/**
 * Creates a character-level typing exercise — user sees a glyph and types
 * its romanization. Works without dictionary words, ensuring variety even
 * on early levels like Vowels.
 */
function createCharPhoneticExercise(char: Character): Exercise {
  return {
    id: uid(),
    phase: "phonetic",
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    aliases: char.aliases,
  };
}

/* ─── Kannada Syllable Splitter ───────────────────────────── */

export function splitKannadaWord(word: string): string[] {
  const parts: string[] = [];
  let current = "";

  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    const isVowelSign = code >= 0x0cbe && code <= 0x0ccc;
    const isVirama = code === 0x0ccd;
    const isAnusvara = code === 0x0c82;
    const isVisarga = code === 0x0c83;
    const isModifier = isVowelSign || isVirama || isAnusvara || isVisarga;

    if (isModifier) {
      current += word[i];
    } else {
      if (current.length > 0 && current.endsWith("\u0CCD")) {
        current += word[i];
      } else {
        if (current.length > 0) parts.push(current);
        current = word[i];
      }
    }
  }
  if (current.length > 0) parts.push(current);

  return parts;
}

/* ─── Main Exercise Set Generator ─────────────────────────── */

/**
 * Generates a rich, shuffled set of exercises for a given level.
 *
 * Includes:
 *  - Visual & Audio for every character in the current level
 *  - Spaced-repetition review of earlier levels' characters
 *  - Word-meaning, syllable-scramble, and phonetic-type exercises
 *    using all decodable words (current + mastered)
 *  - All exercises interleaved randomly (no phased grouping)
 *  - No duplicate prompts within a session
 */
export function generateExerciseSet(
  levelId: number,
  masteredCharacters: string[]
): Exercise[] {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return [];

  const chars = level.characters;
  const allPool = ALL_CHARACTERS;
  const exercises: Exercise[] = [];

  // Current level chars combined with mastered for word filtering
  const currentMastered = [
    ...new Set([...masteredCharacters, ...chars.map((c) => c.glyph)]),
  ];

  // ── 1. New character exercises ──────────────────────────

  // Visual: ALL characters in the current level
  const distractorPool = chars.length >= 4 ? chars : allPool;
  for (const char of shuffle(chars)) {
    exercises.push(createVisualExercise(char, distractorPool));
  }

  // Audio: ~half of current level characters
  const audioCount = Math.max(4, Math.ceil(chars.length / 2));
  for (const char of pick(chars, Math.min(audioCount, chars.length))) {
    exercises.push(createAudioExercise(char, distractorPool));
  }

  // ── 2. Spaced repetition — review earlier levels ───────

  const reviewChars = getReviewCharacters(levelId, masteredCharacters);

  if (reviewChars.length > 0) {
    // Visual review
    const reviewVisualCount = Math.min(4, reviewChars.length);
    for (const char of pick(reviewChars, reviewVisualCount)) {
      exercises.push(createVisualExercise(char, allPool));
    }
    // Audio review
    const reviewAudioCount = Math.min(3, reviewChars.length);
    for (const char of pick(reviewChars, reviewAudioCount)) {
      exercises.push(createAudioExercise(char, allPool));
    }
  }

  // ── 3. Word exercises (scaffolded decoding) ────────────

  const availableWords = getDynamicWords(currentMastered);

  if (availableWords.length > 0) {
    const usedKannada = new Set<string>();

    // Word-meaning: see Kannada word → pick English meaning
    const meaningCandidates = availableWords.filter(
      (w) => !usedKannada.has(w.kannada)
    );
    const meaningWords = pick(
      meaningCandidates,
      Math.min(4, meaningCandidates.length)
    );
    for (const word of meaningWords) {
      exercises.push(createWordMeaningExercise(word, availableWords));
      usedKannada.add(word.kannada);
    }

    // Scramble: reorder syllables (only words with ≥ 2 syllables)
    const scrambleCandidates = availableWords.filter(
      (w) =>
        !usedKannada.has(w.kannada) &&
        splitKannadaWord(w.kannada).length >= 2
    );
    const scrambleWords = pick(
      scrambleCandidates,
      Math.min(3, scrambleCandidates.length)
    );
    for (const word of scrambleWords) {
      exercises.push(createScrambleExercise(word));
      usedKannada.add(word.kannada);
    }

    // Phonetic typing: see Kannada → type romanization
    const phoneticCandidates = availableWords.filter(
      (w) => !usedKannada.has(w.kannada)
    );
    const phoneticWords = pick(
      phoneticCandidates,
      Math.min(3, phoneticCandidates.length)
    );
    for (const word of phoneticWords) {
      exercises.push(createPhoneticExercise(word));
      usedKannada.add(word.kannada);
    }
  }

  // ── 3b. Character-level typing (always available) ──────
  //    Ensures variety even on levels with no dictionary words
  //    (e.g. Level 1: Vowels). User sees a glyph → types romanization.

  const charPhoneticCount = Math.min(
    5,
    Math.max(3, Math.ceil(chars.length / 3))
  );
  for (const char of pick(chars, charPhoneticCount)) {
    exercises.push(createCharPhoneticExercise(char));
  }

  // ── 4. Shuffle everything together for variety ─────────

  return shuffle(exercises);
}

/* ─── Answer Checker ──────────────────────────────────────── */

export function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalise = (s: string) => s.trim().toLowerCase();
  const answer = normalise(userAnswer);
  const correct = normalise(exercise.correctAnswer);

  if (answer === correct) return true;

  if (exercise.aliases?.some((a) => normalise(a) === answer)) return true;

  return false;
}
