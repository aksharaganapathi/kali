"use client";

import { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import GlassCard from "../ui/GlassCard";

interface SyllableScrambleProps {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
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

  // Reset when exercise changes
  useEffect(() => {
    setItems(exercise.scrambledParts ?? []);
    setSubmitted(false);
  }, [exercise.id, exercise.scrambledParts]);

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
    <div className="w-full flex flex-col items-center">
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
        <p className="text-2xl font-semibold text-saffron">
          {exercise.prompt}
        </p>
      </motion.div>

      <p className="text-xs text-sand-dim mb-8">
        Drag to rearrange the syllables
      </p>

      {/* Reorder tiles */}
      <Reorder.Group
        axis="x"
        values={items}
        onReorder={feedbackState === "idle" ? setItems : () => {}}
        className="flex flex-wrap justify-center gap-3 mb-6 min-h-[80px]"
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
                px-5 py-4 select-none
                ${feedbackState === "correct" ? "!border-correct/40 !bg-correct/10" : ""}
                ${feedbackState === "incorrect" ? "!border-incorrect/40 !bg-incorrect/10" : ""}
              `}
            >
              <span className="font-kannada text-3xl sm:text-4xl">
                {part}
              </span>
            </GlassCard>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Assembly preview */}
      <div className="mb-6 text-center">
        <p className="text-xs text-sand-dim mb-2">Your word:</p>
        <span
          className={`
            font-kannada text-4xl
            ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
            ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
            ${feedbackState === "idle" ? "text-sand" : ""}
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
            className="mb-4 text-center"
          >
            <p className="text-xs text-sand-dim">Correct answer:</p>
            <span className="font-kannada text-2xl text-correct">
              {exercise.correctAnswer}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      {feedbackState === "idle" ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-saffron text-onyx font-medium text-sm"
        >
          Check
        </motion.button>
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleContinue}
          className="px-6 py-2.5 rounded-xl bg-saffron text-onyx font-medium text-sm"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}
