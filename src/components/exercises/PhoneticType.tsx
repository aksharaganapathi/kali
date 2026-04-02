"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";
import ExerciseLayout from "./ExerciseLayout";
import CenteredGlyph from "../ui/CenteredGlyph";

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
  const [hintLevel, setHintLevel] = useState(0);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Try splitting the sound into smaller syllables.";
    const second = exercise.teachingNote ?? `Expected pattern is close to: ${exercise.correctAnswer}`;
    return [first, second];
  }, [exercise.correctAnswer, exercise.hintText, exercise.teachingNote]);

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
    setHintLevel(0);
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && feedbackState !== "idle") {
      handleContinue();
    }
  };

  return (
    <ExerciseLayout>
      {/* Glyph prompt */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-36 h-36 rounded-2xl bg-white/4 border border-white/8">
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CenteredGlyph
              glyph={exercise.prompt}
              className={`
                ${exercise.fontOverride || "font-kannada"} text-8xl leading-none drop-shadow-lg block
                ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
                ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
                ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
                transition-colors duration-300
              `}
            />
          </motion.div>
        </div>
        <p className="text-xs text-sand-dim">Type the phonetic romanization</p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => feedbackState === "idle" && setInput(e.target.value)}
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

        {/* Incorrect answer reveal */}
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

        {/* Hint / submit / continue */}
        <div className="flex flex-col items-center gap-2 w-full min-h-[80px] justify-center">
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
                <motion.button
                  type="submit"
                  disabled={!input.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm tracking-wide border border-white/20 disabled:opacity-40 hover:bg-white/20 transition-all"
                >
                  Submit
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="continue"
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleContinue}
                className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_25px_rgba(241,178,74,0.5)] transition-all active:scale-95"
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
