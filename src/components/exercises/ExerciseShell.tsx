"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, ExercisePhase } from "@/types";
import { playAudioFX } from "@/lib/audioFX";

interface ExerciseShellProps {
  state: AppState;
  onBack: () => void;
  children: React.ReactNode;
}

const PHASE_LABELS: Record<ExercisePhase, { label: string; icon: string; toast: string }> = {
  [ExercisePhase.Learn]:         { label: "Learn",     icon: "🌱", toast: "Meet your new character" },
  [ExercisePhase.Visual]:        { label: "Identify",  icon: "👁",  toast: "Can you identify it?" },
  [ExercisePhase.Audio]:         { label: "Listen",    icon: "🔊", toast: "Train your ear" },
  [ExercisePhase.MinimalPair]:   { label: "Contrast",  icon: "⚖",  toast: "Spot the difference" },
  [ExercisePhase.Scramble]:      { label: "Build",     icon: "🧩", toast: "Assemble the word" },
  [ExercisePhase.Phonetic]:      { label: "Decode",    icon: "⌨",  toast: "Now type what you know" },
  [ExercisePhase.VdtCompare]:    { label: "Compare",   icon: "🔍", toast: "Spot the difference" },
  [ExercisePhase.GhostBase]:     { label: "Signs",     icon: "✨", toast: "See the base" },
  [ExercisePhase.Translate]:     { label: "Translate", icon: "🌐", toast: "Connect script to meaning" },
  [ExercisePhase.ReverseRecall]: { label: "Recall",    icon: "🧠", toast: "Recall the glyph shape" },
  [ExercisePhase.ContextFill]:   { label: "Context",   icon: "✍",  toast: "Fill in the blank" },
};

// Particle config for correct-answer burst
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 55 + (i % 3) * 22;
  return {
    id: i,
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    color: i % 3 === 0 ? "#F1B24A" : i % 3 === 1 ? "#4ADE80" : "#818CF8",
    delay: (i % 5) * 0.04,
  };
});

export default function ExerciseShell({
  state,
  onBack,
  children,
}: ExerciseShellProps) {
  const { exerciseIndex, exercises, exercisePhase, score, glyphStreaks, feedbackState, isBrainWorkout } = state;
  const total = exercises.length;
  const phaseInfo = PHASE_LABELS[exercisePhase] ?? { label: exercisePhase, icon: "", toast: "" };

  const shouldShowPhaseToast = exerciseIndex > 0;

  const currentExercise = exercises[exerciseIndex];
  const targetGlyph = currentExercise?.targetGlyph;
  const streak = targetGlyph ? (glyphStreaks[targetGlyph] ?? 0) : 0;
  const showStreak = exercisePhase === "phonetic" && !!targetGlyph;

  const [showParticles, setShowParticles] = useState(false);

  // Play sound FX and trigger particle burst on feedback change
  useEffect(() => {
    if (feedbackState === "correct") {
      void playAudioFX("correct");
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 900);
      return () => clearTimeout(t);
    } else if (feedbackState === "incorrect") {
      void playAudioFX("incorrect");
    }
  }, [feedbackState]);

  const progress = total > 0 ? ((exerciseIndex + 1) / total) * 100 : 0;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8 max-w-2xl mx-auto flex flex-col">
      {/* ── Header row ── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-5">
        <div className="justify-self-start">
          <button
            onClick={onBack}
            className="text-sand-dim text-sm flex items-center gap-1 hover:text-sand transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Exit
          </button>
        </div>

        <motion.div
          key={exercisePhase}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="justify-self-center flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10"
        >
          {isBrainWorkout && (
            <span className="text-xs mr-0.5">🧠</span>
          )}
          <span className="text-sm">{phaseInfo.icon}</span>
          <span className="text-xs font-medium text-sand uppercase tracking-wider">
            {isBrainWorkout ? "Brain Workout" : phaseInfo.label}
          </span>
        </motion.div>

        <div className="justify-self-end flex items-center gap-2">
          {/* Per-character streak dots (phonetic only) */}
          <AnimatePresence>
            {showStreak && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-1 items-center"
                title={`Phonetic streak: ${streak}/3`}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      i < streak ? "bg-saffron" : "bg-white/15"
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-xs text-sand-dim">
            {score.correct}/{score.total}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1.5 rounded-full bg-white/5 mb-7 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${
            isBrainWorkout ? "bg-violet-400" : "bg-saffron"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* ── Phase transition toast ── */}
      <AnimatePresence>
        {shouldShowPhaseToast && (
          <motion.div
            key={exercisePhase + "-toast"}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-12, 0, 0, -8] }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1.6, times: [0, 0.15, 0.75, 1] }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-onyx-lighter border border-white/15 shadow-lg"
          >
            <span className="text-xs text-sand font-medium">
              {phaseInfo.icon} {phaseInfo.toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Correct-answer particle burst ── */}
      <AnimatePresence>
        {showParticles && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{ background: p.color }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [1, 1, 0], x: p.x, y: p.y, scale: [0, 1, 0.4] }}
                transition={{ duration: 0.75, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Exercise content ── */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
