"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";
import ExerciseLayout from "./ExerciseLayout";

interface GuidedDecodeProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function GuidedDecode({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: GuidedDecodeProps) {
  const [input, setInput] = useState("");
  const [hintLevel, setHintLevel] = useState(0);

  const steps = useMemo(() => exercise.decodeSteps ?? [], [exercise.decodeSteps]);

  const hints = useMemo(() => {
    const base = exercise.hintText ?? "Decode each grapheme chunk from left to right.";
    const second =
      exercise.teachingNote ??
      `Chunk order: ${steps.join(" + ")} = ${exercise.aliases?.[0] ?? exercise.correctAnswer}`;
    return [base, second];
  }, [exercise.aliases, exercise.correctAnswer, exercise.hintText, exercise.teachingNote, steps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== "idle" || !input.trim()) return;
    onAnswer(checkAnswer(exercise, input), input);
  };

  const handleContinue = () => {
    setInput("");
    setHintLevel(0);
    onNext();
  };

  return (
    <ExerciseLayout>
      {/* Prompt */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-sand-dim mb-2">Guided decode</p>
        <motion.p
          key={exercise.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-kannada text-6xl text-saffron text-glow-saffron"
        >
          {exercise.prompt}
        </motion.p>
      </div>

      {/* Step breakdown */}
      <div className="w-full max-w-md grid gap-2">
        {steps.map((step, idx) => (
          <div
            key={`${exercise.id}_${idx}_${step}`}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between"
          >
            <span className="text-xs text-sand-dim">Step {idx + 1}</span>
            <span className="font-kannada text-2xl text-sand">{step}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => feedbackState === "idle" && setInput(e.target.value)}
          placeholder="Type romanization"
          className={`
            w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-lg font-medium
            placeholder:text-sand-dim/30 focus:outline-none transition-colors
            ${feedbackState === "idle" ? "border-white/10 focus:border-saffron/50 text-white" : ""}
            ${feedbackState === "correct" ? "border-correct/40 bg-correct/10 text-correct" : ""}
            ${feedbackState === "incorrect" ? "border-incorrect/40 bg-incorrect/10 text-incorrect" : ""}
          `}
          readOnly={feedbackState !== "idle"}
        />

        <div className="flex flex-col items-center gap-2 w-full min-h-[72px] justify-center">
          <AnimatePresence mode="wait">
            {feedbackState === "idle" ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 w-full">
                <div className="text-center">
                  <button
                    type="button"
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
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm border border-white/20 disabled:opacity-40 hover:bg-white/20 transition-all"
                >
                  Check
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="continue"
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleContinue}
                className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide"
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </ExerciseLayout>
  );
}
