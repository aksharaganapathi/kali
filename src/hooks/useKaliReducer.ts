"use client";

import { useReducer, useEffect } from "react";
import { AppState, AppAction, LevelId } from "@/types";
import { loadState, saveState } from "@/lib/storage";

const LEVEL_ORDER: LevelId[] = [1, 2, "3a", "3b", "3c", 4, 5, 6];
const CONFUSABLE_MAP: Record<string, string[]> = {
  "ನ": ["ಹ"],
};
const CONFUSABLE_PAIR_SEPARATOR = "~";

const FLUENCY_WINDOW_MS = 2000;
const BASE_MASTERY_GAIN = 8;
const FLUENCY_BONUS_GAIN = 6;
const INCORRECT_MASTERY_PENALTY = 6;

const initialState: AppState = {
  screen: "dashboard",
  currentLevel: 1,
  exercisePhase: "visual",
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
      return {
        ...state,
        screen: "level-intro",
        currentLevel: action.level,
        score: { correct: 0, total: 0 },
        exerciseIndex: 0,
        feedbackState: "idle",
      };

    case "START_EXERCISE": {
      const firstPhase = action.exercises[0]?.phase ?? "visual";
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
        (currentExercise.phase === "visual" || currentExercise.phase === "phonetic") &&
        action.elapsedMs !== undefined &&
        action.elapsedMs <= FLUENCY_WINDOW_MS;

      let glyphMastery = state.glyphMastery;
      let glyphStreaks = state.glyphStreaks;
      let masteredCharacters = state.masteredCharacters;
      let confusableQueue = state.confusableQueue;

      if (targetGlyph) {
        const previousMastery = glyphMastery[targetGlyph] ?? 0;
        const previousStreak = glyphStreaks[targetGlyph] ?? 0;

        if (action.correct) {
          const gain = BASE_MASTERY_GAIN + (isSpeedEligible ? FLUENCY_BONUS_GAIN : 0);
          glyphMastery = {
            ...glyphMastery,
            [targetGlyph]: clampScore(previousMastery + gain),
          };

          if (currentExercise?.phase === "phonetic") {
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

          if (currentExercise?.phase === "phonetic") {
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
      const passed = accuracy >= 0.8;
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
      screen: state.screen,
      exercisePhase: state.exercisePhase,
      exerciseIndex: state.exerciseIndex,
      exercises: state.exercises,
      score: state.score,
    });
  }, [state]);

  return { state, dispatch };
}
