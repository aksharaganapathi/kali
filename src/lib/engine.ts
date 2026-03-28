import { Character, Exercise, LevelId, WordEntry } from "@/types";
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

const LEVEL_ORDER: LevelId[] = [1, 2, "3a", "3b", "3c", 4, 5, 6];

const TIMED_PHASES = new Set(["visual", "phonetic"]);
const CONFUSABLE_PAIR_SEPARATOR = "~";

function levelIndex(levelId: LevelId): number {
  return LEVEL_ORDER.indexOf(levelId);
}

function isUnlockedLevel(minLevel: LevelId, currentLevelId: LevelId): boolean {
  const min = levelIndex(minLevel);
  const current = levelIndex(currentLevelId);
  return min >= 0 && current >= 0 && min <= current;
}

function maybeTimedMode(phase: "visual" | "phonetic"): boolean {
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
    if (levelIndex(currentLevelId) < levelIndex(5) && w.kannada.includes("\u0CCD")) return false;
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

function getReviewCharacters(currentLevelId: LevelId, masteredChars: string[]): Character[] {
  const masteredSet = new Set(masteredChars);
  const reviewPool: Character[] = [];
  const currentIndex = levelIndex(currentLevelId);

  for (const level of LEVELS) {
    if (levelIndex(level.id) >= currentIndex) break;
    for (const char of level.characters) {
      if (masteredSet.has(char.glyph)) {
        reviewPool.push(char);
      }
    }
  }

  return reviewPool;
}

function createVisualExercise(
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
    phase: "visual",
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    options,
    aliases: char.aliases,
    timedMode: maybeTimedMode("visual"),
    targetGlyph: char.glyph,
    hintText: `Sound anchor: ${char.romanization}`,
    teachingNote: `Spot ${char.context ?? char.glyph} by its unique outer stroke before deciding.`,
  };
}

function createLearnExercise(char: Character): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: "learn",
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
    phase: "audio",
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
    phase: "minimal-pair",
    prompt: target.audioLabel,
    correctAnswer: targetPrompt,
    options: shuffle([targetPrompt, contrastPrompt]),
    targetGlyph: target.glyph,
    contrastGlyph: contrast.glyph,
    hintText: `Compare ${targetPrompt} with ${contrastPrompt} and focus on the first stroke shape.`,
    teachingNote: `${targetPrompt} sounds like ${target.romanization}; ${contrastPrompt} sounds like ${contrast.romanization}.`,
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
    phase: "word-meaning",
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
    phase: "scramble",
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
    phase: "phonetic",
    prompt: word.kannada,
    correctAnswer: word.romanization,
    aliases: [word.romanization.toLowerCase()],
    timedMode: maybeTimedMode("phonetic"),
    hintText: `Try sounding each part slowly: ${word.romanization}.`,
  };
}

function createCharPhoneticExercise(char: Character): Exercise {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: "phonetic",
    prompt: char.context ?? char.glyph,
    correctAnswer: char.romanization,
    aliases: char.aliases,
    timedMode: maybeTimedMode("phonetic"),
    targetGlyph: char.glyph,
    hintText: `Base sound: ${char.romanization}`,
    teachingNote: `Say ${char.romanization} and map it to ${char.context ?? char.glyph}.`,
  };
}

function createGuidedDecodeExercise(word: WordEntry): Exercise {
  const steps = splitKannadaWord(word.kannada);
  const focusGlyph = word.keyCharacter ?? word.requiredChars[0];
  return {
    id: uid(),
    createdAtMs: Date.now(),
    phase: "guided-decode",
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

export function generateExerciseSet(
  levelId: LevelId,
  masteredCharacters: string[],
  confusableQueue: Record<string, number> = {}
): Exercise[] {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return [];

  const chars = level.characters;
  const allPool = ALL_CHARACTERS;
  const exercises: Exercise[] = [];
  const learnExercises: Exercise[] = chars.map((char) => createLearnExercise(char));

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
  for (const char of chars) {
    for (let i = 0; i < 3; i++) {
      exercises.push(createVisualExercise(char, distractorPool, forcedDistractors));
    }
    for (let i = 0; i < 4; i++) {
      exercises.push(createCharPhoneticExercise(char));
    }
    exercises.push(createAudioExercise(char, distractorPool, forcedDistractors));
  }

  const minimalPairExercises: Exercise[] = [];
  for (const [targetGlyph, contrastGlyph] of forcedPairs) {
    const target = allPool.find((c) => c.glyph === targetGlyph);
    const contrast = allPool.find((c) => c.glyph === contrastGlyph);
    if (!target || !contrast) continue;
    minimalPairExercises.push(createMinimalPairExercise(target, contrast));
    if (minimalPairExercises.length >= 3) break;
  }
  exercises.push(...minimalPairExercises);

  const reviewChars = getReviewCharacters(levelId, masteredCharacters);

  for (const char of reviewChars) {
    for (let i = 0; i < 1; i++) {
      const visEx = createVisualExercise(char, allPool, forcedDistractors);
      visEx.isReview = true;
      exercises.push(visEx);

      const audEx = createAudioExercise(char, allPool, forcedDistractors);
      audEx.isReview = true;
      exercises.push(audEx);

      const phoEx = createCharPhoneticExercise(char);
      phoEx.isReview = true;
      exercises.push(phoEx);
    }
  }

  const availableWords = getDynamicWords(currentMastered, levelId);

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
    exercises.push(wordPhoneticA, wordPhoneticB);

    if (splitKannadaWord(word.kannada).length >= 2 && Math.random() < 0.35) {
      const guidedEx = createGuidedDecodeExercise(word);
      if (isReviewWord) guidedEx.isReview = true;
      exercises.push(guidedEx);
    }

    if (Math.random() < 0.25) {
      const wExMeaning = createWordMeaningExercise(word, availableWords);
      if (isReviewWord) wExMeaning.isReview = true;
      exercises.push(wExMeaning);
    }

    if (splitKannadaWord(word.kannada).length >= 2 && Math.random() < 0.3) {
      const scrEx = createScrambleExercise(word);
      if (isReviewWord) scrEx.isReview = true;
      exercises.push(scrEx);
    }
  }

  const guidedFirst = exercises.filter(
    (exercise) => exercise.phase === "guided-decode" || exercise.phase === "minimal-pair"
  );
  const remaining = exercises.filter(
    (exercise) => exercise.phase !== "guided-decode" && exercise.phase !== "minimal-pair"
  );

  return [...learnExercises, ...shuffle(guidedFirst), ...shuffle(remaining)];
}

export function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalise = (s: string) => s.trim().toLowerCase();
  const answer = normalise(userAnswer);
  const correct = normalise(exercise.correctAnswer);

  if (answer === correct) return true;

  if (exercise.aliases?.some((a) => normalise(a) === answer)) return true;

  return false;
}
