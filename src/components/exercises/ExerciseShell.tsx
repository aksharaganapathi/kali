"use client";

import { motion } from "framer-motion";
import { AppState } from "@/types";

interface ExerciseShellProps {
  state: AppState;
  onBack: () => void;
  children: React.ReactNode;
}

const PHASE_LABELS: Record<string, { label: string; icon: string }> = {
  visual: { label: "Identify", icon: "👁" },
  audio: { label: "Listen", icon: "🔊" },
  "minimal-pair": { label: "Contrast", icon: "⚖" },
  scramble: { label: "Build", icon: "🧩" },
  phonetic: { label: "Decode", icon: "⌨" },
  "guided-decode": { label: "Guided", icon: "🧭" },
  "word-meaning": { label: "Translate", icon: "📖" },
};

export default function ExerciseShell({
  state,
  onBack,
  children,
}: ExerciseShellProps) {
  const { exerciseIndex, exercises, exercisePhase, score } = state;
  const total = exercises.length;
  const phaseInfo = PHASE_LABELS[exercisePhase] ?? {
    label: exercisePhase,
    icon: "",
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8 max-w-2xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sand-dim text-sm flex items-center gap-1 hover:text-sand transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Exit
        </button>

        <motion.div
          key={exercisePhase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10"
        >
          <span className="text-sm">{phaseInfo.icon}</span>
          <span className="text-xs font-medium text-sand uppercase tracking-wider">
            {phaseInfo.label}
          </span>
        </motion.div>

        <div className="text-right">
          <span className="text-xs text-sand-dim">
            {score.correct}/{score.total}
          </span>
        </div>
      </div>

      <div className="h-1 rounded-full bg-white/5 mb-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-saffron"
          initial={{ width: 0 }}
          animate={{
            width: `${total > 0 ? ((exerciseIndex + 1) / total) * 100 : 0}%`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-center gap-1.5 mb-8">
        {exercises.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < exerciseIndex
                ? "bg-saffron"
                : i === exerciseIndex
                ? "bg-saffron/60"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
