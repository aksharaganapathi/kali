"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/lib/curriculum";
import { clearState } from "@/lib/storage";
import { AppAction, AppState } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import GlassCard from "./ui/GlassCard";
import ProgressRing from "./ui/ProgressRing";
import CenteredGlyph from "./ui/CenteredGlyph";
import DictionaryModal from "./DictionaryModal";

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
  const isFirstTimeUser = masteredCount === 0;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const fluentCount = Object.values(state.glyphResponseTimes || {}).filter(times => times.some(t => t < 2000)).length;
  const masteredWordsCount = Object.values(state.wordMastery || {}).filter(score => score >= 80).length;
  const { theme, toggle: toggleTheme } = useTheme();

  const handleReset = () => {
    clearState();
    dispatch({ type: "RESET" });
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 max-w-6xl mx-auto">
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

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 items-center justify-center px-3 rounded-lg bg-saffron/10 border border-saffron/25 select-none">
              <CenteredGlyph
                glyph="ಕಲಿ"
                className="font-kannada text-saffron text-3xl leading-none text-glow-saffron drop-shadow-[0_0_15px_rgba(241,178,74,0.4)] block"
              />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none">Kali</h1>
          </div>
          <p className="text-sm text-sand-dim font-medium tracking-wide">Scaffolded script learning</p>
          <p className="text-xs text-sand-dim/80">
            {isFirstTimeUser ? "New here? Start with Level 1 → Vowels" : "Pick a level to continue where you left off"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-sand-dim hover:text-saffron hover:bg-white/5 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              /* Sun icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowDictionary(true)}
            className="p-2 rounded-lg text-sand-dim hover:text-white hover:bg-white/5 transition-colors"
            title="Dictionary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </button>
          {/* Reset button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-lg text-sand-dim hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Reset progress"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182" />
            </svg>
          </button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-sand-dim uppercase tracking-wider">Words</p>
              <p className="text-lg font-semibold text-saffron">{masteredWordsCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-sand-dim uppercase tracking-wider" title="Avg response < 2s">Fluent</p>
              <p className="text-lg font-semibold text-saffron">{fluentCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-sand-dim uppercase tracking-wider">
                Mastered
              </p>
              <p className="text-lg font-semibold text-saffron flex items-baseline gap-1">
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
        </div>
      </motion.header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {LEVELS.map((level) => {
          const unlocked = state.unlockedLevels.includes(level.id);
          const charCount = level.characters.length;
          const masteredInLevel = level.characters.filter((c) =>
            state.masteredCharacters.includes(c.glyph)
          ).length;
          const progress = charCount > 0 ? masteredInLevel / charCount : 0;
          const isComplete = progress >= 1;
          const actionLabel = unlocked
            ? isComplete
              ? "Review"
              : masteredInLevel > 0
              ? "Continue"
              : "Start"
            : "Locked";

          const isStartHere = isFirstTimeUser && level.id === 1;

          return (
            <motion.div key={level.id} variants={item}>
              <GlassCard
                hover={unlocked}
                className={`p-5 relative overflow-hidden transition-all duration-500 ${
                  isStartHere
                    ? "border-saffron/40 shadow-[0_0_20px_rgba(241,178,74,0.12)] hover:border-saffron/60"
                    : unlocked
                    ? "hover:shadow-[0_0_30px_rgba(241,178,74,0.1)] hover:border-saffron/30"
                    : "opacity-40 pointer-events-none"
                }`}
                whileHover={unlocked ? { scale: 1.02, y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() =>
                  unlocked &&
                  dispatch({ type: "SELECT_LEVEL", level: level.id })
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium uppercase tracking-widest ${isComplete ? "text-correct" : "text-sand-dim"}`}
                    >
                      Level {level.id}
                    </span>
                    {isStartHere && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-saffron/20 text-saffron font-semibold uppercase tracking-wider">
                        Start here
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center justify-center">
                    <ProgressRing progress={progress} size={36} strokeWidth={2.5} />
                    {isComplete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-correct text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-base font-semibold mb-0.5">{level.name}</h2>
                <p className="font-kannada text-saffron text-sm mb-2">
                  {level.kannadaName}
                </p>
                <p className="text-xs text-sand-dim leading-relaxed">
                  {level.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {level.characters.slice(0, 8).map((c) => (
                    <span
                      key={c.glyph}
                      className={`flex items-center justify-center w-8 h-8 rounded ${state.masteredCharacters.includes(c.glyph)
                          ? "text-saffron bg-saffron/10"
                          : "text-sand-dim bg-white/5"
                        }`}
                    >
                      <CenteredGlyph glyph={c.context ?? c.glyph} className="font-kannada text-sm leading-none block" />
                    </span>
                  ))}
                  {level.characters.length > 8 && (
                    <span className="text-sand-dim text-xs self-center ml-1">
                      +{level.characters.length - 8}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wider text-sand-dim">
                    {masteredInLevel}/{charCount} mastered
                  </p>
                  <p
                    className={`text-[11px] uppercase tracking-wider ${
                      unlocked ? "text-saffron" : "text-sand-dim/60"
                    }`}
                  >
                    {actionLabel}
                  </p>
                </div>

                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-onyx/80 backdrop-blur-[2px] rounded-2xl transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                       <svg
                         className="w-5 h-5 text-sand-dim/70"
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
                    <span className="text-[10px] uppercase tracking-widest text-sand-dim/60 font-medium">Locked</span>
                  </div>
                )}


              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

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

      <AnimatePresence>
        {showDictionary && (
          <DictionaryModal state={state} onClose={() => setShowDictionary(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
