"use client";

import { useMemo, useState } from "react";
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
  const [hintLevel, setHintLevel] = useState(0);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Start with the first sound chunk you hear when reading the meaning aloud.";
    const second = exercise.teachingNote ?? "Try placing the base consonant chunk first, then attach modifiers.";
    return [first, second];
  }, [exercise.hintText, exercise.teachingNote]);

  const handleSubmit = () => {
    if (submitted || feedbackState !== "idle") return;
    setSubmitted(true);
    const assembled = items.join("");
    const correct = assembled === exercise.correctAnswer;
    onAnswer(correct, assembled);
  };

  const handleContinue = () => {
    setSubmitted(false);
    setHintLevel(0);
    onNext();
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-end w-full pb-6">
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

      <div className="flex flex-col items-center justify-start h-24">
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

      <div className="h-16 w-full flex items-center justify-center mt-1">
        {feedbackState === "idle" && (
          <div className="text-center">
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
          </div>
        )}
      </div>

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
