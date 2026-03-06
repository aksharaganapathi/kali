"use client";

import { useReducer, useEffect, useCallback } from "react";
import { AppState, AppAction, ExercisePhase } from "@/types";
import { loadState, saveState } from "@/lib/storage";

const PHASE_ORDER: ExercisePhase[] = ["visual", "audio", "scramble", "phonetic"];

const initialState: AppState = {
  screen: "dashboard",
  currentLevel: 1,
  exercisePhase: "visual",
  exerciseIndex: 0,
  exercises: [],
  score: { correct: 0, total: 0 },
  masteredCharacters: [],
  unlockedLevels: [1],
  feedbackState: "idle",
  hydrated: false,
};

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

    case "ANSWER":
      return {
        ...state,
        feedbackState: action.correct ? "correct" : "incorrect",
        score: {
          correct: state.score.correct + (action.correct ? 1 : 0),
          total: state.score.total + 1,
        },
      };

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
        feedbackState: "idle",
      };
    }

    case "COMPLETE_LEVEL": {
      const accuracy =
        state.score.total > 0
          ? state.score.correct / state.score.total
          : 0;
      const passed = accuracy >= 0.8;

      const newMastered = passed
        ? [...new Set([...state.masteredCharacters, ...action.newMastered])]
        : state.masteredCharacters;

      const nextLevel = state.currentLevel + 1;
      const newUnlocked =
        passed && !state.unlockedLevels.includes(nextLevel)
          ? [...state.unlockedLevels, nextLevel]
          : state.unlockedLevels;

      return {
        ...state,
        screen: "dashboard",
        masteredCharacters: newMastered,
        unlockedLevels: newUnlocked.filter((l) => l <= 6),
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

  // Hydrate from localStorage on mount
  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      dispatch({
        type: "HYDRATE",
        state: {
          masteredCharacters: persisted.masteredCharacters,
          unlockedLevels: persisted.unlockedLevels,
          currentLevel: persisted.currentLevel,
        },
      });
    } else {
      dispatch({ type: "HYDRATE", state: {} });
    }
  }, []);

  // Persist to localStorage on relevant state changes
  useEffect(() => {
    if (!state.hydrated) return;
    saveState({
      masteredCharacters: state.masteredCharacters,
      unlockedLevels: state.unlockedLevels,
      currentLevel: state.currentLevel,
    });
  }, [state.masteredCharacters, state.unlockedLevels, state.currentLevel, state.hydrated]);

  return { state, dispatch };
}
