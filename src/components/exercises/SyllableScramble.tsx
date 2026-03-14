"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import GlassCard from "../ui/GlassCard";

interface SyllableScrambleProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function SyllableScramble({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: SyllableScrambleProps) {
  const [items, setItems] = useState<string[]>(
    exercise.scrambledParts ?? []
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submitted || feedbackState !== "idle") return;
    setSubmitted(true);
    const assembled = items.join("");
    const correct = assembled === exercise.correctAnswer;
    onAnswer(correct);
  };

  const handleContinue = () => {
    setSubmitted(false);
    onNext();
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-between">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-end w-full pb-6">
        {/* Prompt */}
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <p className="text-xs text-sand-dim uppercase tracking-wider mb-1">
            Build the word for
          </p>
          <p className="text-2xl font-semibold text-saffron drop-shadow-md">
            {exercise.prompt}
          </p>
        </motion.div>

        <p className="text-xs text-sand-dim mb-6">
          Drag to rearrange the syllables
        </p>

        {/* Reorder tiles */}
        <Reorder.Group
          axis="x"
          values={items}
          onReorder={feedbackState === "idle" ? setItems : () => { }}
          className="flex flex-wrap justify-center gap-3 w-full"
        >
          {items.map((part) => (
            <Reorder.Item
              key={part}
              value={part}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
              className="cursor-grab active:cursor-grabbing"
            >
              <GlassCard
                className={`
                  px-5 py-4 select-none transition-all duration-300
                  ${feedbackState === "correct" ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                  ${feedbackState === "incorrect" ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                  ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
                `}
              >
                <span className="font-kannada text-3xl sm:text-4xl text-white">
                  {part}
                </span>
              </GlassCard>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Middle/Bottom feedback section */}
      <div className="flex flex-col items-center justify-start h-24">
        {/* Assembly preview */}
        <div className="text-center">
          <p className="text-xs text-sand-dim mb-2">Your word:</p>
          <span
            className={`
              font-kannada text-4xl transition-colors duration-300
              ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
              ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
              ${feedbackState === "idle" ? "text-sand drop-shadow-sm" : ""}
            `}
          >
            {items.join("")}
          </span>
        </div>

        {/* Correct answer (shown after incorrect) */}
        <AnimatePresence>
          {feedbackState === "incorrect" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-2"
            >
              <p className="text-xs text-sand-dim">Correct answer:</p>
              <span className="font-kannada text-2xl text-correct text-glow-correct">
                {exercise.correctAnswer}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button area */}
      <div className="h-20 w-full flex items-center justify-center mt-2">
        {feedbackState === "idle" ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm tracking-wide border border-white/20 hover:bg-white/20 transition-all active:scale-95"
          >
            Check
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleContinue}
            className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_25px_rgba(241,178,74,0.5)] transition-all active:scale-95"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}
