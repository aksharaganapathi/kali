import { Character, Exercise, ExercisePhase, LevelId, WordEntry } from "@/types";
import { LEVELS, ALL_CHARACTERS } from "./curriculum";
import { DICTIONARY } from "./dictionary";
import { CONTEXT_SENTENCES, ContextSentence } from "./sentences";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  const count = Math.max(0, Math.min(n, arr.length));
  if (count === 0) return [];
  if (count === arr.length) return shuffle(arr);

  const pickedIndices = new Set<number>();
  while (pickedIndices.size < count) {
    pickedIndices.add(Math.floor(Math.random() * arr.length));
  }

  const picked: T[] = [];
  for (const index of pickedIndices) {
    picked.push(arr[index]);
  }

  return picked;
}

let exerciseCounter = 0;
function uid(): string {
  return `ex_${++exerciseCounter}_${Date.now()}`;
}

const LEVEL_ORDER: LevelId[] = LEVELS.map((level) => level.id) as LevelId[];

const TIMED_PHASES = new Set([ExercisePhase.Visual, ExercisePhase.Phonetic]);
const CONFUSABLE_PAIR_SEPARATOR = "~";

function levelIndex(levelId: LevelId): number {
  return LEVEL_ORDER.indexOf(levelId);
}

function isUnlockedLevel(minLevel: LevelId, currentLevelId: LevelId): boolean {
  const min = levelIndex(minLevel);
  const current = levelIndex(currentLevelId);
  return min >= 0 && current >= 0 && min <= current;
}

function maybeTimedMode(phase: ExercisePhase.Visual | ExercisePhase.Phonetic): boolean {
  if (!TIMED_PHASES.has(phase)) return false;
  return Math.random() < 0.55;
}

export function getDynamicWords(
  masteredCharacters: string[],
  currentLevelId: LevelId
) {
  const set = new Set(masteredCharacters);
  return DICTIONARY.filter((w) => {
    if (!isUnlockedLevel(w.minLevel, currentLevelId)) return false;
    if (levelIndex(currentLevelId) < levelIndex(11) && w.kannada.includes("\u0CCD")) return false;
    if (levelIndex(currentLevelId) < levelIndex(6) && (w.kannada.includes("\u0C82") || w.kannada.includes("\u0C83"))) return false;

    return w.requiredChars.every((c) => set.has(c));
  });
}

function generateDistractors(
  correct: string,
  pool: string[],
  count: number = 3
): string[] {
  const others = pool.filter((p) => p !== correct);
  return pick(others, Math.min(count, others.length));
}

function padRomanizations(
  existing: string[],
  correctRomanization: string,
  targetCount: number = 3
): string[] {
  const result = [...existing];
  if (result.length >= targetCount) return result.slice(0, targetCount);

  const candidates = ALL_CHARACTERS.map((c) => c.romanization)
    .filter((r) => r !== correctRomanization && !result.includes(r));
  
  const shuffledCandidates = shuffle([...new Set(candidates)]);
  while (result.length < targetCount && shuffledCandidates.length > 0) {
    const next = shuffledCandidates.pop();
    if (next) result.push(next);
  }
  return result;
}

function padGlyphs(
  existing: string[],
  correctGlyph: string,
  correctRomanization: string,
  targetCount: number = 3
): string[] {
  const result = [...existing];
  if (result.length >= targetCount) return result.slice(0, targetCount);

  const candidates = ALL_CHARACTERS.map((c) => c.context ?? c.glyph)
    .filter((g) => {
      if (g === correctGlyph) return false;
      if (result.includes(g)) return false;
      const charObj = ALL_CHARACTERS.find((c) => (c.context ?? c.glyph) === g);
      if (charObj && charObj.romanization === correctRomanization) return false;
      return true;
    });

  const shuffledCandidates = shuffle([...new Set(candidates)]);
  while (result.length < targetCount && shuffledCandidates.length > 0) {
    const next = shuffledCandidates.pop();
    if (next) result.push(next);
  }
  return result;
}

