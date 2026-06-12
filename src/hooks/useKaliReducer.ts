"use client";

import { useReducer, useEffect, useRef } from "react";
import { AppState, AppAction, ExercisePhase, LevelId } from "@/types";
import { loadState, saveState } from "@/lib/storage";
import { LEVELS } from "@/lib/curriculum";
import { generateExerciseSet, generateBrainWorkout } from "@/lib/engine";

const LEVEL_ORDER: LevelId[] = LEVELS.map((level) => level.id) as LevelId[];
const CONFUSABLE_MAP: Record<string, string[]> = {
  "ದ": ["ಧ", "ಥ"],
  "ಪ": ["ವ", "ಫ"],
  "ಬ": ["ಭ", "ಒ"],
  "ಕ": ["ಖ"],
  "ಗ": ["ಘ", "ಸ"],
  "ನ": ["ಹ", "ಳ"],
  "ಜ": ["ಝ"],
  "ಚ": ["ಛ"],
  "ತ": ["ಥ"],
  "ಟ": ["ಠ"],
  "ಡ": ["ಢ"],
  "ಶ": ["ಷ"],
  "ಮ": ["ಯ"],
  "ಸ": ["ಗ"],
  "ಒ": ["ಬ"],
  "ೆ": ["ೇ"],
  "ೊ": ["ೋ"],
  "ಿ": ["ೀ"],
  "ು": ["ೂ"],
};
const CONFUSABLE_PAIR_SEPARATOR = "~";

const FLUENCY_WINDOW_MS = 2000;
const BASE_MASTERY_GAIN = 8;
const FLUENCY_BONUS_GAIN = 6;
const INCORRECT_MASTERY_PENALTY = 6;

// XP rewards
const XP_CORRECT = 10;
const XP_FLUENCY_BONUS = 5;
const XP_LEVEL_COMPLETE = 100;
const XP_STREAK_BONUS_CAP = 10;

// SRS decay per day of inactivity
const SRS_DECAY_PER_DAY = 2;

const initialState: AppState = {
  screen: "dashboard",
  currentLevel: 1,
  exercisePhase: ExercisePhase.Visual,
  exerciseIndex: 0,
  exercises: [],
  score: { correct: 0, total: 0 },
  masteredCharacters: [],
  unlockedLevels: [1],
  glyphMastery: {},
  glyphStreaks: {},
  confusableQueue: {},
  feedbackState: "idle",
  hydrated: false,
  wordMastery: {},
  glyphResponseTimes: {},
  nextReviewDates: {},
  xp: 0,
  streak: 0,
  lastPracticeDate: "",
  claimedQuests: {},
  sessionCorrect: 0,
  sessionFluent: 0,
  dailyCorrect: 0,
  dailyFluent: 0,
  dailySessions: 0,
  isBrainWorkout: false,
  soundEnabled: true,
};

function getTodayString(): string {
  return new Date().toLocaleDateString("sv"); // "2026-05-22"
}

function getDaysDiff(dateA: string, dateB: string): number {
  if (!dateA || !dateB) return Infinity;
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.round(Math.abs(msA - msB) / 86_400_000);
}

function getSRSIntervalDays(masteryScore: number): number {
  if (masteryScore < 30) return 1;
  if (masteryScore < 60) return 3;
  if (masteryScore < 80) return 7;
  if (masteryScore < 95) return 14;
  return 30;
}

function getNextReviewDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("sv"); // ISO format YYYY-MM-DD
}

function applyMasteryDecay(
  glyphMastery: Record<string, number>,
  wordMastery: Record<string, number>,
  days: number
): { glyphMastery: Record<string, number>; wordMastery: Record<string, number> } {
  const decay = Math.min(days, 30) * SRS_DECAY_PER_DAY;
  if (decay <= 0) return { glyphMastery, wordMastery };

  const newGlyph: Record<string, number> = {};
  for (const [k, v] of Object.entries(glyphMastery)) {
    newGlyph[k] = Math.max(0, v - decay);
  }
  const newWord: Record<string, number> = {};
  for (const [k, v] of Object.entries(wordMastery)) {
    newWord[k] = Math.max(0, v - decay);
  }
  return { glyphMastery: newGlyph, wordMastery: newWord };
}

