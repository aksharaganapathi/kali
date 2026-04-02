"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useKaliReducer } from "@/hooks/useKaliReducer";
import { preloadVoices } from "@/lib/speech";
import Dashboard from "./Dashboard";
import LevelIntro from "./LevelIntro";
import LevelComplete from "./LevelComplete";
import ExerciseShell from "./exercises/ExerciseShell";
import VisualFlashcard from "./exercises/VisualFlashcard";
import AudioMatch from "./exercises/AudioMatch";
import SyllableScramble from "./exercises/SyllableScramble";
import PhoneticType from "./exercises/PhoneticType";
import MinimalPair from "./exercises/MinimalPair";
import CharacterLearn from "./exercises/CharacterLearn";
import VDTCompare from "./exercises/VDTCompare";
import GhostBase from "./exercises/GhostBase";
import Onboarding from "./Onboarding";

const ONBOARDING_KEY = "kali_onboarding_done";

const pageTransition = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

export default function KaliApp() {
  const { state, dispatch } = useKaliReducer();
  const [hasOnboardingDone, setHasOnboardingDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  });

  useEffect(() => {
    preloadVoices();
  }, []);

  const showOnboarding =
    state.hydrated &&
    !hasOnboardingDone &&
    state.masteredCharacters.length === 0;

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setHasOnboardingDone(true);
    // Auto-navigate to Level 1 intro
    dispatch({ type: "SELECT_LEVEL", level: 1 });
  };

  if (!state.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
          <p className="text-xs text-sand-dim">Loading...</p>
        </div>
      </div>
    );
  }

  const currentExercise = state.exercises[state.exerciseIndex];

  const handleAnswer = (correct: boolean, userAnswer?: string, elapsedMs?: number) => {
    dispatch({ type: "ANSWER", correct, userAnswer, elapsedMs });
  };

  const handleNext = () => {
    dispatch({ type: "NEXT_EXERCISE" });
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const props = {
      exercise: currentExercise,
      onAnswer: handleAnswer,
      onNext: handleNext,
      feedbackState: state.feedbackState,
    };

    switch (currentExercise.phase) {
      case "learn":         return <CharacterLearn key={currentExercise.id} {...props} />;
      case "vdt-compare":   return <VDTCompare key={currentExercise.id} {...props} />;
      case "ghost-base":    return <GhostBase key={currentExercise.id} {...props} />;
      case "visual":        return <VisualFlashcard key={currentExercise.id} {...props} />;
      case "audio":         return <AudioMatch key={currentExercise.id} {...props} />;
      case "minimal-pair":  return <MinimalPair key={currentExercise.id} {...props} />;
      case "scramble":      return <SyllableScramble key={currentExercise.id} {...props} />;
      case "phonetic":      return <PhoneticType key={currentExercise.id} {...props} />;
      default:              return null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-x-hidden">
      {/* First-launch onboarding modal */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.screen === "dashboard" && (
          <motion.div key="dashboard" {...pageTransition}>
            <Dashboard state={state} dispatch={dispatch} />
          </motion.div>
        )}

        {state.screen === "level-intro" && (
          <motion.div key="level-intro" {...pageTransition}>
            <LevelIntro state={state} dispatch={dispatch} />
          </motion.div>
        )}

        {state.screen === "exercise" && (
          <motion.div key="exercise" {...pageTransition}>
            <ExerciseShell
              state={state}
              onBack={() => dispatch({ type: "GO_HOME" })}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExercise?.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  {renderExercise()}
                </motion.div>
              </AnimatePresence>
            </ExerciseShell>
          </motion.div>
        )}

        {state.screen === "level-complete" && (
          <motion.div key="level-complete" {...pageTransition}>
            <LevelComplete state={state} dispatch={dispatch} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
