"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";

interface VisualFlashcardProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function VisualFlashcard({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: VisualFlashcardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Say each option out loud and match the glyph shape.";
    const second = exercise.teachingNote ?? "Look for a distinguishing loop or tail before selecting.";
    return [first, second];
  }, [exercise.hintText, exercise.teachingNote]);

  const handleSelect = (option: string, eventTimeStamp: number) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = checkAnswer(exercise, option);
    const eventEpochMs = performance.timeOrigin + eventTimeStamp;
    const elapsedMs = Math.max(0, eventEpochMs - (exercise.createdAtMs ?? eventEpochMs));
    onAnswer(correct, option, elapsedMs);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  return (
    <ExerciseLayout>
      {/* Glyph prompt */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-8 py-5 rounded-2xl bg-white/4 border border-white/8"
        >
          <span
            className={`
              ${exercise.fontOverride || "font-kannada"} text-8xl leading-none inline-block translate-y-3
              ${feedbackState === "correct" ? "text-correct text-glow-correct" : ""}
              ${feedbackState === "incorrect" ? "text-incorrect text-glow-incorrect" : ""}
              ${feedbackState === "idle" ? "text-saffron text-glow-saffron" : ""}
              transition-colors duration-300 drop-shadow-xl
            `}
          >
            {exercise.prompt}
          </span>
        </motion.div>
        <p className="text-xs text-sand-dim">What sound does this make?</p>
      </div>

      {/* Answer cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {exercise.options?.map((option, idx) => {
          const isSelected = selected === option;
          const isCorrect = feedbackState !== "idle" && checkAnswer(exercise, option);
          const isWrong = feedbackState === "incorrect" && isSelected && !isCorrect;

          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                py-5 px-4 text-center cursor-pointer select-none transition-all duration-300 relative
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
              `}
              onClick={(e) => handleSelect(option, e.timeStamp)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="absolute top-1.5 left-2 text-[10px] text-sand-dim/50 font-medium select-none">
                {OPTION_LABELS[idx]}
              </span>
              <span className="text-xl font-semibold tracking-wide">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      {/* Hint */}
      <div className="w-full max-w-sm text-center min-h-[40px]">
        <AnimatePresence mode="wait">
          {feedbackState === "idle" ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            </motion.div>
          ) : (
            <motion.button
              key="continue"
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
    </ExerciseLayout>
  );
}
