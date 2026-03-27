"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { speak, isSpeechAvailable } from "@/lib/speech";
import GlassCard from "../ui/GlassCard";

interface AudioMatchProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function AudioMatch({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: AudioMatchProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speechFailed, setSpeechFailed] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const speechAvailable = isSpeechAvailable();
  const autoPlayed = useRef(false);

  const hints = useMemo(() => {
    const first = exercise.hintText ?? "Replay the sound and focus on the first consonant burst.";
    const second = exercise.teachingNote ?? "Eliminate one option, then compare the remaining two shapes.";
    return [first, second];
  }, [exercise.hintText, exercise.teachingNote]);

  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setSpeechFailed(false);
    try {
      await speak(exercise.prompt);
    } catch {
      setSpeechFailed(true);
    }
    setPlaying(false);
  }, [exercise.prompt, playing]);

  useEffect(() => {
    if (!autoPlayed.current && speechAvailable) {
      autoPlayed.current = true;
      const timer = setTimeout(() => {
        handlePlay();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [exercise.id, handlePlay, speechAvailable]);

  const handleSelect = (option: string) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = option === exercise.correctAnswer;
    onAnswer(correct, option);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-end pb-8">
        <motion.button
          onClick={handlePlay}
          whileTap={{ scale: 0.95 }}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center mb-3
            border border-white/10 transition-colors drop-shadow-xl
            ${playing ? "bg-saffron/20 border-saffron/30 shadow-[0_0_30px_rgba(241,178,74,0.3)]" : "bg-white/5 hover:bg-white/10 hover:border-white/20"}
          `}
        >
          <motion.svg
            animate={playing ? { scale: [1, 1.15, 1] } : {}}
            transition={playing ? { repeat: Infinity, duration: 0.8 } : {}}
            className="w-10 h-10 text-saffron"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
            />
          </motion.svg>
        </motion.button>

        <p className="text-xs text-sand-dim mb-1">
          {speechAvailable && !speechFailed
            ? "Tap to hear the sound"
            : "Audio unavailable — use the hint below"}
        </p>

        {(!speechAvailable || speechFailed) && (
          <p className="text-sm text-saffron font-medium mb-4">
            Sound: &ldquo;{exercise.prompt}&rdquo;
          </p>
        )}

        <p className="text-xs text-sand-dim">Select the matching character</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {exercise.options?.map((option) => {
          const isSelected = selected === option;
          const isCorrect =
            feedbackState !== "idle" && option === exercise.correctAnswer;
          const isWrong =
            feedbackState === "incorrect" && isSelected && !isCorrect;

          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                p-5 text-center cursor-pointer select-none transition-all duration-300
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="font-kannada text-3xl">{option}</span>
            </GlassCard>
          );
        })}
      </div>

      <div className="h-16 w-full flex items-center justify-center mt-2">
        {feedbackState === "idle" && (
          <div className="w-full max-w-sm text-center">
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

      <div className="h-20 w-full flex items-center justify-center mt-4">
        <AnimatePresence>
          {feedbackState !== "idle" && (
            <motion.button
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
    </div>
  );
}
