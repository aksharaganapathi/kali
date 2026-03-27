export type ExercisePhase =
  | "visual"
  | "audio"
  | "scramble"
  | "phonetic"
  | "word-meaning"
  | "guided-decode"
  | "minimal-pair";

export type LevelId = 1 | 2 | "3a" | "3b" | "3c" | 4 | 5 | 6;

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
  aliases?: string[];
  isReview?: boolean;
  timedMode?: boolean;
  targetGlyph?: string;
  contrastGlyph?: string;
  decodeSteps?: string[];
  hintText?: string;
  teachingNote?: string;
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
}

export type AppAction =
  | { type: "HYDRATE"; state: Partial<AppState> }
  | { type: "SELECT_LEVEL"; level: LevelId }
  | { type: "START_EXERCISE"; exercises: Exercise[] }
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
