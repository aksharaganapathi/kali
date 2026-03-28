"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { isSpeechAvailable, speak } from "@/lib/speech";

interface CharacterLearnProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function CharacterLearn({ exercise, onNext }: CharacterLearnProps) {
  const speechAvailable = isSpeechAvailable();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-play on mount
  useEffect(() => {
    if (!speechAvailable) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setIsLoading(true);
      try {
        setIsPlaying(true);
        setIsLoading(false);
        await speak(exercise.prompt);
        if (!cancelled) setHasPlayed(true);
      } catch {
        // silent — user can tap manually
      } finally {
        if (!cancelled) { setIsPlaying(false); setIsLoading(false); }
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const handlePlay = async () => {
    if (!speechAvailable || isPlaying || isLoading) return;
    setIsLoading(true);
    try {
      setIsPlaying(true);
      setIsLoading(false);
      await speak(exercise.prompt);
      setHasPlayed(true);
    } catch {
      // silent
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-6"
    >
      {/* Badge label */}
      <p className="text-xs uppercase tracking-widest text-sand-dim/70 font-medium">
        New Character
      </p>

      {/* Glyph stage — the main focal point */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-saffron/8 border border-saffron/20 shadow-[0_0_40px_rgba(241,178,74,0.08)]">
          {/* Decorative corner accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-saffron/30 rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-saffron/30 rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-saffron/30 rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-saffron/30 rounded-br-sm" />

          {/* The glyph — translateY compensates for Noto Sans Kannada's tall ascender metrics */}
          <span
            className="font-kannada text-saffron text-glow-saffron select-none block"
            style={{
              fontSize: "5rem",
              lineHeight: 1,
              transform: "translateY(1.25rem)",
            }}
          >
            {exercise.prompt}
          </span>
        </div>

        {/* Romanization */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-white tracking-wide">
            {exercise.correctAnswer}
          </p>
          <p className="text-xs text-sand-dim/60 mt-1">romanization</p>
        </div>
      </div>

      {/* Audio button */}
      {speechAvailable && (
        <button
          onClick={handlePlay}
          disabled={isPlaying || isLoading}
          className={`
            flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-200
            ${isPlaying
              ? "bg-saffron/15 border-saffron/40 text-saffron"
              : "bg-white/5 border-white/15 text-sand-dim hover:bg-white/10 hover:border-white/25 hover:text-sand"
            }
            disabled:cursor-wait
          `}
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border border-saffron/40 border-t-saffron rounded-full animate-spin" />
          ) : (
            <motion.svg
              animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 0.7 } : {}}
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </motion.svg>
          )}
          <span className="text-xs font-medium">
            {isLoading ? "Loading…" : isPlaying ? "Playing" : "Hear it"}
          </span>
        </button>
      )}

      {/* Instruction nudge */}
      <AnimatePresence>
        {!hasPlayed && speechAvailable && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-sand-dim/50 text-center"
          >
            Listen once, say it aloud, then continue
          </motion.p>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="px-10 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(241,178,74,0.3)] hover:shadow-[0_0_32px_rgba(241,178,74,0.45)] transition-all"
      >
        Got it
      </motion.button>
    </motion.div>
  );
}