function padTranslateDistractors(
  existing: WordEntry[],
  correctWord: WordEntry,
  targetCount: number = 3
): WordEntry[] {
  const result = [...existing];
  if (result.length >= targetCount) return result.slice(0, targetCount);

  const candidates = DICTIONARY.filter((w) => {
    if (w.kannada === correctWord.kannada) return false;
    if (w.meaning === correctWord.meaning) return false;
    if (result.some((r) => r.kannada === w.kannada || r.meaning === w.meaning)) return false;
    return true;
  });

  const shuffledCandidates = shuffle(candidates);
  while (result.length < targetCount && shuffledCandidates.length > 0) {
    const next = shuffledCandidates.pop();
    if (next) result.push(next);
  }
  return result;
}

/**
 * Returns review characters weighted by mastery weakness.
 * Characters with mastery < 60 appear twice (Leitner-style prioritisation).
 */
function getReviewCharacters(
  currentLevelId: LevelId,
  masteredChars: string[],
  glyphMastery: Record<string, number> = {},
  nextReviewDates: Record<string, string> = {}
): Character[] {
  const masteredSet = new Set(masteredChars);
  const reviewPool: Character[] = [];
  const currentIndex = levelIndex(currentLevelId);
  const today = new Date().toLocaleDateString("sv");

  for (const level of LEVELS) {
    if (levelIndex(level.id) >= currentIndex) break;
    for (const char of level.characters) {
      if (masteredSet.has(char.glyph)) {
        // Only include if due for review under SRS scheduler
        const reviewDate = nextReviewDates[char.glyph];
        const isDue = !reviewDate || reviewDate <= today;
        
        if (isDue) {
          reviewPool.push(char);
          // Weak characters (mastery < 60) get an extra slot
          if ((glyphMastery[char.glyph] ?? 0) < 60) {
            reviewPool.push(char);
          }
        }
      }
    }
  }

  return reviewPool;
}

function createVisualExercise(
  char: Character,
  pool: Character[],
  forcedDistractors: Character[] = [],
  masteryScore: number = 0
): Exercise {
  const sameBaseVowelDistractors =
    char.type === "vowel-sign" && char.context
      ? ALL_CHARACTERS.filter(
        (candidate) =>
          candidate.type === "vowel-sign" &&
          candidate.context?.[0] === char.context?.[0] &&
          candidate.romanization !== char.romanization
      ).map((candidate) => candidate.romanization)
      : [];

  const coreDistractors = generateDistractors(
    char.romanization,
    pool
      .filter((c) => c.glyph !== char.glyph && c.romanization !== char.romanization)
      .map((c) => c.romanization)
  );

  const forcedRomanizations = forcedDistractors
    .filter((d) => d.glyph !== char.glyph && d.romanization !== char.romanization)
    .map((d) => d.romanization);

  const distractorRomanizations = [
    ...new Set([...sameBaseVowelDistractors, ...forcedRomanizations, ...coreDistractors]),
  ].filter((r) => r !== char.romanization);

  const paddedDistractors = padRomanizations(distractorRomanizations, char.romanization, 3);
  const options = shuffle([char.romanization, ...paddedDistractors]);

  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Visual,
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    options,
    aliases: char.aliases,
    timedMode: maybeTimedMode(ExercisePhase.Visual),
    targetGlyph: char.glyph,
    hintText: `Sound anchor: ${char.romanization}`,
    teachingNote: `Spot ${char.context ?? char.glyph} by its unique outer stroke before deciding.`,
  };
}

function createLearnExercise(char: Character): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Learn,
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    aliases: char.aliases,
    targetGlyph: char.glyph,
    hintText: `Listen and repeat: ${char.romanization}`,
    teachingNote: `This is ${char.context ?? char.glyph}, pronounced ${char.romanization}.`,
  };
}

function createAudioExercise(
  char: Character,
  pool: Character[],
  forcedDistractors: Character[] = []
): Exercise {
  const coreDistractors = generateDistractors(
    char.context ?? char.glyph,
    pool
      .filter((c) => c.glyph !== char.glyph && c.romanization !== char.romanization)
      .map((c) => c.context ?? c.glyph)
  );
  const forcedGlyphs = forcedDistractors
    .filter((d) => d.glyph !== char.glyph && d.romanization !== char.romanization)
    .map((d) => d.context ?? d.glyph);

  const distractorGlyphs = [...new Set([...forcedGlyphs, ...coreDistractors])].filter(
    (g) => g !== (char.context ?? char.glyph)
  );
  
  const paddedDistractors = padGlyphs(distractorGlyphs, char.context ?? char.glyph, char.romanization, 3);
  const options = shuffle([char.context ?? char.glyph, ...paddedDistractors]);

  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Audio,
    prompt: char.audioLabel,
    correctAnswer: char.context ?? char.glyph,
    options,
    targetGlyph: char.glyph,
    hintText: `Listen again and match the sound for ${char.romanization}.`,
  };
}

