"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types";
import { checkAnswer } from "@/lib/engine";
import { speak } from "@/lib/speech";
import GlassCard from "../ui/GlassCard";
import ExerciseLayout from "./ExerciseLayout";
import CenteredGlyph from "../ui/CenteredGlyph";

interface TranslateMatchProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function TranslateMatch({
  exercise,
  onAnswer,
  onNext,
  feedbackState,
}: TranslateMatchProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isKannadaToEnglish = exercise.translateDirection === "kannada-to-english";

  const handleSpeak = async () => {
    if (isSpeaking) return;
    const textToSpeak = isKannadaToEnglish ? exercise.prompt : exercise.correctAnswer;
    setIsSpeaking(true);
    try {
      await speak(textToSpeak);
    } catch {
      // Speech unavailable — fail silently
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSelect = (option: string, eventTimeStamp: number) => {
    if (feedbackState !== "idle") return;
    setSelected(option);
    const correct = checkAnswer(exercise, option);
    const eventEpochMs = performance.timeOrigin + eventTimeStamp;
    const elapsedMs = Math.round(Math.max(0, eventEpochMs - (exercise.createdAtMs ?? eventEpochMs)));
    onAnswer(correct, option, elapsedMs);

    // If correct on english-to-kannada, play the Kannada word audio
    if (correct && !isKannadaToEnglish) {
      void speak(exercise.correctAnswer).catch(() => {});
    }
  };

  const handleContinue = () => {
    setSelected(null);
    onNext();
  };

  // Keyboard shortcuts (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedbackState !== "idle") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleContinue();
        }
        return;
      }

      const key = e.key.toLowerCase();
      let index = -1;

      if (["1", "2", "3", "4"].includes(key)) {
        index = parseInt(key, 10) - 1;
      } else if (["a", "b", "c", "d"].includes(key)) {
        index = ["a", "b", "c", "d"].indexOf(key);
      }

      if (index >= 0 && exercise.options && index < exercise.options.length) {
        e.preventDefault();
        handleSelect(exercise.options[index], e.timeStamp);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedbackState, exercise.options]);

  return (
    <ExerciseLayout>
      {/* Direction badge */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-widest text-sand-dim/70 font-medium">
          {isKannadaToEnglish ? "Kannada → English" : "English → Kannada"}
        </span>
      </div>

      {/* Prompt card */}
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mb-2"
      >
        <div
          className={`relative flex items-center justify-center gap-3 w-full max-w-xs min-h-[80px] rounded-2xl px-6 py-4 border
            ${feedbackState === "correct" ? "border-correct/30 bg-correct/8" : ""}
            ${feedbackState === "incorrect" ? "border-incorrect/30 bg-incorrect/8" : ""}
            ${feedbackState === "idle" ? "border-saffron/20 bg-saffron/5" : ""}
            transition-colors duration-300
          `}
        >
          {isKannadaToEnglish ? (
            <>
              <CenteredGlyph
                glyph={exercise.prompt}
                className={`font-kannada text-5xl select-none block
                  ${feedbackState === "correct" ? "text-correct" : ""}
                  ${feedbackState === "incorrect" ? "text-incorrect" : ""}
                  ${feedbackState === "idle" ? "text-saffron" : ""}
                  transition-colors duration-300
                `}
              />
              <button
                onClick={handleSpeak}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200
                  ${isSpeaking
                    ? "border-saffron/60 bg-saffron/15 text-saffron scale-95"
                    : "border-white/15 bg-white/5 text-sand-dim hover:border-saffron/40 hover:text-saffron hover:bg-saffron/10"
                  }`}
                title="Hear pronunciation"
              >
                {isSpeaking ? (
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 0 1 0 7.072M12 6v12m-3.536-9.536a5 5 0 0 0 0 7.072" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <span className="text-2xl font-semibold text-sand text-center leading-snug">
              {exercise.prompt}
            </span>
          )}
        </div>

        <p className="text-xs text-sand-dim/60">
          {isKannadaToEnglish ? "What does this word mean?" : "Which Kannada script is correct?"}
        </p>
      </motion.div>

      {/* Answer options */}
      <div className={`grid gap-3 w-full max-w-sm ${
        exercise.options && exercise.options.length <= 2 ? "grid-cols-1" : "grid-cols-2"
      }`}>
        {exercise.options?.map((option, idx) => {
          const isSelected = selected === option;
          const isCorrect = feedbackState !== "idle" && checkAnswer(exercise, option);
          const isWrong = feedbackState === "incorrect" && isSelected && !isCorrect;

          return (
            <GlassCard
              key={option}
              hover={feedbackState === "idle"}
              className={`
                min-h-[72px] px-3 py-3 flex items-center justify-center text-center
                cursor-pointer select-none transition-all duration-300 relative
                ${isCorrect ? "!border-correct/40 !bg-correct/10 shadow-[0_0_18px_rgba(74,222,128,0.18)]" : ""}
                ${isWrong ? "!border-incorrect/40 !bg-incorrect/10 shadow-[0_0_18px_rgba(248,113,113,0.18)]" : ""}
                ${feedbackState === "idle" ? "hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]" : ""}
              `}
              onClick={(e) => handleSelect(option, e.timeStamp)}
              whileTap={feedbackState === "idle" ? { scale: 0.96 } : {}}
              animate={isWrong ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              transition={isWrong ? { duration: 0.35 } : {}}
            >
              <span className="absolute top-1.5 left-2 text-[10px] text-sand-dim/40 font-medium select-none">
                {OPTION_LABELS[idx]}
              </span>

              {/* Render Kannada glyphs large, English text normally */}
              {!isKannadaToEnglish && /[\u0C80-\u0CFF]/.test(option) ? (
                <CenteredGlyph
                  glyph={option}
                  className={`font-kannada text-2xl transition-colors duration-300 block
                    ${isCorrect ? "text-correct" : ""}
                    ${isWrong ? "text-incorrect" : ""}
                    ${!isCorrect && !isWrong ? "text-sand" : ""}
                  `}
                />
              ) : (
                <span className={`text-base font-medium leading-snug transition-colors duration-300
                  ${isCorrect ? "text-correct" : ""}
                  ${isWrong ? "text-incorrect" : ""}
                  ${!isCorrect && !isWrong ? "text-sand" : ""}
                `}>
                  {option}
                </span>
              )}

              {/* Checkmark / X overlay */}
              <AnimatePresence>
                {feedbackState !== "idle" && (isCorrect || isWrong) && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute top-1.5 right-2 text-sm font-bold
                      ${isCorrect ? "text-correct" : "text-incorrect"}
                    `}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </motion.span>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>

      {/* Hint / Continue */}
      <div className="w-full max-w-sm text-center min-h-[44px] mt-1">
        <AnimatePresence mode="wait">
          {feedbackState === "idle" ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-sand-dim/50"
            >
              {exercise.hintText}
            </motion.p>
          ) : (
            <motion.button
              key="continue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleContinue}
              className="px-8 py-3 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.3)] hover:shadow-[0_0_28px_rgba(241,178,74,0.5)] transition-all active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ExerciseLayout>
  );
}
