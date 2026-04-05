"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AppState, ExercisePhase } from "@/types";

interface ExerciseShellProps {
  state: AppState;
  onBack: () => void;
  children: React.ReactNode;
}

const PHASE_LABELS: Record<ExercisePhase, { label: string; icon: string; toast: string }> = {
  [ExercisePhase.Learn]:         { label: "Learn",    icon: "🌱", toast: "Meet your new character" },
  [ExercisePhase.Visual]:        { label: "Identify", icon: "👁",  toast: "Can you identify it?" },
  [ExercisePhase.Audio]:         { label: "Listen",   icon: "🔊", toast: "Train your ear" },
  [ExercisePhase.MinimalPair]:   { label: "Contrast", icon: "⚖",  toast: "Spot the difference" },
  [ExercisePhase.Scramble]:      { label: "Build",    icon: "🧩", toast: "Assemble the word" },
  [ExercisePhase.Phonetic]:      { label: "Decode",   icon: "⌨",  toast: "Now type what you know" },
  [ExercisePhase.VdtCompare]:    { label: "Compare",  icon: "🔍", toast: "Spot the difference" },
  [ExercisePhase.GhostBase]:     { label: "Signs",    icon: "✨", toast: "See the base" },
};

export default function ExerciseShell({
  state,
  onBack,
  children,
}: ExerciseShellProps) {
  const { exerciseIndex, exercises, exercisePhase, score, glyphStreaks } = state;
  const total = exercises.length;
  const phaseInfo = PHASE_LABELS[exercisePhase] ?? { label: exercisePhase, icon: "", toast: "" };

  // Animate phase toast when phase key changes (but not on first exercise).
  const shouldShowPhaseToast = exerciseIndex > 0;

  // ── Per-character streak indicator (phonetic phase only) ─
  const currentExercise = exercises[exerciseIndex];
  const targetGlyph = currentExercise?.targetGlyph;
  const streak = targetGlyph ? (glyphStreaks[targetGlyph] ?? 0) : 0;
  const showStreak = exercisePhase === "phonetic" && !!targetGlyph;

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
          <span className="text-sm">{phaseInfo.icon}</span>
          <span className="text-xs font-medium text-sand uppercase tracking-wider">
            {phaseInfo.label}
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
      <div className="h-1 rounded-full bg-white/5 mb-7 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-saffron"
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? ((exerciseIndex + 1) / total) * 100 : 0}%` }}
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

      {/* ── Exercise content ── */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
