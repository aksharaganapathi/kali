"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";
import CenteredGlyph from "../ui/CenteredGlyph";

interface ReverseRecallProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function ReverseRecall({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: ReverseRecallProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Match the sound to its visual shape.";
    const second = exercise.teachingNote ?? "Eliminate incorrect options first.";
    return [first, second];
  }, [exercise.hintText, exercise.teachingNote]);

  const handleSelect = (option: string, eventTimeStamp: number) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = checkAnswer(exercise, option);
    const eventEpochMs = performance.timeOrigin + eventTimeStamp;
    const elapsedMs = Math.round(Math.max(0, eventEpochMs - (exercise.createdAtMs ?? eventEpochMs)));
    onAnswer(correct, option, elapsedMs);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  // Keyboard shortcuts (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedbackState !== "idle") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleContinue();
        }
        return;
      }

      const key = e.key.toLowerCase();
      let index = -1;

      if (["1", "2", "3", "4"].includes(key)) {
        index = parseInt(key, 10) - 1;
      } else if (["a", "b", "c", "d"].includes(key)) {
        index = ["a", "b", "c", "d"].indexOf(key);
      }

      if (index >= 0 && exercise.options && index < exercise.options.length) {
        e.preventDefault();
        handleSelect(exercise.options[index], e.timeStamp);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedbackState, exercise.options]);

  return (
    <ExerciseLayout>
      {/* Romanization Prompt */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-32 flex items-center justify-center"
        >
          <span className="text-5xl font-bold tracking-wide text-saffron text-glow-saffron">
            {exercise.prompt}
          </span>
        </motion.div>
        <p className="text-xs text-sand-dim">Select the matching Kannada glyph</p>
      </div>

      {/* Answer cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {exercise.options?.map((option, idx) => {
          const isSelected = selected === option;
          const isCorrect = feedbackState !== "idle" && checkAnswer(exercise, option);
          const isWrong = feedbackState === "incorrect" && isSelected && !isCorrect;

          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                min-h-[96px] px-4 flex items-center justify-center text-center cursor-pointer select-none transition-all duration-300 relative
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
              `}
              onClick={(e) => handleSelect(option, e.timeStamp)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="absolute top-1.5 left-2 text-[10px] text-sand-dim/50 font-medium select-none">
                {OPTION_LABELS[idx]}
              </span>
              <CenteredGlyph glyph={option} className="font-kannada text-4xl leading-none block" />
            </GlassCard>
          );
        })}
      </div>

      {/* Hint */}
      <div className="w-full max-w-sm text-center min-h-[40px]">
        <AnimatePresence mode="wait">
          {feedbackState === "idle" ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setHintLevel((prev) => Math.min(prev + 1, hints.length))}
                disabled={hintLevel >= hints.length}
                className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-sand hover:border-saffron/50 hover:text-saffron transition-colors disabled:opacity-40"
              >
                {hintLevel === 0 ? "Need a hint?" : hintLevel === 1 ? "Show another hint" : "No more hints"}
              </button>
              <AnimatePresence>
                {hintLevel > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-sand-dim mt-2"
                  >
                    {hints[hintLevel - 1]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.button
              key="continue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleContinue}
              className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_25px_rgba(241,178,74,0.5)] transition-all active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ExerciseLayout>
  );
}
