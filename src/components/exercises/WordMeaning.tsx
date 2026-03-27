"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import GlassCard from "../ui/GlassCard";

interface WordMeaningProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function WordMeaning({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: WordMeaningProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const hints = useMemo(() => {
    const firstHint =
      exercise.hintText ??
      (exercise.aliases?.[0]
        ? `Pronunciation: ${exercise.aliases[0]}`
        : "Say the word out loud once before choosing.");
    const secondHint =
      exercise.teachingNote ??
      "Eliminate one unlikely meaning first, then compare the final two options.";
    return [firstHint, secondHint];
  }, [exercise.aliases, exercise.hintText, exercise.teachingNote]);

  const handleSelect = (option: string) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = option === exercise.correctAnswer;
    onAnswer(correct, option);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  const handleHint = () => {
    setHintLevel((prev) => Math.min(prev + 1, hints.length));
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-end pb-8">
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2"
        >
          <span
            className={`
              font-kannada text-5xl sm:text-6xl drop-shadow-xl
              ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
              ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
              ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
              transition-colors duration-300
            `}
          >
            {exercise.prompt}
          </span>
        </motion.div>

        <p className="text-xs text-sand-dim">What does this word mean?</p>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
        {exercise.options?.map((option) => {
          const isSelected = selected === option;
          const isCorrect =
            feedbackState !== "idle" && option === exercise.correctAnswer;
          const isWrong =
            feedbackState === "incorrect" && isSelected && !isCorrect;

          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                p-4 text-center cursor-pointer select-none transition-all duration-300
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="text-base font-medium text-white">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      <div className="h-20 w-full flex items-center justify-center mt-2">
        {feedbackState === "idle" && (
          <div className="w-full max-w-sm text-center">
            <button
              onClick={handleHint}
              disabled={hintLevel >= hints.length}
              className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-sand hover:border-saffron/50 hover:text-saffron transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
          </div>
        )}
      </div>

      <div className="h-20 w-full flex items-center justify-center mt-4">
        <AnimatePresence>
          {feedbackState !== "idle" && (
            <motion.button
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
    </div>
  );
}
