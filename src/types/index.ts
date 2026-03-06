export type ExercisePhase = "visual" | "audio" | "scramble" | "phonetic" | "word-meaning";

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
  /** For vowel signs: display in context with a base consonant (e.g. "ಕಾ") */
  context?: string;
}

export interface Level {
  id: number;
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
  minLevel: number;
}

export interface Exercise {
  id: string;
  phase: ExercisePhase;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  scrambledParts?: string[];
  aliases?: string[];
}

export interface Score {
  correct: number;
  total: number;
}

export interface AppState {
  screen: Screen;
  currentLevel: number;
  exercisePhase: ExercisePhase;
  exerciseIndex: number;
  exercises: Exercise[];
  score: Score;
  masteredCharacters: string[];
  unlockedLevels: number[];
  feedbackState: "idle" | "correct" | "incorrect";
  hydrated: boolean;
}

export type AppAction =
  | { type: "HYDRATE"; state: Partial<AppState> }
  | { type: "SELECT_LEVEL"; level: number }
  | { type: "START_EXERCISE"; exercises: Exercise[] }
  | { type: "ANSWER"; correct: boolean }
  | { type: "NEXT_EXERCISE" }
  | { type: "COMPLETE_LEVEL"; newMastered: string[] }
  | { type: "GO_HOME" }
  | { type: "RETRY_LEVEL" }
  | { type: "RESET" }
  | { type: "RESET" };
