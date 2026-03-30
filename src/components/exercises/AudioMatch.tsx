"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { speak, isSpeechAvailable } from "@/lib/speech";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";

interface AudioMatchProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function AudioMatch({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: AudioMatchProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (playing || loading) return;
    setLoading(true);
    setPlaying(false);
    setSpeechFailed(false);
    try {
      const playPromise = speak(exercise.prompt);
      // Mark as "playing" right away (audio starts playing via promise chain inside speak())
      setPlaying(true);
      setLoading(false);
      await playPromise;
    } catch {
      setSpeechFailed(true);
    } finally {
      setPlaying(false);
      setLoading(false);
    }
  }, [exercise.prompt, playing, loading]);

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
    const correct = option === exercise.correctAnswer;
    onAnswer(correct, option);
  };

  const handleContinue = () => {
    setSelected(null);
    setHintLevel(0);
    onNext();
  };

  return (
    <ExerciseLayout>
      {/* Speaker button */}
      <div className="flex flex-col items-center gap-2">
        <motion.button
          aria-label="Play audio"
          onClick={handlePlay}
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center
            border transition-colors drop-shadow-xl
            ${playing ? "bg-saffron/20 border-saffron/30 shadow-[0_0_30px_rgba(241,178,74,0.3)]" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
            ${loading ? "opacity-60 cursor-wait" : ""}
          `}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
          ) : (
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
          )}
        </motion.button>
        <p className="text-xs text-sand-dim">
          {loading
            ? "Loading audio…"
            : speechAvailable && !speechFailed
            ? "Tap to hear the sound"
            : "Audio unavailable — use the hint below"}
        </p>
        {(!speechAvailable || speechFailed) && (
          <p className="text-sm text-saffron font-medium">Sound: &ldquo;{exercise.prompt}&rdquo;</p>
        )}
        <p className="text-xs text-sand-dim">Select the matching character</p>
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
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""}
              `}
              onClick={() => handleSelect(option)}
              whileTap={feedbackState === "idle" ? { scale: 0.95 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
            >
              <span className="absolute top-1.5 left-2 text-[10px] text-sand-dim/50 font-medium select-none">
                {OPTION_LABELS[idx]}
              </span>
              <span className="font-kannada text-4xl">{option}</span>
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