function createMinimalPairExercise(target: Character, contrast: Character): Exercise {
  const targetPrompt = target.context ?? target.glyph;
  const contrastPrompt = contrast.context ?? contrast.glyph;
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.MinimalPair,
    prompt: target.audioLabel,
    correctAnswer: targetPrompt,
    options: shuffle([targetPrompt, contrastPrompt]),
    targetGlyph: target.glyph,
    contrastGlyph: contrast.glyph,
    hintText: `Compare ${targetPrompt} with ${contrastPrompt} and focus on the first stroke shape.`,
    teachingNote: `${targetPrompt} sounds like ${target.romanization}; ${contrastPrompt} sounds like ${contrast.romanization}.`,
  };
}

function createVDTCompareExercise(child: Character): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.VdtCompare,
    prompt: child.context ?? child.glyph,
    correctAnswer: child.romanization,
    aliases: child.aliases,
    targetGlyph: child.glyph,
    contrastGlyph: child.parentGlyph,
    hintText: `Compare ${child.parentGlyph ?? ""} and ${child.glyph}`,
    teachingNote: child.vdtDelta ?? "Spot the visual difference.",
  };
}

function createGhostBaseExercise(char: Character): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.GhostBase,
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    aliases: char.aliases,
    targetGlyph: char.glyph,
    hintText: `This sign changes the base consonant sound to include ${char.romanization}.`,
    teachingNote: `The ${char.romanization} sign attaches to any consonant.`,
  };
}

function createReverseRecallExercise(
  char: Character,
  pool: Character[],
  forcedDistractors: Character[] = []
): Exercise {
  const sameBaseVowelDistractors =
    char.type === "vowel-sign" && char.context
      ? ALL_CHARACTERS.filter(
        (candidate) =>
          candidate.type === "vowel-sign" &&
          candidate.context?.[0] === char.context?.[0] &&
          candidate.romanization !== char.romanization
      ).map((candidate) => candidate.context ?? candidate.glyph)
      : [];

  const coreDistractors = generateDistractors(
    char.context ?? char.glyph,
    pool
      .filter((c) => c.glyph !== char.glyph && c.romanization !== char.romanization)
      .map((c) => c.context ?? c.glyph)
  );

  const forcedGlyphs = forcedDistractors
    .filter((d) => d.glyph !== char.glyph && d.romanization !== char.romanization)
    .map((d) => d.context ?? d.glyph);

  const distractorGlyphs = [...new Set([...sameBaseVowelDistractors, ...forcedGlyphs, ...coreDistractors])].filter(
    (g) => g !== (char.context ?? char.glyph)
  );

  const paddedDistractors = padGlyphs(distractorGlyphs, char.context ?? char.glyph, char.romanization, 3);
  const options = shuffle([char.context ?? char.glyph, ...paddedDistractors]);

  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.ReverseRecall,
    prompt: char.romanization,
    correctAnswer: char.context ?? char.glyph,
    options,
    targetGlyph: char.glyph,
    hintText: `Look for the glyph that makes the "${char.romanization}" sound.`,
    teachingNote: `The correct shape for "${char.romanization}" is ${char.context ?? char.glyph}.`,
  };
}

