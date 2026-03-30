import { Character, Exercise, ExercisePhase, LevelId, WordEntry } from "@/types";
import { LEVELS, ALL_CHARACTERS } from "./curriculum";
import { DICTIONARY } from "./dictionary";

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

const LEVEL_ORDER: LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
    if (levelIndex(currentLevelId) < levelIndex(10) && w.kannada.includes("\u0CCD")) return false;
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

/**
 * Returns review characters weighted by mastery weakness.
 * Characters with mastery < 60 appear twice (Leitner-style prioritisation).
 */
function getReviewCharacters(
  currentLevelId: LevelId,
  masteredChars: string[],
  glyphMastery: Record<string, number> = {}
): Character[] {
  const masteredSet = new Set(masteredChars);
  const reviewPool: Character[] = [];
  const currentIndex = levelIndex(currentLevelId);

  for (const level of LEVELS) {
    if (levelIndex(level.id) >= currentIndex) break;
    for (const char of level.characters) {
      if (masteredSet.has(char.glyph)) {
        reviewPool.push(char);
        // Weak characters (mastery < 60) get an extra slot
        if ((glyphMastery[char.glyph] ?? 0) < 60) {
          reviewPool.push(char);
        }
      }
    }
  }

  return reviewPool;
}

function getFontOverride(masteryScore: number): string | undefined {
  if (masteryScore > 80 && Math.random() < 0.3) {
    return Math.random() < 0.5 ? "font-tiro" : "font-baloo";
  }
  return undefined;
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
      .filter((c) => c.glyph !== char.glyph)
      .map((c) => c.romanization)
  );

  const forcedRomanizations = forcedDistractors
    .filter((d) => d.glyph !== char.glyph)
    .map((d) => d.romanization)
    .filter((r) => r !== char.romanization);

  const distractorRomanizations = [
    ...new Set([...sameBaseVowelDistractors, ...forcedRomanizations, ...coreDistractors]),
  ].slice(0, 3);
  const options = shuffle([char.romanization, ...distractorRomanizations]);

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
    fontOverride: getFontOverride(masteryScore),
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
    pool.map((c) => c.context ?? c.glyph)
  );
  const forcedGlyphs = forcedDistractors
    .filter((d) => d.glyph !== char.glyph)
    .map((d) => d.context ?? d.glyph);

  const distractorGlyphs = [...new Set([...forcedGlyphs, ...coreDistractors])].slice(0, 3);
  const options = shuffle([char.context ?? char.glyph, ...distractorGlyphs]);

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

function createWordMeaningExercise(
  word: WordEntry,
  pool: WordEntry[]
): Exercise {
  const distractorMeanings = generateDistractors(
    word.meaning,
    pool.map((w) => w.meaning)
  );
  const options = shuffle([word.meaning, ...distractorMeanings]);
  const anchorGlyph = word.keyCharacter ?? word.requiredChars[0];
  const teachingNote =
    word.scaffoldingNote ??
    (anchorGlyph
      ? `Anchor on ${anchorGlyph} while decoding this word.`
      : "Decode by mapping one glyph sound at a time.");

  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.WordMeaning,
    prompt: word.kannada,
    correctAnswer: word.meaning,
    options,
    aliases: [word.romanization],
    hintText: `Pronunciation: ${word.romanization}`,
    teachingNote,
    targetGlyph: anchorGlyph,
  };
}

function createScrambleExercise(
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
    fontOverride: getFontOverride(masteryScore),
  };
}

function createGuidedDecodeExercise(word: WordEntry): Exercise {
  const steps = splitKannadaWord(word.kannada);
  const focusGlyph = word.keyCharacter ?? word.requiredChars[0];
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: ExercisePhase.GuidedDecode,
    prompt: word.kannada,
    correctAnswer: word.romanization,
    aliases: [word.romanization.toLowerCase()],
    decodeSteps: steps,
    targetGlyph: focusGlyph,
    hintText: `Read each part in order, then combine: ${word.romanization}.`,
    teachingNote:
      word.scaffoldingNote ??
      `Start with ${steps[0] ?? word.kannada}, then blend into ${word.romanization}.`,
  };
}

export function splitKannadaWord(word: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("kn", { granularity: "grapheme" });
    return Array.from(segmenter.segment(word), (segment) => segment.segment);
  }

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

/** Maximum exercises per session — keeps sessions digestible and prevents fatigue. */
const SESSION_SIZE = 25;

export function generateExerciseSet(
  levelId: LevelId,
  masteredCharacters: string[],
  confusableQueue: Record<string, number> = {},
  glyphMastery: Record<string, number> = {}
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
  const reviewChars = getReviewCharacters(levelId, masteredCharacters, glyphMastery);
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

    if (splitKannadaWord(word.kannada).length >= 2 && Math.random() < 0.35) {
      const guidedEx = createGuidedDecodeExercise(word);
      if (isReviewWord) guidedEx.isReview = true;
      wordExercises.push(guidedEx);
    }

    if (Math.random() < 0.25) {
      const wExMeaning = createWordMeaningExercise(word, availableWords);
      if (isReviewWord) wExMeaning.isReview = true;
      wordExercises.push(wExMeaning);
    }

    if (splitKannadaWord(word.kannada).length >= 2 && Math.random() < 0.3) {
      const scrEx = createScrambleExercise(word);
      if (isReviewWord) scrEx.isReview = true;
      wordExercises.push(scrEx);
    }
  }

  // ─── 5. ASSEMBLE & CAP ────────────────────────────────────────────────────
  
  // Priority exercises that the user MUST see early in the session
  const priorityPool = shuffle([
    ...minimalPairExercises,
    ...practiceExercises,
    ...wordExercises,
  ]);

  // Secondary exercises used for padding and extra practice
  const secondaryPool = shuffle(reviewExercises);

  // Combine them, keeping priority items at the front
  const combinedPool = [...priorityPool, ...secondaryPool];

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

  // Cap to SESSION_SIZE so sessions are digestible.
  // State is persisted, so the user can start again and practice what's left.
  return ordered.slice(0, SESSION_SIZE);
}

export function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalise = (s: string) => s.trim().toLowerCase();
  const answer = normalise(userAnswer);
  const correct = normalise(exercise.correctAnswer);

  if (answer === correct) return true;

  if (exercise.aliases?.some((a) => normalise(a) === answer)) return true;

  return false;
}
