"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";

interface PhoneticTypeProps {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function PhoneticType({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: PhoneticTypeProps) {
  const [input, setInput] = useState("");

  // Reset on exercise change
  useEffect(() => {
    setInput("");
  }, [exercise.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== "idle" || !input.trim()) return;
    const correct = checkAnswer(exercise, input);
    onAnswer(correct);
  };

  const handleContinue = () => {
    setInput("");
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && feedbackState !== "idle") {
      handleContinue();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Kannada word prompt */}
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-2"
      >
        <span
          className={`
            font-kannada text-6xl sm:text-7xl
            ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
            ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
            ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
            transition-colors duration-300
          `}
        >
          {exercise.prompt}
        </span>
      </motion.div>

      <p className="text-xs text-sand-dim mb-8">
        Type the phonetic romanization
      </p>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              feedbackState === "idle" && setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. kaala"
            className={`
              w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-lg font-medium
              placeholder:text-sand-dim/30 focus:outline-none
              transition-colors duration-200
              ${feedbackState === "idle" ? "border-white/10 focus:border-saffron/50 text-sand" : ""}
              ${feedbackState === "correct" ? "border-correct/40 bg-correct/10 text-correct" : ""}
              ${feedbackState === "incorrect" ? "border-incorrect/40 bg-incorrect/10 text-incorrect" : ""}
            `}
            readOnly={feedbackState !== "idle"}
          />
        </div>

        {/* Correct answer shown on wrong */}
        <AnimatePresence>
          {feedbackState === "incorrect" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center"
            >
              <p className="text-xs text-sand-dim">Correct answer:</p>
              <p className="text-sm text-correct font-medium mt-0.5">
                {exercise.correctAnswer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <div className="mt-6 text-center">
          {feedbackState === "idle" ? (
            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-xl bg-saffron text-onyx font-medium text-sm disabled:opacity-40"
            >
              Submit
            </motion.button>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-xl bg-saffron text-onyx font-medium text-sm"
            >
              Continue
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}
