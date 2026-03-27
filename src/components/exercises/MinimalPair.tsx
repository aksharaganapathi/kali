"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { speak, isSpeechAvailable } from "@/lib/speech";
import GlassCard from "../ui/GlassCard";

interface MinimalPairProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

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
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
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
    <div className="w-full h-[430px] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-end pb-6 w-full">
        <p className="text-xs uppercase tracking-wider text-sand-dim mb-2">Minimal pair contrast</p>
        <button
          onClick={handlePlay}
          className="w-20 h-20 rounded-full border border-white/15 bg-white/5 flex items-center justify-center mb-3"
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

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {exercise.options?.map((option) => {
          const isSelected = selected === option;
          const isCorrect = feedbackState !== "idle" && option === exercise.correctAnswer;
          const isWrong = feedbackState === "incorrect" && isSelected && !isCorrect;
          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                p-5 text-center cursor-pointer select-none transition-all duration-300
                ${isCorrect ? "!border-correct/40 !bg-correct/10" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
            >
              <span className="font-kannada text-4xl text-white">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      <div className="h-24 w-full flex items-center justify-center mt-2">
        {feedbackState === "idle" ? (
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
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleContinue}
            className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}
