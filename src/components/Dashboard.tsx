"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/lib/curriculum";
import { clearState } from "@/lib/storage";
import { AppState, AppAction } from "@/types";
import GlassCard from "./ui/GlassCard";
import ProgressRing from "./ui/ProgressRing";
import Logo from "./Logo";

interface DashboardProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard({ state, dispatch }: DashboardProps) {
  const totalChars = LEVELS.flatMap((l) => l.characters).length;
  const masteredCount = state.masteredCharacters.length;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    clearState();
    dispatch({ type: "RESET" });
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-4xl mx-auto">
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-2">Reset All Progress?</h3>
              <p className="text-sm text-sand-dim mb-6">
                This will clear all mastered characters, unlock status, and scores. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sand text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <div className="flex items-center gap-3">
          <Logo size={44} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Kali{" "}
              <span className="font-kannada text-saffron text-lg">ಕಲಿ</span>
            </h1>
            <p className="text-xs text-sand-dim">Learn Kannada Script</p>
          </div>
        </div>

        {/* Stats + Reset */}
        <div className="flex items-center gap-4">
          {/* Reset button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-lg text-sand-dim hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Reset progress"
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
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182"
              />
            </svg>
          </button>
          <div className="text-right">
            <p className="text-xs text-sand-dim uppercase tracking-wider">
              Mastered
            </p>
            <p className="text-lg font-semibold text-saffron">
              {masteredCount}
              <span className="text-sand-dim text-sm font-normal">
                /{totalChars}
              </span>
            </p>
          </div>
          <ProgressRing
            progress={totalChars > 0 ? masteredCount / totalChars : 0}
            size={48}
            strokeWidth={3}
          />
        </div>
      </motion.header>

      {/* Level Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {LEVELS.map((level) => {
          const unlocked = state.unlockedLevels.includes(level.id);
          const charCount = level.characters.length;
          const masteredInLevel = level.characters.filter((c) =>
            state.masteredCharacters.includes(c.glyph)
          ).length;
          const progress = charCount > 0 ? masteredInLevel / charCount : 0;
          const isComplete = progress >= 1;

          return (
            <motion.div key={level.id} variants={item}>
              <GlassCard
                hover={unlocked}
                className={`p-5 relative overflow-hidden ${
                  !unlocked ? "opacity-40 pointer-events-none" : ""
                }`}
                whileHover={unlocked ? { scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() =>
                  unlocked &&
                  dispatch({ type: "SELECT_LEVEL", level: level.id })
                }
              >
                {/* Level badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium uppercase tracking-widest ${
                      isComplete ? "text-correct" : "text-sand-dim"
                    }`}
                  >
                    Level {level.id}
                  </span>
                  <ProgressRing progress={progress} size={36} strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h2 className="text-base font-semibold mb-0.5">{level.name}</h2>
                <p className="font-kannada text-saffron text-sm mb-2">
                  {level.kannadaName}
                </p>
                <p className="text-xs text-sand-dim leading-relaxed">
                  {level.description}
                </p>

                {/* Character preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {level.characters.slice(0, 8).map((c) => (
                    <span
                      key={c.glyph}
                      className={`font-kannada text-sm px-1.5 py-0.5 rounded ${
                        state.masteredCharacters.includes(c.glyph)
                          ? "text-saffron bg-saffron/10"
                          : "text-sand-dim bg-white/5"
                      }`}
                    >
                      {c.context ?? c.glyph}
                    </span>
                  ))}
                  {level.characters.length > 8 && (
                    <span className="text-sand-dim text-xs self-center ml-1">
                      +{level.characters.length - 8}
                    </span>
                  )}
                </div>

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-onyx/60 rounded-2xl">
                    <svg
                      className="w-6 h-6 text-sand-dim"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </div>
                )}

                {/* Completion badge */}
                {isComplete && (
                  <div className="absolute top-3 right-3">
                    <span className="text-correct text-xs font-medium">✓</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-xs text-sand-dim/50">
          Kali — Scaffolded Kannada Script Deciphering
        </p>
      </motion.footer>
    </div>
  );
}