function createContextFillExercise(
  sentence: ContextSentence,
  availableWords: WordEntry[]
): Exercise {
  const correctWord = sentence.blankWord;
  const filteredWords = availableWords.filter((w) => w.kannada !== correctWord);
  
  const distractors = pick(filteredWords, 3).map((w) => w.kannada);
  const finalDistractors = [...new Set(distractors)];
  while (finalDistractors.length < 3) {
    const backup = pick(DICTIONARY.filter(w => w.kannada !== correctWord && !finalDistractors.includes(w.kannada)), 1)[0];
    if (backup) finalDistractors.push(backup.kannada);
    else break;
  }
  
  const options = shuffle([correctWord, ...finalDistractors]);
  const promptWithBlank = sentence.kannada.replace(correctWord, "____");

  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.ContextFill,
    prompt: promptWithBlank,
    correctAnswer: correctWord,
    options,
    hintText: sentence.english,
    teachingNote: sentence.romanization,
  };
}function createScrambleExercise(
  word: { kannada: string; romanization: string; meaning: string }
): Exercise {
  const parts = splitKannadaWord(word.kannada);
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Scramble,
    prompt: word.meaning,
    correctAnswer: word.kannada,
    scrambledParts: shuffle(parts),
    aliases: [word.romanization],
    hintText: `Sound it out as ${word.romanization}.`,
    teachingNote: "Place the starting syllable first, then attach the vowel-marked syllable.",
  };
}

function createPhoneticExercise(
  word: { kannada: string; romanization: string }
): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Phonetic,
    prompt: word.kannada,
    correctAnswer: word.romanization,
    aliases: [word.romanization.toLowerCase()],
    timedMode: maybeTimedMode(ExercisePhase.Phonetic),
    hintText: `Try sounding each part slowly: ${word.romanization}.`,
  };
}

function createCharPhoneticExercise(char: Character, masteryScore: number = 0): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.Phonetic,
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    aliases: char.aliases,
    timedMode: maybeTimedMode(ExercisePhase.Phonetic),
    targetGlyph: char.glyph,
    hintText: `Base sound: ${char.romanization}`,
    teachingNote: `Say ${char.romanization} and map it to ${char.context ?? char.glyph}.`,
  };
}

/**
 * Creates a bidirectional vocabulary translation exercise.
 * direction "kannada-to-english": show Kannada word, pick English meaning
 * direction "english-to-kannada": show English meaning, pick Kannada word
 */
function createTranslateExercise(
  word: WordEntry,
  distractorWords: WordEntry[],
  direction: "kannada-to-english" | "english-to-kannada" = "kannada-to-english",
  isReview: boolean = false
): Exercise {
  const distractors = distractorWords.filter(
    (d) => d.kannada !== word.kannada && d.meaning !== word.meaning
  );

  const paddedDistractors = padTranslateDistractors(distractors, word, 3);

  if (direction === "kannada-to-english") {
    const options = shuffle([
      word.meaning,
      ...paddedDistractors.map((d) => d.meaning),
    ]);
    return {
      id: uid(),
      createdAtMs: Date.now(),
      phase: ExercisePhase.Translate,
      prompt: word.kannada,
      correctAnswer: word.meaning,
      options,
      aliases: [word.romanization],
      translateDirection: "kannada-to-english",
      isReview,
      hintText: `Sounds like: ${word.romanization}`,
    };
  } else {
    // english-to-kannada: prompt is the English meaning, pick correct Kannada script
    const options = shuffle([
      word.kannada,
      ...paddedDistractors.map((d) => d.kannada),
    ]);
    return {
      id: uid(),
      createdAtMs: Date.now(),
      phase: ExercisePhase.Translate,
      prompt: word.meaning,
      correctAnswer: word.kannada,
      options,
      aliases: [word.romanization],
      translateDirection: "english-to-kannada",
      isReview,
      hintText: `Romanization: ${word.romanization}`,
    };
  }
}



const KANNADA_SEGMENTER =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("kn", { granularity: "grapheme" })
    : null;
const WORD_SEGMENT_CACHE = new Map<string, string[]>();

export function splitKannadaWord(word: string): string[] {
  const cached = WORD_SEGMENT_CACHE.get(word);
  if (cached) return cached;

  const parts = KANNADA_SEGMENTER
    ? Array.from(KANNADA_SEGMENTER.segment(word), (segment) => segment.segment)
    : Array.from(word);

  WORD_SEGMENT_CACHE.set(word, parts);
  return parts;
}

/** Maximum exercises per session — keeps sessions digestible and prevents fatigue. */
const SESSION_SIZE = 25;

