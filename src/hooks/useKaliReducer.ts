"use client";

import { useReducer, useEffect } from "react";
import { AppState, AppAction, ExercisePhase, LevelId } from "@/types";
import { loadState, saveState } from "@/lib/storage";
import { LEVELS } from "@/lib/curriculum";
import { generateExerciseSet } from "@/lib/engine";

const LEVEL_ORDER: LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CONFUSABLE_MAP: Record<string, string[]> = {
  // Consonant shape-pairs
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
  // Vowel sign short/long pairs
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
};

function getNextLevel(currentLevel: LevelId): LevelId | null {
  const index = LEVEL_ORDER.indexOf(currentLevel);
  if (index < 0 || index + 1 >= LEVEL_ORDER.length) return null;
  return LEVEL_ORDER[index + 1];
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

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.state, hydrated: true };

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
        };
      }

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
      };
    }

    case "ANSWER": {
      const currentExercise = state.exercises[state.exerciseIndex];
      const isReview = currentExercise?.isReview;
      const targetGlyph = currentExercise?.targetGlyph;
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

      const targetWord = currentExercise?.phase === ExercisePhase.Scramble
        ? currentExercise.correctAnswer
        : (currentExercise?.phase === ExercisePhase.Phonetic && currentExercise.prompt.length > 2)
          ? currentExercise.prompt
          : null;

      if (targetWord && isKannadaGlyphLike(targetWord)) {
        const prevWordMastery = wordMastery[targetWord] ?? 0;
        if (action.correct) {
          wordMastery = { ...wordMastery, [targetWord]: clampScore(prevWordMastery + BASE_MASTERY_GAIN) };
        } else {
          wordMastery = { ...wordMastery, [targetWord]: clampScore(prevWordMastery - INCORRECT_MASTERY_PENALTY) };
        }
      }

      if (targetGlyph && action.elapsedMs !== undefined && action.elapsedMs > 0) {
        const currentTimes = glyphResponseTimes[targetGlyph] || [];
        glyphResponseTimes = {
          ...glyphResponseTimes,
          [targetGlyph]: [...currentTimes, action.elapsedMs].slice(-5),
        };
      }

      if (targetGlyph) {
        const previousMastery = glyphMastery[targetGlyph] ?? 0;
        const previousStreak = glyphStreaks[targetGlyph] ?? 0;

        if (action.correct) {
          const gain = BASE_MASTERY_GAIN + (isSpeedEligible ? FLUENCY_BONUS_GAIN : 0);
          glyphMastery = {
            ...glyphMastery,
            [targetGlyph]: clampScore(previousMastery + gain),
          };

          if (currentExercise?.phase === ExercisePhase.Phonetic) {
            const nextStreak = previousStreak + 1;
            glyphStreaks = {
              ...glyphStreaks,
              [targetGlyph]: nextStreak,
            };

            if (nextStreak >= 3 && !masteredCharacters.includes(targetGlyph)) {
              masteredCharacters = [...masteredCharacters, targetGlyph];
            }
          }
        } else {
          glyphMastery = {
            ...glyphMastery,
            [targetGlyph]: clampScore(previousMastery - INCORRECT_MASTERY_PENALTY),
          };

          if (currentExercise?.phase === ExercisePhase.Phonetic) {
            glyphStreaks = {
              ...glyphStreaks,
              [targetGlyph]: 0,
            };
          }

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

      return {
        ...state,
        feedbackState: action.correct ? "correct" : "incorrect",
        glyphMastery,
        glyphStreaks,
        masteredCharacters,
        confusableQueue,
        wordMastery,
        glyphResponseTimes,
        score: isReview
          ? state.score
          : {
            correct: state.score.correct + (action.correct ? 1 : 0),
            total: state.score.total + 1,
          },
      };
    }

    case "NEXT_EXERCISE": {
      const nextIndex = state.exerciseIndex + 1;
      if (nextIndex >= state.exercises.length) {
        const level = LEVELS.find((l) => l.id === state.currentLevel);
        const levelChars = level ? level.characters.map((c) => c.glyph) : [];
        const hasMasteredAll = levelChars.every((glyph) =>
          state.masteredCharacters.includes(glyph)
        );

        if (!hasMasteredAll) {
          // The user expects to seamlessly learn all characters in the level.
          // Because of topological gating, children characters don't generate until parents are mastered.
          // Let's generate the next semantic batch so the level naturally sweeps to completion!
          const nextBatch = generateExerciseSet(
            state.currentLevel,
            state.masteredCharacters,
            state.confusableQueue,
            state.glyphMastery
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

      return {
        ...state,
        screen: "dashboard",
        unlockedLevels: newUnlocked,
        feedbackState: "idle",
      };
    }

    case "RETRY_LEVEL":
      return {
        ...state,
        screen: "level-intro",
        score: { correct: 0, total: 0 },
        exerciseIndex: 0,
        exercises: [],
        feedbackState: "idle",
      };

    case "GO_HOME":
      return { ...state, screen: "dashboard", feedbackState: "idle" };

    case "RESET":
      return { ...initialState, hydrated: true };

    default:
      return state;
  }
}

export function useKaliReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

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
    saveState({
      masteredCharacters: state.masteredCharacters,
      unlockedLevels: state.unlockedLevels,
      currentLevel: state.currentLevel,
      glyphMastery: state.glyphMastery,
      glyphStreaks: state.glyphStreaks,
      confusableQueue: state.confusableQueue,
      wordMastery: state.wordMastery,
      glyphResponseTimes: state.glyphResponseTimes,
      screen: state.screen,
      exercisePhase: state.exercisePhase,
      exerciseIndex: state.exerciseIndex,
      exercises: state.exercises,
      score: state.score,
    });
  }, [state]);

  return { state, dispatch };
}
