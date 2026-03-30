"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Exercise } from "@/types";
import { isSpeechAvailable, speak } from "@/lib/speech";
import { CHAR_MAP } from "@/lib/curriculum";
import ExerciseLayout from "./ExerciseLayout";

interface VDTCompareProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function VDTCompare({ exercise, onNext }: VDTCompareProps) {
  const speechAvailable = isSpeechAvailable();
  const [playingParent, setPlayingParent] = useState(false);
  const [playingChild, setPlayingChild] = useState(false);
  const [step, setStep] = useState<"intro" | "reveal">("intro");
  const autoPlayed = useRef(false);

  const childGlyph = exercise.targetGlyph ?? exercise.prompt;
  const parentGlyph = exercise.contrastGlyph ?? "";
  const parentChar = parentGlyph ? CHAR_MAP.get(parentGlyph) : undefined;
  const childChar = CHAR_MAP.get(childGlyph);
  const deltaText = exercise.teachingNote ?? "Spot the visual difference between these two characters.";

  // Auto-play both sounds in sequence on mount
  useEffect(() => {
    if (!speechAvailable || autoPlayed.current) return;
    autoPlayed.current = true;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      if (parentGlyph) {
        setPlayingParent(true);
        try { await speak(parentGlyph); } catch { /* silent */ }
        if (cancelled) return;
        setPlayingParent(false);
        await new Promise((r) => setTimeout(r, 600));
      }
      if (cancelled) return;
      setPlayingChild(true);
      try { await speak(childGlyph); } catch { /* silent */ }
      if (!cancelled) {
        setPlayingChild(false);
        setStep("reveal");
      }
    };
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const handlePlayParent = useCallback(async () => {
    if (!speechAvailable || playingParent) return;
    setPlayingParent(true);
    try { await speak(parentGlyph); } catch { /* silent */ }
    setPlayingParent(false);
  }, [speechAvailable, playingParent, parentGlyph]);

  const handlePlayChild = useCallback(async () => {
    if (!speechAvailable || playingChild) return;
    setPlayingChild(true);
    try { await speak(childGlyph); } catch { /* silent */ }
    setPlayingChild(false);
  }, [speechAvailable, playingChild, childGlyph]);

  return (
    <ExerciseLayout>
      {/* Badge */}
      <p className="text-xs uppercase tracking-widest text-sand-dim/70 font-medium">
        Parent–Child Comparison
      </p>

      {/* Side-by-side glyphs */}
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Parent (ghost) */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/4 border border-white/10"
          >
            <span
              className="font-kannada text-white/25 select-none block"
              style={{ fontSize: "4.5rem", lineHeight: 1, transform: "translateY(0.5rem)" }}
            >
              {parentGlyph}
            </span>
          </motion.div>
          <p className="text-sm text-sand-dim/60 font-medium">
            {parentChar?.romanization ?? ""}
          </p>
          {speechAvailable && (
            <button
              onClick={handlePlayParent}
              disabled={playingParent}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                playingParent
                  ? "bg-white/10 border-white/20 text-sand"
                  : "bg-white/5 border-white/10 text-sand-dim hover:bg-white/10 hover:text-sand"
              }`}
            >
              {playingParent ? "Playing…" : `🔊 ${parentChar?.romanization ?? ""}`}
            </button>
          )}
        </div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-saffron/50 text-2xl select-none"
        >
          →
        </motion.div>

        {/* Child (highlighted) */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-saffron/8 border border-saffron/25 shadow-[0_0_30px_rgba(241,178,74,0.1)]"
          >
            <span
              className="font-kannada text-saffron text-glow-saffron select-none block"
              style={{ fontSize: "4.5rem", lineHeight: 1, transform: "translateY(0.5rem)" }}
            >
              {childGlyph}
            </span>
          </motion.div>
          <p className="text-sm text-saffron font-semibold">
            {childChar?.romanization ?? exercise.correctAnswer}
          </p>
          {speechAvailable && (
            <button
              onClick={handlePlayChild}
              disabled={playingChild}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                playingChild
                  ? "bg-saffron/15 border-saffron/30 text-saffron"
                  : "bg-white/5 border-white/10 text-sand-dim hover:bg-saffron/10 hover:border-saffron/30 hover:text-saffron"
              }`}
            >
              {playingChild ? "Playing…" : `🔊 ${childChar?.romanization ?? exercise.correctAnswer}`}
            </button>
          )}
        </div>
      </div>

      {/* Delta explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={step === "reveal" ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-sm text-center px-4 py-3 rounded-xl bg-white/4 border border-white/8"
      >
        <p className="text-sm text-sand leading-relaxed">
          <span className="font-kannada text-saffron text-base">{childGlyph}</span>
          {" is "}
          <span className="font-kannada text-white/50 text-base">{parentGlyph}</span>
          {" with: "}
          <span className="text-saffron font-medium">{deltaText}</span>
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="px-10 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(241,178,74,0.3)] hover:shadow-[0_0_32px_rgba(241,178,74,0.45)] transition-all"
      >
        Got it
      </motion.button>
    </ExerciseLayout>
  );
}
