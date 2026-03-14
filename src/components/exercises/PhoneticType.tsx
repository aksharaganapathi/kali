"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";

interface PhoneticTypeProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== "idle" || !input.trim()) return;
    const correct = checkAnswer(exercise, input);
    const eventEpochMs = performance.timeOrigin + e.timeStamp;
    const elapsedMs = Math.max(0, eventEpochMs - (exercise.createdAtMs ?? eventEpochMs));
    onAnswer(correct, input, elapsedMs);
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
    <div className="w-full h-[400px] flex flex-col items-center justify-between">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Kannada word prompt */}
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-2"
        >
          <span
            className={`
              font-kannada text-6xl sm:text-7xl drop-shadow-lg
              ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
              ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
              ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
              transition-colors duration-300
            `}
          >
            {exercise.prompt}
          </span>
        </motion.div>

        <p className="text-xs text-sand-dim">
          Type the phonetic romanization
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center">
        <div className="relative w-full">
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
              w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-lg font-medium shadow-inner
              placeholder:text-sand-dim/30 focus:outline-none
              transition-colors duration-200
              ${feedbackState === "idle" ? "border-white/10 focus:border-saffron/50 text-white focus:bg-white/10" : ""}
              ${feedbackState === "correct" ? "border-correct/40 bg-correct/10 text-correct shadow-[0_0_15px_rgba(74,222,128,0.2)]" : ""}
              ${feedbackState === "incorrect" ? "border-incorrect/40 bg-incorrect/10 text-incorrect shadow-[0_0_15px_rgba(248,113,113,0.2)]" : ""}
            `}
            readOnly={feedbackState !== "idle"}
          />
        </div>

        {/* Correct answer shown on wrong */}
        <div className="h-12 w-full flex items-center justify-center mt-2">
          <AnimatePresence>
            {feedbackState === "incorrect" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-xs text-sand-dim">Correct answer:</p>
                <p className="text-sm text-correct font-medium mt-0.5 text-glow-correct">
                  {exercise.correctAnswer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action button area */}
        <div className="h-16 w-full flex items-center justify-center mt-2">
          {feedbackState === "idle" ? (
            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm tracking-wide border border-white/20 disabled:opacity-40 disabled:hover:bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              Submit
            </motion.button>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleContinue}
              className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_25px_rgba(241,178,74,0.5)] transition-all active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}
