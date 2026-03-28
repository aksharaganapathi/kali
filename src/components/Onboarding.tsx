"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: "ಕ",
    isKannada: true,
    title: "Read Kannada, don't memorize it",
    body: "Kali teaches you to decode Kannada script by mapping visual shapes to sounds you already know — the same way you learned to read your first language.",
  },
  {
    icon: "→",
    isKannada: false,
    title: "Each character follows a simple loop",
    body: "See it → match its sound → type it. Each character is introduced one at a time, gradually moving from recognition to recall to fluency.",
    steps: ["🌱 Learn", "👁 Identify", "🔊 Listen", "⌨ Type"],
  },
  {
    icon: "1",
    isKannada: false,
    title: "Start with vowels — they unlock everything",
    body: "Level 1 teaches the 13 foundational vowel sounds. Every other character in the script builds on these. Let's begin.",
    cta: true,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/95 backdrop-blur-md px-4"
    >
      <motion.div
        key={slide}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-saffron/10 border border-saffron/25 flex items-center justify-center mb-8">
          {current.isKannada ? (
            <span className="font-kannada text-4xl text-saffron">{current.icon}</span>
          ) : (
            <span className="text-3xl font-bold text-saffron">{current.icon}</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-3 leading-snug">
          {current.title}
        </h2>

        {/* Body */}
        <p className="text-sm text-sand-dim leading-relaxed mb-6">
          {current.body}
        </p>

        {/* Exercise-phase pills (slide 2 only) */}
        {current.steps && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {current.steps.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sand"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Dots */}
        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-saffron" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 w-full">
          {slide > 0 && (
            <button
              onClick={() => setSlide((s) => s - 1)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sand text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setSlide((s) => s + 1);
              }
            }}
            className="flex-1 px-6 py-2.5 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_28px_rgba(241,178,74,0.45)] transition-all"
          >
            {isLast ? "Start Learning" : "Next"}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={onComplete}
          className="mt-4 text-xs text-sand-dim/50 hover:text-sand-dim transition-colors"
        >
          Skip introduction
        </button>
      </motion.div>
    </motion.div>
  );
}