export function generateExerciseSet(
  levelId: LevelId,
  masteredCharacters: string[],
  confusableQueue: Record<string, number> = {},
  glyphMastery: Record<string, number> = {},
  nextReviewDates: Record<string, string> = {}
): Exercise[] {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return [];

  const chars = level.characters;
  const allPool = ALL_CHARACTERS;

  const currentMastered = [
    ...new Set([...masteredCharacters, ...chars.map((c) => c.glyph)]),
  ];

  const oldMasteredSet = new Set(masteredCharacters);

  const activeQueueKeys = Object.keys(confusableQueue).filter(
    (key) => (confusableQueue[key] ?? 0) > 0
  );
  const forcedConfusableGlyphs = activeQueueKeys.filter(
    (key) => !key.includes(CONFUSABLE_PAIR_SEPARATOR)
  );
  const forcedPairs = activeQueueKeys
    .filter((key) => key.includes(CONFUSABLE_PAIR_SEPARATOR))
    .map((key) => key.split(CONFUSABLE_PAIR_SEPARATOR))
    .filter((pair): pair is [string, string] => pair.length === 2);
  const forcedDistractors = allPool.filter((char) => forcedConfusableGlyphs.includes(char.glyph));

  const distractorPool = chars.length >= 4 ? chars : allPool;

  // ─── 1. STRICT PER-CHARACTER SEQUENCE (new chars only) ────────────────────
  // Flow varies by character type:
  //   VDT (parentGlyph):   vdt-compare → minimal-pair → visual ×2 → phonetic ×2
  //   Ghost Base (vowel-sign): ghost-base → visual ×2 → audio ×1 → phonetic ×2
  //   Standard:            learn → visual ×2 → audio ×1 → phonetic ×2
  const masteredSet = new Set(masteredCharacters);
  const introExercises: Exercise[] = [];
  const practiceExercises: Exercise[] = [];
  const shuffledChars = shuffle(chars);
  for (const char of shuffledChars) {
    const isMastered = masteredSet.has(char.glyph);
    const score = glyphMastery[char.glyph] ?? 0;
    const parent = char.parentGlyph ? allPool.find((c) => c.glyph === char.parentGlyph) : undefined;
    const distractorList = parent ? [parent, ...forcedDistractors] : forcedDistractors;

    // Topological Gating: Cannot introduce a child if parent is unmastered
    if (!isMastered && char.parentGlyph && !masteredSet.has(char.parentGlyph)) {
      continue;
    }

    // Phase A: Structural Intro (Only for new or struggling characters)
    const needsIntro = score < 15;
    if (needsIntro) {
      if (char.parentGlyph) {
        introExercises.push(createVDTCompareExercise(char));
        if (parent) introExercises.push(createMinimalPairExercise(char, parent));
      } else if (char.type === "vowel-sign") {
        introExercises.push(createGhostBaseExercise(char));
      } else {
        introExercises.push(createLearnExercise(char));
      }

      // Phase B: Compound context (if it was a VDT that is ALSO a vowel-sign)
      if (char.parentGlyph && char.type === "vowel-sign") {
        introExercises.push(createGhostBaseExercise(char));
      }
    }

    // Phase C & D: Core Recognition and Decoding Flashcards
    // Unmastered characters receive double the density
    practiceExercises.push(createVisualExercise(char, distractorPool, distractorList, score));
    if (!isMastered) {
      practiceExercises.push(createVisualExercise(char, distractorPool, distractorList, score));
    }

    if (!char.parentGlyph || char.type === "vowel-sign") {
      practiceExercises.push(createAudioExercise(char, distractorPool, distractorList));
    }

    practiceExercises.push(createCharPhoneticExercise(char, score));
    if (!isMastered) {
      practiceExercises.push(createCharPhoneticExercise(char, score));
    }

    // Add ReverseRecall for active recall if the user has a base level of familiarity
    if (score >= 30 || isMastered) {
      practiceExercises.push(createReverseRecallExercise(char, distractorPool, distractorList));
    }

    // Proactive confusable pairs: if this new char has confusables already mastered
    const confusables = char.confusablesWith ?? [];
    for (const confGlyph of confusables) {
      if (masteredSet.has(confGlyph)) {
        const contrast = allPool.find((c) => c.glyph === confGlyph);
        if (contrast) {
          introExercises.push(createMinimalPairExercise(char, contrast));
          break; // one proactive pair per char is enough
        }
      }
    }
  }

  // ─── 2. MINIMAL PAIRS (from confusable queue) ─────────────────────────────
  const minimalPairExercises: Exercise[] = [];
  for (const [targetGlyph, contrastGlyph] of forcedPairs) {
    const target = allPool.find((c) => c.glyph === targetGlyph);
    const contrast = allPool.find((c) => c.glyph === contrastGlyph);
    if (!target || !contrast) continue;
    minimalPairExercises.push(createMinimalPairExercise(target, contrast));
    if (minimalPairExercises.length >= 3) break;
  }

  // ─── 3. WEIGHTED REVIEW (previous levels, mastery-prioritised) ────────────
  const reviewChars = getReviewCharacters(levelId, masteredCharacters, glyphMastery, nextReviewDates);
  const reviewExercises: Exercise[] = [];
  for (const char of shuffle(reviewChars)) {
    const score = glyphMastery[char.glyph] ?? 0;
    const visEx = createVisualExercise(char, allPool, forcedDistractors, score);
    visEx.isReview = true;
    const audEx = createAudioExercise(char, allPool, forcedDistractors);
    audEx.isReview = true;
    const phoEx = createCharPhoneticExercise(char, score);
    phoEx.isReview = true;
    reviewExercises.push(visEx, audEx, phoEx);
  }

  // ─── 4. WORD EXERCISES ────────────────────────────────────────────────────
  const availableWords = getDynamicWords(currentMastered, levelId);
  const wordExercises: Exercise[] = [];

  for (const word of availableWords) {
    const isReviewWord =
      word.requiredChars.every((c) => oldMasteredSet.has(c)) &&
      !word.requiredChars.some((c) => chars.some((nc) => nc.glyph === c));

    const wordPhoneticA = createPhoneticExercise(word);
    const wordPhoneticB = createPhoneticExercise(word);
    if (isReviewWord) {
      wordPhoneticA.isReview = true;
      wordPhoneticB.isReview = true;
    }
    wordExercises.push(wordPhoneticA, wordPhoneticB);

    if (splitKannadaWord(word.kannada).length >= 2 && Math.random() < 0.4) {
      const scrEx = createScrambleExercise(word);
      if (isReviewWord) scrEx.isReview = true;
      wordExercises.push(scrEx);
    }

    // Translate exercises: alternate directions for variety
    const dir = Math.random() < 0.5 ? "kannada-to-english" : "english-to-kannada";
    const translateEx = createTranslateExercise(word, availableWords, dir, isReviewWord);
    wordExercises.push(translateEx);
  }

  // ─── 4b. CONTEXT SENTENCE EXERCISES ────────────────────────────────────────
  const availableSentences = CONTEXT_SENTENCES.filter((s) => s.minLevel === levelId);
  const sentenceExercises: Exercise[] = [];
  for (const sentence of availableSentences) {
    sentenceExercises.push(createContextFillExercise(sentence, availableWords));
  }

  // ─── 5. ASSEMBLE & CAP ────────────────────────────────────────────────────
  
  const priorityPool = shuffle([
    ...minimalPairExercises,
    ...practiceExercises,
    ...wordExercises,
    ...sentenceExercises,
  ]);

  const secondaryPool = shuffle(reviewExercises);

  // Guarantee ~25% of the post-intro session goes to review items
  const maxSessionSize = SESSION_SIZE;
  const introCount = introExercises.length;
  const remainingSize = Math.max(0, maxSessionSize - introCount);
  
  const targetReviewCount = Math.min(Math.floor(remainingSize * 0.25), secondaryPool.length);
  const selectedReviews = secondaryPool.slice(0, targetReviewCount);
  
  const remainingForPriority = remainingSize - selectedReviews.length;
  const selectedPriority = priorityPool.slice(0, remainingForPriority);
  
  // If priorityPool didn't fill its quota, take from secondaryPool
  if (selectedPriority.length < remainingForPriority) {
     const extraSpace = remainingForPriority - selectedPriority.length;
     const extraReviews = secondaryPool.slice(selectedReviews.length, selectedReviews.length + extraSpace);
     selectedReviews.push(...extraReviews);
  }

  const combinedPool = shuffle([...selectedPriority, ...selectedReviews]);

  // Spacing algorithm: gently space out exercises for the same targetGlyph
  const spacedPool: Exercise[] = [];
  while (combinedPool.length > 0) {
    let indexToPick = 0;
    if (spacedPool.length > 0) {
      // Look back up to 2 items to prevent tight clumping
      const recentTargets = spacedPool.slice(-2).map((ex) => ex.targetGlyph ?? ex.prompt);
      
      for (let i = 0; i < combinedPool.length; i++) {
        const candidateTarget = combinedPool[i].targetGlyph ?? combinedPool[i].prompt;
        if (!recentTargets.includes(candidateTarget)) {
          indexToPick = i;
          break;
        }
      }
    }
    spacedPool.push(combinedPool.splice(indexToPick, 1)[0]);
  }

  // Order: strict intros (new chars) → spaced practice/review
  const ordered = [
    ...introExercises,
    ...spacedPool,
  ];

  return ordered;
}

