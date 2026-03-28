"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";

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
  const [items, setItems] = useState<string[]>(exercise.scrambledParts ?? []);
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
    onAnswer(assembled === exercise.correctAnswer, assembled);
  };

  const handleContinue = () => {
    setSubmitted(false);
    setHintLevel(0);
    onNext();
  };

  return (
    <ExerciseLayout>
      {/* Prompt */}
      <div className="text-center">
        <p className="text-xs text-sand-dim uppercase tracking-wider mb-1">Build the word for</p>
        <motion.p
          key={exercise.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-saffron drop-shadow-md"
        >
          {exercise.prompt}
        </motion.p>
        <p className="text-xs text-sand-dim mt-1">Drag to rearrange the syllables</p>
      </div>

      {/* Syllable tiles — using simple click-reorder for reliability */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        {items.map((part, idx) => (
          <GlassCard
            key={`${part}-${idx}`}
            className={`
              px-5 py-4 select-none cursor-grab active:cursor-grabbing transition-all duration-300
              ${feedbackState === "correct" ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
              ${feedbackState === "incorrect" ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
            `}
            onClick={() => {
              if (feedbackState !== "idle") return;
              // Cycle this tile to the end as a simple reorder
              setItems((prev) => {
                const next = [...prev];
                next.splice(idx, 1);
                next.push(part);
                return next;
              });
            }}
          >
            <span className="font-kannada text-4xl text-white">{part}</span>
          </GlassCard>
        ))}
      </div>

      {/* Live preview */}
      <div className="text-center">
        <p className="text-xs text-sand-dim mb-1">Your word:</p>
        <span
          className={`
            font-kannada text-4xl transition-colors duration-300
            ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
            ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
            ${feedbackState === "idle" ? "text-sand" : ""}
          `}
        >
          {items.join("")}
        </span>
        <AnimatePresence>
          {feedbackState === "incorrect" && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2">
              <p className="text-xs text-sand-dim">Correct answer:</p>
              <span className="font-kannada text-2xl text-correct text-glow-correct">{exercise.correctAnswer}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint / submit / continue */}
      <div className="w-full flex flex-col items-center gap-2 min-h-[72px] justify-center">
        <AnimatePresence mode="wait">
          {feedbackState === "idle" ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
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
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-sand-dim mt-2">
                      {hints[hintLevel - 1]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm tracking-wide border border-white/20 hover:bg-white/20 transition-all"
              >
                Check
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="continue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleContinue}
              className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] transition-all active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ExerciseLayout>
  );
}
