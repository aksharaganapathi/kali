"use client";

import { motion } from "framer-motion";
import { LEVELS } from "@/lib/curriculum";
import { AppState, AppAction } from "@/types";
import Button from "./ui/Button";
import ProgressRing from "./ui/ProgressRing";

interface LevelCompleteProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function LevelComplete({
  state,
  dispatch,
}: LevelCompleteProps) {
  const level = LEVELS.find((l) => l.id === state.currentLevel);
  const accuracy =
    state.score.total > 0
      ? Math.round((state.score.correct / state.score.total) * 100)
      : 0;

  const passed = accuracy >= 80;

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_LEVEL" });
  };

  const handleRetry = () => {
    dispatch({ type: "RETRY_LEVEL" });
  };

  const handleGoHome = () => {
    dispatch({ type: "GO_HOME" });
  };

  const particles = Array.from({ length: 20 }, (_, i) => {
    const phase = i * 0.618;
    return {
      id: i,
      x: Math.sin(phase * 4.2) * 150,
      y: -(90 + (i % 5) * 28),
      rotation: Math.cos(phase * 3.1) * 360,
      scale: 0.45 + ((i * 7) % 6) * 0.08,
      delay: (i % 8) * 0.06,
    };
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background:
              p.id % 3 === 0 ? "#F1B24A" : p.id % 3 === 1 ? "#4ADE80" : "#D4CDBC",
            left: "50%",
            top: "50%",
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.6,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-sm relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${
            passed
              ? "bg-correct/10 border border-correct/20"
              : "bg-saffron/10 border border-saffron/20"
          }`}
        >
          {passed ? (
            <svg
              className="w-10 h-10 text-correct"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-saffron"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
          )}
        </motion.div>

        <h1 className="text-2xl font-semibold mb-2">
          {passed ? "Level Mastered!" : "Keep Practicing!"}
        </h1>
        <p className="font-kannada text-saffron text-lg mb-1">
          {level?.kannadaName}
        </p>
        {!passed && (
          <p className="text-sm text-sand-dim mb-4">
            Score 80% or higher to unlock the next level
          </p>
        )}

        <div className="flex justify-center gap-8 mb-8 mt-4">
          <div className="text-center">
            <ProgressRing
              progress={accuracy / 100}
              size={56}
              strokeWidth={3}
            />
            <p className="text-xs text-sand-dim mt-2">Accuracy</p>
            <p className="text-lg font-semibold text-saffron">{accuracy}%</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center">
              <span className="text-2xl font-semibold text-saffron">
                {state.score.correct}
              </span>
            </div>
            <p className="text-xs text-sand-dim mt-2">Correct</p>
            <p className="text-lg font-semibold">
              <span className="text-sand-dim">of {state.score.total}</span>
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center">
              <span className="text-2xl font-semibold text-saffron">
                {level?.characters.length ?? 0}
              </span>
            </div>
            <p className="text-xs text-sand-dim mt-2">Characters</p>
            <p className="text-lg font-semibold text-sand-dim">
              {passed ? "Unlocked" : "To Master"}
            </p>
          </div>
        </div>

        {passed ? (
          <Button size="lg" onClick={handleContinue}>
            Continue
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={handleRetry}>
              Try Again
            </Button>
            <button
              onClick={handleGoHome}
              className="text-sm text-sand-dim hover:text-sand transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
