export enum ExercisePhase {
  Learn = "learn",
  Visual = "visual",
  Audio = "audio",
  Scramble = "scramble",
  Phonetic = "phonetic",
  WordMeaning = "word-meaning",
  GuidedDecode = "guided-decode",
  MinimalPair = "minimal-pair",
  VdtCompare = "vdt-compare",
  GhostBase = "ghost-base"
}

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type WordCategory =
  | "Family"
  | "Kitchen"
  | "Actions"
  | "Nature"
  | "Food"
  | "Places"
  | "Body"
  | "Colors"
  | "Numbers"
  | "Culture"
  | "Society"
  | "Descriptors"
  | "Abstract"
  | "Time"
  | "Greetings"
  | "Objects";

export type Screen =
  | "dashboard"
  | "level-intro"
  | "exercise"
  | "level-complete";

export interface Character {
  glyph: string;
  romanization: string;
  aliases: string[];
  type: "vowel" | "consonant" | "vowel-sign" | "conjunct" | "special";
  audioLabel: string;
  context?: string;
  /** VDT: the "parent" character (e.g., ಕ for ಖ) */
  parentGlyph?: string;
  /** VDT: natural-language description of the stroke that differs */
  vdtDelta?: string;
  /** Glyphs this character is commonly confused with */
  confusablesWith?: string[];
  /** Frequency rank within its level (1 = most common) */
  frequencyRank?: number;
  /** Base consonants used for Ghost Base multi-base demo */
  ghostBases?: string[];
}

export interface Level {
  id: LevelId;
  name: string;
  kannadaName: string;
  description: string;
  characters: Character[];
}

export interface WordEntry {
  kannada: string;
  romanization: string;
  meaning: string;
  requiredChars: string[];
  minLevel: LevelId;
  category: WordCategory;
  keyCharacter?: string;
  scaffoldingNote?: string;
  frequencyTier?: "core" | "common" | "extended";
}

export interface Exercise {
  id: string;
  createdAtMs: number;
  phase: ExercisePhase;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  scrambledParts?: string[];
  /** Correct ordered parts for scramble validation */
  correctParts?: string[];
  aliases?: string[];
  isReview?: boolean;
  timedMode?: boolean;
  targetGlyph?: string;
  contrastGlyph?: string;
  decodeSteps?: string[];
  hintText?: string;
  teachingNote?: string;
  /** CSS font-family override for Font Jitter mode */
  fontOverride?: string;
}

export interface Score {
  correct: number;
  total: number;
}

export interface AppState {
  screen: Screen;
  currentLevel: LevelId;
  exercisePhase: ExercisePhase;
  exerciseIndex: number;
  exercises: Exercise[];
  score: Score;
  masteredCharacters: string[];
  unlockedLevels: LevelId[];
  glyphMastery: Record<string, number>;
  glyphStreaks: Record<string, number>;
  confusableQueue: Record<string, number>;
  feedbackState: "idle" | "correct" | "incorrect";
  hydrated: boolean;
  /** Per-word mastery scores (kannada word → 0–100) */
  wordMastery: Record<string, number>;
  /** Last N response times per glyph for fluency tracking */
  glyphResponseTimes: Record<string, number[]>;
}

export type AppAction =
  | { type: "HYDRATE"; state: Partial<AppState> }
  | { type: "SELECT_LEVEL"; level: LevelId }
  | { type: "START_EXERCISE"; exercises: Exercise[] }
  | { type: "RESUME_EXERCISE" }
  | {
    type: "ANSWER";
    correct: boolean;
    userAnswer?: string;
    elapsedMs?: number;
  }
  | { type: "NEXT_EXERCISE" }
  | { type: "COMPLETE_LEVEL" }
  | { type: "GO_HOME" }
  | { type: "RETRY_LEVEL" }
  | { type: "RESET" };
