"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import GlassCard from "../ui/GlassCard";

interface WordMeaningProps {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
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

  const handleSelect = (option: string) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = option === exercise.correctAnswer;
    onAnswer(correct);
  };

  const handleContinue = () => {
    setSelected(null);
    onNext();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Kannada word prompt */}
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-2"
      >
        <span
          className={`
            font-kannada text-5xl sm:text-6xl
            ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
            ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
            ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
            transition-colors duration-300
          `}
        >
          {exercise.prompt}
        </span>
      </motion.div>

      <p className="text-xs text-sand-dim mb-8">What does this word mean?</p>

      {/* Options — single column for longer English text */}
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
                p-4 text-center cursor-pointer select-none
                ${isCorrect ? "!border-correct/40 !bg-correct/10" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="text-base font-medium">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      {/* Continue */}
      <AnimatePresence>
        {feedbackState !== "idle" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleContinue}
            className="mt-8 px-6 py-2.5 rounded-xl bg-saffron text-onyx font-medium text-sm"
          >
            Continue
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
