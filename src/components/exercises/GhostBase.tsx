"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { isSpeechAvailable, speak } from "@/lib/speech";
import { CHAR_MAP } from "@/lib/curriculum";
import ExerciseLayout from "./ExerciseLayout";

interface GhostBaseProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

/**
 * Ghost Base exercise: shows a vowel sign attached to a consonant,
 * with the consonant rendered as a faint "ghost" behind the composite
 * glyph. Then cycles through multiple bases to prove the sign's shape
 * is consistent.
 */
export default function GhostBase({ exercise, onNext }: GhostBaseProps) {
  const speechAvailable = isSpeechAvailable();
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const autoPlayed = useRef(false);

  // The vowel sign glyph and its base consonant context
  const targetGlyph = exercise.targetGlyph ?? "";
  const signChar = CHAR_MAP.get(targetGlyph);
  const ghostBases: string[] = signChar?.ghostBases ?? ["ಕ"];
  const contextGlyph = exercise.prompt; // e.g. "ಕಾ"
  const baseConsonant = ghostBases[0] ?? "ಕ";

  // Build slideshow composites: vowel sign applied to each ghost base
  const composites = ghostBases.map((base) => base + targetGlyph);

  // Auto-play audio on mount
  useEffect(() => {
    if (!speechAvailable || autoPlayed.current) return;
    autoPlayed.current = true;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setIsPlaying(true);
      try { await speak(contextGlyph); } catch { /* silent */ }
      if (!cancelled) setIsPlaying(false);
    };
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  // Auto-advance slideshow
  useEffect(() => {
    if (!showSlideshow) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        if (prev + 1 >= composites.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [showSlideshow, composites.length]);

  const handlePlay = async () => {
    if (!speechAvailable || isPlaying) return;
    setIsPlaying(true);
    try {
      const target = showSlideshow ? composites[slideIndex] : contextGlyph;
      await speak(target);
    } catch { /* silent */ }
    setIsPlaying(false);
  };

  const handleGotFirst = () => {
    setShowSlideshow(true);
    setSlideIndex(0);
  };

  return (
    <ExerciseLayout>
      {/* Badge */}
      <p className="text-xs uppercase tracking-widest text-sand-dim/70 font-medium">
        {showSlideshow ? "Same sign, different base" : "New Vowel Sign"}
      </p>

      <AnimatePresence mode="wait">
        {!showSlideshow ? (
          /* ─── Phase 1: Ghost Base overlay ─── */
          <motion.div
            key="ghost-phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Ghost overlay glyph */}
            <div className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-saffron/6 border border-saffron/20 shadow-[0_0_40px_rgba(241,178,74,0.06)]">
              {/* Ghost: bare consonant */}
              <span
                className="font-kannada text-white/15 select-none absolute"
                style={{ fontSize: "5rem", lineHeight: 1, transform: "translateY(0.6rem)" }}
              >
                {baseConsonant}
              </span>
              {/* Full composite on top */}
              <span
                className="font-kannada text-saffron text-glow-saffron select-none relative"
                style={{ fontSize: "5rem", lineHeight: 1, transform: "translateY(0.6rem)" }}
              >
                {contextGlyph}
              </span>
            </div>

            {/* Romanization */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-white tracking-wide">
                {exercise.correctAnswer}
              </p>
              <p className="text-xs text-sand-dim/60 mt-1">
                <span className="font-kannada text-white/40">{baseConsonant}</span>
                {" + vowel sign "}
                <span className="text-saffron font-medium">
                  {signChar?.romanization ?? ""}
                </span>
                {" → "}
                <span className="font-kannada text-saffron">{contextGlyph}</span>
              </p>
            </div>

            {/* Audio button */}
            {speechAvailable && (
              <button
                aria-label="Play audio"
                onClick={handlePlay}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                  isPlaying
                    ? "bg-saffron/15 border-saffron/30 text-saffron"
                    : "bg-white/5 border-white/15 text-sand-dim hover:bg-white/10 hover:text-sand"
                }`}
              >
                <span>{isPlaying ? "🔊 Playing…" : "🔊 Hear it"}</span>
              </button>
            )}

            {/* CTA to slideshow */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGotFirst}
              className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium text-sm border border-white/20 hover:bg-white/15 transition-all"
            >
              See it on other consonants →
            </motion.button>
          </motion.div>
        ) : (
          /* ─── Phase 2: Multi-base slideshow ─── */
          <motion.div
            key="slideshow-phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Animated composite glyph */}
            <div className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-saffron/6 border border-saffron/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {/* Ghost base */}
                  <span
                    className="font-kannada text-white/15 select-none absolute"
                    style={{ fontSize: "5rem", lineHeight: 1, transform: "translateY(0.6rem)" }}
                  >
                    {ghostBases[slideIndex]}
                  </span>
                  {/* Composite */}
                  <span
                    className="font-kannada text-saffron text-glow-saffron select-none relative"
                    style={{ fontSize: "5rem", lineHeight: 1, transform: "translateY(0.6rem)" }}
                  >
                    {composites[slideIndex]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2">
              {composites.map((comp, idx) => (
                <button
                  key={comp}
                  onClick={() => setSlideIndex(idx)}
                  className={`font-kannada text-sm px-2 py-0.5 rounded transition-all ${
                    idx === slideIndex
                      ? "text-saffron bg-saffron/15 border border-saffron/30"
                      : idx <= slideIndex
                      ? "text-sand-dim/80 bg-white/5 border border-white/10"
                      : "text-sand-dim/30 bg-white/3 border border-white/5"
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>

            {/* Explanation */}
            <p className="text-xs text-sand-dim text-center max-w-xs">
              The <span className="text-saffron font-medium">{signChar?.romanization ?? ""}</span> sign
              looks the same on every consonant — only the base changes.
            </p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: slideIndex >= composites.length - 1 ? 1 : 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="px-10 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(241,178,74,0.3)] hover:shadow-[0_0_32px_rgba(241,178,74,0.45)] transition-all"
            >
              Got it
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ExerciseLayout>
  );
}
