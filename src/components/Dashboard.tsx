"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/lib/curriculum";
import { clearState } from "@/lib/storage";
import { AppAction, AppState } from "@/types";
import { playAudioFX } from "@/lib/audioFX";
import GlassCard from "./ui/GlassCard";
import ProgressRing from "./ui/ProgressRing";
import CenteredGlyph from "./ui/CenteredGlyph";
import DictionaryModal from "./DictionaryModal";

interface DashboardProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onStartBrainWorkout: () => void;
}

// ── XP Rank System ──────────────────────────────────────────────
const RANKS = [
  { min: 0,    max: 100,  label: "Script Novice",      icon: "🌱", color: "from-emerald-600/40 to-emerald-500/20" },
  { min: 100,  max: 300,  label: "Glyph Gatherer",     icon: "📖", color: "from-sky-600/40 to-sky-500/20" },
  { min: 300,  max: 600,  label: "Syllable Apprentice", icon: "⚡", color: "from-yellow-600/40 to-yellow-500/20" },
  { min: 600,  max: 1000, label: "Word Weaver",         icon: "🔤", color: "from-orange-600/40 to-orange-500/20" },
  { min: 1000, max: 1500, label: "Sentence Scout",      icon: "🗺️", color: "from-rose-600/40 to-rose-500/20" },
  { min: 1500, max: 2200, label: "Kannada Explorer",    icon: "🌍", color: "from-purple-600/40 to-purple-500/20" },
  { min: 2200, max: 3000, label: "Script Scholar",      icon: "🏛️", color: "from-indigo-600/40 to-indigo-500/20" },
  { min: 3000, max: Infinity, label: "Fluent Decipherer", icon: "🔥", color: "from-saffron/40 to-saffron/20" },
];

function getRank(xp: number) {
  return RANKS.find((r) => xp >= r.min && xp < r.max) ?? RANKS[RANKS.length - 1];
}

