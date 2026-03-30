import { Exercise, ExercisePhase, LevelId, Score, Screen } from "@/types";

const STORAGE_KEY = "kali_state";
const VERSION_KEY = "kali_version";
const STORAGE_VERSION = 2;

interface PersistedState {
  masteredCharacters: string[];
  unlockedLevels: LevelId[];
  currentLevel: LevelId;
  glyphMastery: Record<string, number>;
  glyphStreaks: Record<string, number>;
  confusableQueue: Record<string, number>;
  wordMastery: Record<string, number>;
  glyphResponseTimes: Record<string, number[]>;
  screen?: Screen;
  exercisePhase?: ExercisePhase;
  exerciseIndex?: number;
  exercises?: Exercise[];
  score?: Score;
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    // Clean reset if version mismatch (v1 → v2 curriculum reorder)
    const version = localStorage.getItem(VERSION_KEY);
    if (!version || parseInt(version) < STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "masteredCharacters" in parsed &&
      "unlockedLevels" in parsed
    ) {
      return parsed as PersistedState;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
  } catch {
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