export function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalise = (s: string) => s.trim().toLowerCase();
  const answer = normalise(userAnswer);
  const correct = normalise(exercise.correctAnswer);

  if (answer === correct) return true;

  if (exercise.aliases?.some((a) => normalise(a) === answer)) return true;

  return false;
}

/**
 * Generates a SRS "Daily Brain Workout" — an active recall session
 * drawing from the user's weakest characters and vocabulary across all unlocked levels.
 * Targets characters with mastery < 80 and words with mastery < 70.
 * Session is always 15 exercises mixing phonetic recall and bidirectional translation.
 */
export function generateBrainWorkout(
  unlockedLevels: LevelId[],
  masteredCharacters: string[],
  glyphMastery: Record<string, number>,
  wordMastery: Record<string, number>
): Exercise[] {
  const WORKOUT_SIZE = 15;
  const allPool = ALL_CHARACTERS;

  // ── 1. Weak characters: mastered but mastery score < 80
  const weakChars: Character[] = [];
  for (const levelId of unlockedLevels) {
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level) continue;
    for (const char of level.characters) {
      if (masteredCharacters.includes(char.glyph)) {
        const score = glyphMastery[char.glyph] ?? 0;
        if (score < 80) weakChars.push(char);
      }
    }
  }

  // Sort weakest first
  weakChars.sort((a, b) => (glyphMastery[a.glyph] ?? 0) - (glyphMastery[b.glyph] ?? 0));

  // ── 2. Weak words from unlocked levels
  const maxLevel = unlockedLevels[unlockedLevels.length - 1] ?? 1;
  const availableWords = getDynamicWords(masteredCharacters, maxLevel);
  const weakWords = availableWords
    .filter((w) => (wordMastery[w.kannada] ?? 0) < 70)
    .sort((a, b) => (wordMastery[a.kannada] ?? 0) - (wordMastery[b.kannada] ?? 0));

  const exercises: Exercise[] = [];

  // ── 3. Build char phonetic recall exercises (active recall: no multiple choice)
  const charSlots = Math.min(Math.ceil(WORKOUT_SIZE * 0.5), weakChars.length);
  for (const char of weakChars.slice(0, charSlots)) {
    const ex = createCharPhoneticExercise(char, glyphMastery[char.glyph] ?? 0);
    ex.isReview = true;
    exercises.push(ex);
  }

  // ── 4. Build vocabulary translate exercises (bidirectional)
  const wordSlots = Math.min(WORKOUT_SIZE - exercises.length, weakWords.length * 2);
  let added = 0;
  for (const word of weakWords) {
    if (added >= wordSlots) break;
    // Alternate direction each iteration
    const dir = added % 2 === 0 ? "kannada-to-english" : "english-to-kannada";
    const ex = createTranslateExercise(word, availableWords, dir, true);
    exercises.push(ex);
    added++;
  }

  // ── 5. If we still have room, fill with visual and reverse recall of weak chars
  if (exercises.length < WORKOUT_SIZE) {
    const remaining = WORKOUT_SIZE - exercises.length;
    const visualPool = weakChars.slice(0, remaining);
    for (let i = 0; i < visualPool.length; i++) {
      const char = visualPool[i];
      const ex = i % 2 === 0
        ? createVisualExercise(char, allPool, [], glyphMastery[char.glyph] ?? 0)
        : createReverseRecallExercise(char, allPool, []);
      ex.isReview = true;
      exercises.push(ex);
    }
  }

  return shuffle(exercises).slice(0, WORKOUT_SIZE);
}