// ── Animation variants ──────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard({ state, dispatch, onStartBrainWorkout }: DashboardProps) {
  const totalChars = LEVELS.flatMap((l) => l.characters).length;
  const masteredCount = state.masteredCharacters.length;
  const isFirstTimeUser = masteredCount === 0;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const fluentCount = Object.values(state.glyphResponseTimes || {}).filter((times) =>
    times.some((t) => t < 2000)
  ).length;
  const masteredWordsCount = Object.values(state.wordMastery || {}).filter((s) => s >= 80).length;

  const xp = state.xp ?? 0;
  const streak = state.streak ?? 0;
  const today = typeof window !== "undefined" ? new Date().toLocaleDateString("sv") : "";
  const isStreakActiveToday = state.lastPracticeDate === today;
  const claimedQuests = state.claimedQuests ?? {};

  // Has any mastered characters (brain workout available)
  const canBrainWorkout = masteredCount > 0;
  const canComprehension = masteredCount >= 5;

  const dueCount = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("sv");
    return state.masteredCharacters.filter((glyph) => {
      const reviewDate = state.nextReviewDates?.[glyph];
      return !reviewDate || reviewDate <= todayStr;
    }).length;
  }, [state.masteredCharacters, state.nextReviewDates]);

  const calendarDays = useMemo(() => {
    const days = [];
    const todayDate = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dStr = d.toLocaleDateString("sv");
      
      let isActive = false;
      if (streak > 0) {
        if (isStreakActiveToday) {
          isActive = i < streak;
        } else {
          isActive = i >= 1 && i <= streak;
        }
      }
      
      const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
      days.push({ dateStr: dStr, active: isActive, label });
    }
    return days;
  }, [streak, isStreakActiveToday]);

  // ── Rank ──
  const rank = getRank(xp);
  const nextRank = RANKS.find((r) => r.min > xp && r.min !== Infinity);
  const rankProgress = nextRank
    ? (xp - rank.min) / (nextRank.min - rank.min)
    : 1;

  // ── Quests ──
  const QUESTS = useMemo(() => [
    {
      id: "daily-warmup",
      label: "Daily Warm-Up",
      desc: "Get 10 correct answers today",
      icon: "🎯",
      reward: 50,
      progress: Math.min(state.dailyCorrect ?? 0, 10),
      target: 10,
      complete: (state.dailyCorrect ?? 0) >= 10,
    },
    {
      id: "speed-demon",
      label: "Speed Demon",
      desc: "Answer 3 characters fluently today (< 2s)",
      icon: "⚡",
      reward: 50,
      progress: Math.min(state.dailyFluent ?? 0, 3),
      target: 3,
      complete: (state.dailyFluent ?? 0) >= 3,
    },
    {
      id: "session-explorer",
      label: "Session Explorer",
      desc: "Complete 2 practice sessions today",
      icon: "🧭",
      reward: 50,
      progress: Math.min(state.dailySessions ?? 0, 2),
      target: 2,
      complete: (state.dailySessions ?? 0) >= 2,
    },
  ], [state.dailyCorrect, state.dailyFluent, state.dailySessions]);

  const handleClaimQuest = (questId: string, reward: number) => {
    dispatch({ type: "CLAIM_QUEST", questId, xpReward: reward });
    void playAudioFX("quest-complete");
  };

  const handleReset = () => {
    clearState();
    dispatch({ type: "RESET" });
    setShowResetConfirm(false);
  };

  const handleToggleSound = () => {
    dispatch({ type: "TOGGLE_SOUND" });
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 max-w-6xl mx-auto">
      {/* ── Reset confirmation modal ── */}
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
                This will clear all mastered characters, XP, streaks, and scores. This action cannot be undone.
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

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8"
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

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between lg:justify-end">
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg text-sand-dim hover:text-saffron hover:bg-white/5 transition-colors"
              title={state.soundEnabled ? "Mute sound effects" : "Enable sound effects"}
            >
              {state.soundEnabled ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </button>

            {/* Dictionary */}
            <button
              onClick={() => setShowDictionary(true)}
              className="p-2 rounded-lg text-sand-dim hover:text-white hover:bg-white/5 transition-colors"
              title="Dictionary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </button>

            {/* Reset progress */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg text-sand-dim hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Reset progress"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-8 w-px bg-white/10" />

          {/* Stats cluster */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-sand-dim uppercase tracking-wider">Words</p>
              <p className="text-base sm:text-lg font-semibold text-saffron">{masteredWordsCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-sand-dim uppercase tracking-wider" title="Avg response < 2s">Fluent</p>
              <p className="text-base sm:text-lg font-semibold text-saffron">{fluentCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-sand-dim uppercase tracking-wider">Mastered</p>
              <p className="text-base sm:text-lg font-semibold text-saffron flex items-baseline gap-1">
                {masteredCount}
                <span className="text-sand-dim text-xs sm:text-sm font-normal">/{totalChars}</span>
              </p>
            </div>
            <ProgressRing
              progress={totalChars > 0 ? masteredCount / totalChars : 0}
              size={40}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </motion.header>

      {/* ── Gamification Top Row: XP + Streak + Brain Workout + Reading Arena ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {/* XP Rank Card */}
        <div className={`col-span-1 rounded-2xl border border-white/10 bg-gradient-to-br ${rank.color} p-5 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{rank.icon}</span>
            <div>
              <p className="text-xs text-sand-dim uppercase tracking-wider">Rank</p>
              <p className="text-base font-bold text-white leading-tight">{rank.label}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-sand-dim">Total XP</p>
              <p className="text-xl font-bold text-saffron">{xp.toLocaleString()}</p>
            </div>
          </div>
          {nextRank && (
            <div>
              <div className="flex justify-between text-[10px] text-sand-dim mb-1">
                <span>→ {nextRank.label}</span>
                <span>{nextRank.min - xp} XP to go</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-saffron"
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgress * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Streak Card */}
        <div className="col-span-1 rounded-2xl border border-white/10 bg-white/3 p-5 flex flex-col gap-2 justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-4xl select-none"
              animate={isStreakActiveToday ? {
                scale: [1, 1.15, 1],
                filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🔥
            </motion.span>
            <div>
              <p className="text-xs text-sand-dim uppercase tracking-wider">Daily Streak</p>
              <p className="text-3xl font-bold text-white">
                {streak}
                <span className="text-sm font-normal text-sand-dim ml-1">
                  {streak === 1 ? "day" : "days"}
                </span>
              </p>
            </div>
          </div>
          
          {/* Mini Calendar Grid */}
          <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-1">
            <span className="text-[9px] uppercase tracking-wider text-sand-dim/60 mb-1 block">Activity (Last 14 Days)</span>
            <div className="grid grid-cols-7 gap-1.5 self-center">
              {calendarDays.map((d, index) => (
                <div
                  key={d.dateStr}
                  title={`${d.dateStr}: ${d.active ? "Practiced" : "No practice"}`}
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[7px] font-bold select-none transition-all duration-300
                    ${d.active
                      ? "bg-saffron text-onyx shadow-[0_0_8px_rgba(241,178,74,0.35)]"
                      : "bg-white/10 text-sand-dim/30 border border-white/5"
                    }
                  `}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-sand-dim leading-relaxed border-t border-white/5 pt-2">
            {isStreakActiveToday
              ? "✅ Practiced today — streak is alive!"
              : streak > 0
                ? "⚠️ Practice today to keep your streak!"
                : "Practice daily to build a streak!"}
          </p>
        </div>

        {/* Brain Workout Card */}
        <div className="col-span-1 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-600/15 to-purple-600/10 p-5 flex flex-col gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <div className="flex-1">
              <p className="text-xs text-violet-300 uppercase tracking-wider font-medium">Daily Brain Workout</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">SRS Active Recall</p>
                {canBrainWorkout && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                    ${dueCount > 0
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-correct/10 text-correct border border-correct/20"
                    }
                  `}>
                    {dueCount > 0 ? `${dueCount} Due` : "Clear"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-sand-dim leading-relaxed flex-1">
            Targets your weakest characters and vocabulary across all levels using spaced repetition.
          </p>
          <button
            onClick={onStartBrainWorkout}
            disabled={!canBrainWorkout}
            className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95
              ${canBrainWorkout
                ? "bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]"
                : "bg-white/5 text-sand-dim/50 cursor-not-allowed"
              }`}
          >
            {canBrainWorkout ? "Start Workout →" : "Master characters first"}
          </button>
        </div>

        {/* AI Reading Comprehension Card */}
        <div className="col-span-1 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-600/15 to-saffron/10 p-5 flex flex-col gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <p className="text-xs text-amber-300 uppercase tracking-wider font-medium">AI Reading Arena</p>
              <p className="text-sm font-semibold text-white">Comprehension Challenge</p>
            </div>
          </div>
          <p className="text-xs text-sand-dim leading-relaxed flex-1">
            Read stories dynamically generated by Nemotron containing only characters you have mastered, and get graded feedback.
          </p>
          <button
            onClick={() => dispatch({ type: "START_COMPREHENSION" })}
            disabled={!canComprehension}
            className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95
              ${canComprehension
                ? "bg-saffron hover:opacity-90 text-onyx shadow-[0_0_20px_rgba(241,178,74,0.35)] hover:shadow-[0_0_28px_rgba(241,178,74,0.5)]"
                : "bg-white/5 text-sand-dim/50 cursor-not-allowed"
              }`}
          >
            {canComprehension ? "Enter Arena →" : "Master 5+ characters first"}
          </button>
        </div>
      </motion.div>

      {/* ── Today's Quests ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mb-8 rounded-2xl border border-white/10 bg-white/2 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📋</span>
          <p className="text-sm font-semibold text-white uppercase tracking-wider">Today&apos;s Quests</p>
          <p className="text-xs text-sand-dim ml-auto">Resets daily</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUESTS.map((quest) => {
            const claimed = claimedQuests[quest.id] ?? false;
            const canClaim = quest.complete && !claimed;
            const pct = (quest.progress / quest.target) * 100;

            return (
              <div
                key={quest.id}
                className={`rounded-xl border p-3 flex flex-col gap-2 transition-colors duration-300
                  ${claimed ? "border-correct/20 bg-correct/5" : "border-white/8 bg-white/3"}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{quest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{quest.label}</p>
                    <p className="text-[10px] text-sand-dim truncate">{quest.desc}</p>
                  </div>
                  {claimed && (
                    <span className="text-correct text-sm font-bold shrink-0">✓</span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${claimed ? "bg-correct" : "bg-saffron"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${claimed ? 100 : pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-sand-dim">
                    {claimed ? "Claimed!" : `${quest.progress}/${quest.target}`}
                  </span>
                  <button
                    onClick={() => handleClaimQuest(quest.id, quest.reward)}
                    disabled={!canClaim}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all
                      ${canClaim
                        ? "bg-saffron text-onyx hover:bg-saffron/80 active:scale-95 shadow-[0_0_10px_rgba(241,178,74,0.3)]"
                        : "bg-white/5 text-sand-dim/40 cursor-not-allowed"
                      }`}
                  >
                    {claimed ? "Done" : `Claim +${quest.reward} XP`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Level Grid ── */}
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
                  unlocked && dispatch({ type: "SELECT_LEVEL", level: level.id })
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
                <p className="font-kannada text-saffron text-sm mb-2">{level.kannadaName}</p>
                <p className="text-xs text-sand-dim leading-relaxed">{level.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {level.characters.slice(0, 8).map((c) => (
                    <span
                      key={c.glyph}
                      className={`flex items-center justify-center w-8 h-8 rounded ${
                        state.masteredCharacters.includes(c.glyph)
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
                      <svg className="w-5 h-5 text-sand-dim/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-xs text-sand-dim/50">
          Kali by Akshara Ganapathi
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
