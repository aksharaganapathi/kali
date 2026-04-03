import { Exercise, ExercisePhase, LevelId, Score, Screen } from "@/types";
import { z } from "zod";

const STORAGE_KEY = "kali_state";
const VERSION_KEY = "kali_version";
const STORAGE_VERSION = 2;

const LevelIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);

const ExercisePhaseSchema = z.enum([
  ExercisePhase.Learn,
  ExercisePhase.Visual,
  ExercisePhase.Audio,
  ExercisePhase.Scramble,
  ExercisePhase.Phonetic,
  ExercisePhase.MinimalPair,
  ExercisePhase.VdtCompare,
  ExercisePhase.GhostBase,
]);

const ScreenSchema = z.enum(["dashboard", "level-intro", "exercise", "level-complete"]);

const ScoreSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
}).strict();

const ExerciseSchema = z.object({
  id: z.string().min(1),
  createdAtMs: z.number().finite().nonnegative(),
  phase: ExercisePhaseSchema,
  prompt: z.string(),
  correctAnswer: z.string(),
  options: z.array(z.string()).optional(),
  scrambledParts: z.array(z.string()).optional(),
  correctParts: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  isReview: z.boolean().optional(),
  timedMode: z.boolean().optional(),
  targetGlyph: z.string().optional(),
  contrastGlyph: z.string().optional(),
  decodeSteps: z.array(z.string()).optional(),
  hintText: z.string().optional(),
  teachingNote: z.string().optional(),
  fontOverride: z.string().optional(),
}).strict();

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

const PersistedStateSchema: z.ZodType<PersistedState> = z.object({
  masteredCharacters: z.array(z.string()),
  unlockedLevels: z.array(LevelIdSchema),
  currentLevel: LevelIdSchema,
  glyphMastery: z.record(z.string(), z.number().finite()),
  glyphStreaks: z.record(z.string(), z.number().int()),
  confusableQueue: z.record(z.string(), z.number().int().nonnegative()),
  wordMastery: z.record(z.string(), z.number().finite()),
  glyphResponseTimes: z.record(
    z.string(),
    z.array(z.number().int().positive()).max(5)
  ),
  screen: ScreenSchema.optional(),
  exercisePhase: ExercisePhaseSchema.optional(),
  exerciseIndex: z.number().int().nonnegative().optional(),
  exercises: z.array(ExerciseSchema).optional(),
  score: ScoreSchema.optional(),
}).strict();

function clearPersistedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    // Clean reset if version mismatch (v1 → v2 curriculum reorder)
    const version = localStorage.getItem(VERSION_KEY);
    const parsedVersion = version ? parseInt(version, 10) : NaN;
    if (!version || Number.isNaN(parsedVersion) || parsedVersion < STORAGE_VERSION) {
      clearPersistedState();
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = PersistedStateSchema.safeParse(parsed);
    if (result.success) return result.data;

    clearPersistedState();
    return null;
  } catch {
    clearPersistedState();
    return null;
  }
}

export function saveState(state: PersistedState): boolean {
  if (typeof window === "undefined") return false;

  try {
    const validated = PersistedStateSchema.parse(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    return true;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        console.warn("[storage] Unable to save state: localStorage quota exceeded.");
      } else if (error.name === "SecurityError") {
        console.warn("[storage] Unable to save state: localStorage access blocked.");
      }
    } else if (error instanceof z.ZodError) {
      console.warn("[storage] Unable to save state: state shape is invalid.", error.flatten());
    }

    return false;
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