function getNextLevel(currentLevel: LevelId): LevelId | null {
  const index = LEVEL_ORDER.indexOf(currentLevel);
  if (index < 0 || index + 1 >= LEVEL_ORDER.length) return null;
  return LEVEL_ORDER[index + 1];
}

function deriveUnlockedLevels(masteredCharacters: string[]): LevelId[] {
  if (LEVELS.length === 0) return [1];

  const masteredSet = new Set(masteredCharacters);
  const unlocked: LevelId[] = [LEVELS[0].id];

  for (let i = 0; i < LEVELS.length - 1; i++) {
    const currentLevelChars = LEVELS[i].characters;
    const hasMasteredAll = currentLevelChars.every((char) =>
      masteredSet.has(char.glyph)
    );

    if (!hasMasteredAll) break;
    unlocked.push(LEVELS[i + 1].id);
  }

  return unlocked;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function tickConfusableQueue(queue: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [glyph, remaining] of Object.entries(queue)) {
    if (remaining > 1) {
      next[glyph] = remaining - 1;
    }
  }
  return next;
}

function isKannadaGlyphLike(value: string | undefined): boolean {
  if (!value) return false;
  return /[\u0C80-\u0CFF]/.test(value);
}

function toPersistedState(state: AppState) {
  return {
    masteredCharacters: state.masteredCharacters,
    unlockedLevels: state.unlockedLevels,
    currentLevel: state.currentLevel,
    glyphMastery: state.glyphMastery,
    glyphStreaks: state.glyphStreaks,
    confusableQueue: state.confusableQueue,
    wordMastery: state.wordMastery,
    glyphResponseTimes: state.glyphResponseTimes,
    nextReviewDates: state.nextReviewDates,
    xp: state.xp,
    streak: state.streak,
    lastPracticeDate: state.lastPracticeDate,
    claimedQuests: state.claimedQuests,
    soundEnabled: state.soundEnabled,
    screen: state.screen,
    exercisePhase: state.exercisePhase,
    exerciseIndex: state.exerciseIndex,
    exercises: state.exercises,
    score: state.score,
    dailyCorrect: state.dailyCorrect,
    dailyFluent: state.dailyFluent,
    dailySessions: state.dailySessions,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  const today = getTodayString();

  // Detect calendar day boundary rollover for active sessions without reloading
  if (action.type !== "HYDRATE" && state.lastPracticeDate && state.lastPracticeDate !== today) {
    state = {
      ...state,
      claimedQuests: {},
      dailyCorrect: 0,
      dailyFluent: 0,
      dailySessions: 0,
    };
  }

  switch (action.type) {
    case "HYDRATE":
      {
        const lastDate = (action.state as AppState & { lastPracticeDate?: string }).lastPracticeDate ?? "";
        const daysSince = getDaysDiff(today, lastDate);

        let glyphMastery = (action.state as AppState).glyphMastery ?? {};
        let wordMastery = (action.state as AppState).wordMastery ?? {};

        // Apply SRS decay for missed days
        if (lastDate && daysSince > 1) {
          const decayed = applyMasteryDecay(glyphMastery, wordMastery, daysSince - 1);
          glyphMastery = decayed.glyphMastery;
          wordMastery = decayed.wordMastery;
        }

        // Break streak if more than 1 day has passed
        const prevStreak = (action.state as AppState & { streak?: number }).streak ?? 0;
        const streak = daysSince > 1 ? 0 : prevStreak;

        // Reset daily quests and stats if it's a new day
        const isNewDay = today !== lastDate;
        const claimedQuests = isNewDay
          ? {}
          : ((action.state as AppState & { claimedQuests?: Record<string, boolean> }).claimedQuests ?? {});
        
        const dailyCorrect = isNewDay ? 0 : ((action.state as AppState).dailyCorrect ?? 0);
        const dailyFluent = isNewDay ? 0 : ((action.state as AppState).dailyFluent ?? 0);
        const dailySessions = isNewDay ? 0 : ((action.state as AppState).dailySessions ?? 0);

        const merged = {
          ...state,
          ...action.state,
          glyphMastery,
          wordMastery,
          streak,
          claimedQuests,
          dailyCorrect,
          dailyFluent,
          dailySessions,
          hydrated: true,
        };
        const unlockedLevels = deriveUnlockedLevels(merged.masteredCharacters);
        const currentLevel = unlockedLevels.includes(merged.currentLevel)
          ? merged.currentLevel
          : unlockedLevels[unlockedLevels.length - 1];

        return {
          ...merged,
          unlockedLevels,
          currentLevel,
        };
      }

    case "SELECT_LEVEL":
      {
        const hasResumableSession =
          action.level === state.currentLevel &&
          state.exercises.length > 0 &&
          state.exerciseIndex < state.exercises.length;

        if (hasResumableSession) {
          return {
            ...state,
            screen: "level-intro",
            currentLevel: action.level,
            feedbackState: "idle",
          };
        }

        return {
          ...state,
          screen: "level-intro",
          currentLevel: action.level,
          score: { correct: 0, total: 0 },
          exerciseIndex: 0,
          exercises: [],
          feedbackState: "idle",
          sessionCorrect: 0,
          sessionFluent: 0,
          isBrainWorkout: false,
        };
      }

    case "START_BRAIN_WORKOUT":
      return {
        ...state,
        screen: "exercise",
        exercises: action.exercises,
        exerciseIndex: 0,
        exercisePhase: action.exercises[0]?.phase ?? ExercisePhase.Visual,
        score: { correct: 0, total: 0 },
        feedbackState: "idle",
        sessionCorrect: 0,
        sessionFluent: 0,
        isBrainWorkout: true,
      };

    case "RESUME_EXERCISE":
      if (state.exercises.length === 0 || state.exerciseIndex >= state.exercises.length) {
        return state;
      }
      return {
        ...state,
        screen: "exercise",
        exercisePhase: state.exercises[state.exerciseIndex]?.phase ?? ExercisePhase.Visual,
        feedbackState: "idle",
      };

    case "START_EXERCISE": {
      const firstPhase = action.exercises[0]?.phase ?? ExercisePhase.Visual;
      return {
        ...state,
        screen: "exercise",
        exercises: action.exercises,
        exerciseIndex: 0,
        exercisePhase: firstPhase,
        score: { correct: 0, total: 0 },
        feedbackState: "idle",
        sessionCorrect: 0,
        sessionFluent: 0,
        isBrainWorkout: false,
      };
    }

    case "ANSWER": {
      const currentExercise = state.exercises[state.exerciseIndex];
      const isReview = currentExercise?.isReview;
      const targetGlyph = currentExercise?.targetGlyph;
      const isCharacterActiveRecall =
        (currentExercise?.phase === ExercisePhase.Phonetic || currentExercise?.phase === ExercisePhase.ReverseRecall) && !!targetGlyph;
      const isSpeedEligible =
        currentExercise?.timedMode &&
        (currentExercise.phase === ExercisePhase.Visual || currentExercise.phase === ExercisePhase.Phonetic) &&
        action.elapsedMs !== undefined &&
        action.elapsedMs <= FLUENCY_WINDOW_MS;

      let glyphMastery = state.glyphMastery;
      let glyphStreaks = state.glyphStreaks;
      let masteredCharacters = state.masteredCharacters;
      let confusableQueue = state.confusableQueue;
      let wordMastery = state.wordMastery;
      let glyphResponseTimes = state.glyphResponseTimes;
      let xp = state.xp;
      let streak = state.streak;
      let lastPracticeDate = state.lastPracticeDate;
      let sessionCorrect = state.sessionCorrect;
      let sessionFluent = state.sessionFluent;
      let dailyCorrect = state.dailyCorrect;
      let dailyFluent = state.dailyFluent;

      const today = getTodayString();

      // ── Streak & first-practice-of-day tracking
      if (action.correct) {
        const daysDiff = getDaysDiff(today, lastPracticeDate);
        if (!lastPracticeDate || daysDiff >= 1) {
          // New day — advance or start streak
          if (daysDiff === 1 || !lastPracticeDate) {
            streak = streak + 1;
          } else if (daysDiff > 1) {
            // Missed days already decayed in HYDRATE, but reset streak here too
            streak = 1;
          }
          lastPracticeDate = today;
        }
      }

      // ── XP rewards
      if (action.correct) {
        let xpGain = XP_CORRECT;
        if (isSpeedEligible) xpGain += XP_FLUENCY_BONUS;
        // Streak bonus: +1 per day of streak, capped at XP_STREAK_BONUS_CAP
        xpGain += Math.min(streak, XP_STREAK_BONUS_CAP);
        xp += xpGain;
        sessionCorrect += 1;
        dailyCorrect += 1;
        if (isSpeedEligible) {
          sessionFluent += 1;
          dailyFluent += 1;
        }
      }

      // ── Word mastery tracking
      const targetWord = currentExercise?.phase === ExercisePhase.Scramble
        ? currentExercise.correctAnswer
        : (currentExercise?.phase === ExercisePhase.Phonetic && currentExercise.prompt.length > 2)
          ? currentExercise.prompt
          : currentExercise?.phase === ExercisePhase.Translate
            ? (currentExercise.translateDirection === "kannada-to-english"
                ? currentExercise.prompt
                : currentExercise.correctAnswer)
            : null;

      if (targetWord && isKannadaGlyphLike(targetWord)) {
        const prevWordMastery = wordMastery[targetWord] ?? 0;
        if (action.correct) {
          wordMastery = { ...wordMastery, [targetWord]: clampScore(prevWordMastery + BASE_MASTERY_GAIN) };
        } else {
          wordMastery = { ...wordMastery, [targetWord]: clampScore(prevWordMastery - INCORRECT_MASTERY_PENALTY) };
        }
      }

      // ── Glyph response time tracking
      if (targetGlyph && action.elapsedMs !== undefined && action.elapsedMs > 0) {
        const currentTimes = glyphResponseTimes[targetGlyph] || [];
        glyphResponseTimes = {
          ...glyphResponseTimes,
          [targetGlyph]: [...currentTimes, action.elapsedMs].slice(-5),
        };
      }

      // ── Glyph mastery tracking
      if (targetGlyph) {
        const previousMastery = glyphMastery[targetGlyph] ?? 0;
        const previousStreak = glyphStreaks[targetGlyph] ?? 0;

         if (action.correct) {
          const gain = BASE_MASTERY_GAIN + (isSpeedEligible ? FLUENCY_BONUS_GAIN : 0);
          const nextMastery = clampScore(previousMastery + gain);
          glyphMastery = {
            ...glyphMastery,
            [targetGlyph]: nextMastery,
          };

          const isRecallPhase = currentExercise?.phase === ExercisePhase.Phonetic || currentExercise?.phase === ExercisePhase.ReverseRecall;
          let newStreak = previousStreak;

          if (isRecallPhase) {
            newStreak = previousStreak + 1;
            glyphStreaks = {
              ...glyphStreaks,
              [targetGlyph]: newStreak,
            };
          }

          const meetsStreak = isRecallPhase && newStreak >= 3;
          const meetsMastery = nextMastery >= 80;

          if ((meetsStreak || meetsMastery) && !masteredCharacters.includes(targetGlyph)) {
            masteredCharacters = [...masteredCharacters, targetGlyph];
          }
        } else if (isCharacterActiveRecall) {
          glyphMastery = {
            ...glyphMastery,
            [targetGlyph]: clampScore(previousMastery - INCORRECT_MASTERY_PENALTY),
          };

          glyphStreaks = {
            ...glyphStreaks,
            [targetGlyph]: 0,
          };

          const forcedConfusables = CONFUSABLE_MAP[targetGlyph] ?? [];
          const selectedAnswer = action.userAnswer?.trim();
          const dynamicConfusable =
            selectedAnswer &&
            selectedAnswer !== currentExercise?.correctAnswer &&
            isKannadaGlyphLike(selectedAnswer)
              ? selectedAnswer
              : null;

          if (forcedConfusables.length > 0 || dynamicConfusable) {
            confusableQueue = { ...confusableQueue };
            for (const glyph of forcedConfusables) {
              confusableQueue[glyph] = 5;
            }

            if (dynamicConfusable) {
              const pairKey = `${targetGlyph}${CONFUSABLE_PAIR_SEPARATOR}${dynamicConfusable}`;
              confusableQueue[targetGlyph] = 5;
              confusableQueue[dynamicConfusable] = 5;
              confusableQueue[pairKey] = 5;
            }
          }
        } else if (!action.correct) {
          const forcedConfusables = CONFUSABLE_MAP[targetGlyph] ?? [];
          const selectedAnswer = action.userAnswer?.trim();
          const dynamicConfusable =
            selectedAnswer &&
            selectedAnswer !== currentExercise?.correctAnswer &&
            isKannadaGlyphLike(selectedAnswer)
              ? selectedAnswer
              : null;

          if (forcedConfusables.length > 0 || dynamicConfusable) {
            confusableQueue = { ...confusableQueue };
            for (const glyph of forcedConfusables) {
              confusableQueue[glyph] = 5;
            }

            if (dynamicConfusable) {
              const pairKey = `${targetGlyph}${CONFUSABLE_PAIR_SEPARATOR}${dynamicConfusable}`;
              confusableQueue[targetGlyph] = 5;
              confusableQueue[dynamicConfusable] = 5;
              confusableQueue[pairKey] = 5;
            }
          }
        }
      }

      let nextReviewDates = state.nextReviewDates ?? {};
      if (targetGlyph) {
        const newScore = glyphMastery[targetGlyph] ?? 0;
        const intervalDays = action.correct ? getSRSIntervalDays(newScore) : 1;
        nextReviewDates = {
          ...nextReviewDates,
          [targetGlyph]: getNextReviewDateString(intervalDays),
        };
      }
      
      if (targetWord && isKannadaGlyphLike(targetWord)) {
        const newScore = wordMastery[targetWord] ?? 0;
        const intervalDays = action.correct ? getSRSIntervalDays(newScore) : 1;
        nextReviewDates = {
          ...nextReviewDates,
          [targetWord]: getNextReviewDateString(intervalDays),
        };
      }

      return {
        ...state,
        feedbackState: action.correct ? "correct" : "incorrect",
        glyphMastery,
        glyphStreaks,
        masteredCharacters,
        confusableQueue,
        wordMastery,
        glyphResponseTimes,
        nextReviewDates,
        xp,
        streak,
        lastPracticeDate,
        sessionCorrect,
        sessionFluent,
        dailyCorrect,
        dailyFluent,
        score: {
          correct: state.score.correct + (action.correct ? 1 : 0),
          total: state.score.total + 1,
        },
      };
    }

    case "NEXT_EXERCISE": {
      const nextIndex = state.exerciseIndex + 1;
      if (nextIndex >= state.exercises.length) {
        // Brain workout ends at level-complete screen
        if (state.isBrainWorkout) {
          return { ...state, screen: "level-complete", feedbackState: "idle" };
        }

        const level = LEVELS.find((l) => l.id === state.currentLevel);
        const levelChars = level ? level.characters.map((c) => c.glyph) : [];
        const hasMasteredAll = levelChars.every((glyph) =>
          state.masteredCharacters.includes(glyph)
        );

        if (!hasMasteredAll) {
          const nextBatch = generateExerciseSet(
            state.currentLevel,
            state.masteredCharacters,
            state.confusableQueue,
            state.glyphMastery,
            state.nextReviewDates
          );

          if (nextBatch.length > 0) {
            return {
              ...state,
              exercises: [...state.exercises, ...nextBatch],
              exerciseIndex: nextIndex,
              exercisePhase: nextBatch[0].phase,
              confusableQueue: tickConfusableQueue(state.confusableQueue),
              feedbackState: "idle",
            };
          }
        }

        return { ...state, screen: "level-complete", feedbackState: "idle" };
      }
      const nextPhase = state.exercises[nextIndex].phase;
      return {
        ...state,
        exerciseIndex: nextIndex,
        exercisePhase: nextPhase,
        confusableQueue: tickConfusableQueue(state.confusableQueue),
        feedbackState: "idle",
      };
    }

    case "COMPLETE_LEVEL": {
      const accuracy =
        state.score.total > 0
          ? state.score.correct / state.score.total
          : 0;

      const level = LEVELS.find((l) => l.id === state.currentLevel);
      const levelChars = level ? level.characters.map((c) => c.glyph) : [];
      const hasMasteredAll = levelChars.every((glyph) =>
        state.masteredCharacters.includes(glyph)
      );

      const passed = accuracy >= 0.8 && hasMasteredAll;
      const nextLevel = getNextLevel(state.currentLevel);
      const newUnlocked =
        passed && nextLevel && !state.unlockedLevels.includes(nextLevel)
          ? [...state.unlockedLevels, nextLevel]
          : state.unlockedLevels;

      // Award level-complete XP bonus
      const xpBonus = passed && !state.isBrainWorkout ? XP_LEVEL_COMPLETE : 0;

      return {
        ...state,
        screen: "dashboard",
        unlockedLevels: newUnlocked,
        feedbackState: "idle",
        xp: state.xp + xpBonus,
        isBrainWorkout: false,
        dailySessions: state.dailySessions + 1,
      };
    }

    case "CLAIM_QUEST": {
      return {
        ...state,
        xp: state.xp + action.xpReward,
        claimedQuests: { ...state.claimedQuests, [action.questId]: true },
      };
    }

    case "TOGGLE_SOUND": {
      return { ...state, soundEnabled: !state.soundEnabled };
    }

    case "RETRY_LEVEL":
      return {
        ...state,
        screen: "level-intro",
        score: { correct: 0, total: 0 },
        exerciseIndex: 0,
        exercises: [],
        feedbackState: "idle",
        sessionCorrect: 0,
        sessionFluent: 0,
      };

    case "GO_HOME":
      return {
        ...state,
        screen: "dashboard",
        feedbackState: "idle",
        isBrainWorkout: false,
      };

    case "START_COMPREHENSION":
      return {
        ...state,
        screen: "comprehension",
        feedbackState: "idle",
      };

    case "COMPLETE_COMPREHENSION":
      return {
        ...state,
        screen: "dashboard",
        feedbackState: "idle",
        xp: state.xp + action.xpReward,
      };

    case "RESET":
      return { ...initialState, hydrated: true };

    default:
      return state;
  }
}

export function useKaliReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      dispatch({
        type: "HYDRATE",
        state: {
          masteredCharacters: persisted.masteredCharacters,
          unlockedLevels: persisted.unlockedLevels,
          currentLevel: persisted.currentLevel,
          glyphMastery: persisted.glyphMastery ?? {},
          glyphStreaks: persisted.glyphStreaks ?? {},
          confusableQueue: persisted.confusableQueue ?? {},
          wordMastery: persisted.wordMastery ?? {},
          glyphResponseTimes: persisted.glyphResponseTimes ?? {},
          nextReviewDates: persisted.nextReviewDates ?? {},
          xp: persisted.xp ?? 0,
          streak: persisted.streak ?? 0,
          lastPracticeDate: persisted.lastPracticeDate ?? "",
          claimedQuests: persisted.claimedQuests ?? {},
          soundEnabled: persisted.soundEnabled ?? true,
          dailyCorrect: persisted.dailyCorrect ?? 0,
          dailyFluent: persisted.dailyFluent ?? 0,
          dailySessions: persisted.dailySessions ?? 0,
          ...(persisted.screen && { screen: persisted.screen }),
          ...(persisted.exercisePhase && { exercisePhase: persisted.exercisePhase }),
          ...(persisted.exerciseIndex !== undefined && { exerciseIndex: persisted.exerciseIndex }),
          ...(persisted.exercises && { exercises: persisted.exercises }),
          ...(persisted.score && { score: persisted.score }),
        },
      });
    } else {
      dispatch({ type: "HYDRATE", state: {} });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;

    const nextPersistedState = toPersistedState(state);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const snapshot = JSON.stringify(nextPersistedState);
      if (snapshot === lastSavedSnapshotRef.current) return;

      const saved = saveState(nextPersistedState);
      if (saved) {
        lastSavedSnapshotRef.current = snapshot;
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Sync sound enabled state to audioFX module
  useEffect(() => {
    if (!state.hydrated) return;
    import("@/lib/audioFX").then(({ setSoundEnabled }) => {
      setSoundEnabled(state.soundEnabled);
    });
  }, [state.soundEnabled, state.hydrated]);

  // Expose brain workout generator for Dashboard
  const startBrainWorkout = () => {
    const exercises = generateBrainWorkout(
      state.unlockedLevels,
      state.masteredCharacters,
      state.glyphMastery,
      state.wordMastery
    );
    if (exercises.length > 0) {
      dispatch({ type: "START_BRAIN_WORKOUT", exercises });
    }
  };

  return { state, dispatch, startBrainWorkout };
}
