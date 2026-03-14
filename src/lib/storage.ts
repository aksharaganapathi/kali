import { Screen, ExercisePhase, Exercise, Score, LevelId, CategoryFilter } from "@/types";

const STORAGE_KEY = "kali_state";

interface PersistedState {
  masteredCharacters: string[];
  unlockedLevels: LevelId[];
  currentLevel: LevelId;
  glyphMastery: Record<string, number>;
  glyphStreaks: Record<string, number>;
  confusableQueue: Record<string, number>;
  activeCategory: CategoryFilter;
  screen?: Screen;
  exercisePhase?: ExercisePhase;
  exerciseIndex?: number;
  exercises?: Exercise[];
  score?: Score;
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
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
  } catch {
    // quota exceeded — silently ignore
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
