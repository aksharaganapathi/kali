"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { speak, isSpeechAvailable } from "@/lib/speech";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";

interface MinimalPairProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

const OPTION_LABELS = ["A", "B"];

export default function MinimalPair({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: MinimalPairProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const speechAvailable = isSpeechAvailable();
  const autoPlayed = useRef(false);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Watch which option has the matching shape and sound.";
    const second = exercise.teachingNote ?? "Compare the first stroke and open/closed loop closely.";
    return [first, second];
  }, [exercise.hintText, exercise.teachingNote]);

  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    try {
      await speak(exercise.prompt);
    } finally {
      setPlaying(false);
    }
  }, [exercise.prompt, playing]);

  useEffect(() => {
    if (!autoPlayed.current && speechAvailable) {
      autoPlayed.current = true;
      const timer = setTimeout(() => { handlePlay(); }, 10);
      return () => clearTimeout(timer);
    }
  }, [exercise.id, handlePlay, speechAvailable]);

  const handleSelect = (option: string) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    onAnswer(option === exercise.correctAnswer, option);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  return (
    <ExerciseLayout>
      {/* Audio trigger */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-wider text-sand-dim">Minimal pair contrast</p>
        <button
          aria-label="Play audio"
          onClick={handlePlay}
          className={`w-20 h-20 rounded-full border flex items-center justify-center transition-colors ${
            playing ? "bg-saffron/20 border-saffron/30" : "bg-white/5 border-white/15 hover:bg-white/10"
          }`}
        >
          <motion.span
            animate={playing ? { scale: [1, 1.15, 1] } : {}}
            transition={playing ? { repeat: Infinity, duration: 0.8 } : {}}
            className="text-2xl"
          >
            🔊
          </motion.span>
        </button>
        <p className="text-xs text-sand-dim">Pick the character that matches the sound</p>
      </div>

      {/* Answer cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {exercise.options?.map((option, idx) => {
          const isSelected = selected === option;
          const isCorrect = feedbackState !== "idle" && option === exercise.correctAnswer;
          const isWrong = feedbackState === "incorrect" && isSelected && !isCorrect;
          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                py-6 px-4 text-center cursor-pointer select-none transition-all duration-300 relative
                ${isCorrect ? "!border-correct/40 !bg-correct/10" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
            >
              <span className="absolute top-1.5 left-2 text-[10px] text-sand-dim/50 font-medium select-none">
                {OPTION_LABELS[idx]}
              </span>
              <span className="font-kannada text-5xl text-white">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      {/* Hint / continue */}
      <div className="w-full max-w-sm text-center min-h-[40px]" aria-live="polite">
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
              onClick={handleContinue}
              className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide"
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ExerciseLayout>
  );
}
