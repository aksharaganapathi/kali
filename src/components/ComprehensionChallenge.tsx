"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppAction } from "@/types";
import GlassCard from "./ui/GlassCard";

interface EvaluationDetail {
  item: string;
  correct: boolean;
}

interface GradingResult {
  rating: "excellent" | "good" | "partial" | "incorrect";
  score: number;
  feedback: string;
  details: EvaluationDetail[];
}

interface ComprehensionChallengeProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function ComprehensionChallenge({ state, dispatch }: ComprehensionChallengeProps) {
  const [passage, setPassage] = useState("");
  const [correctTranslation, setCorrectTranslation] = useState("");
  const [romanization, setRomanization] = useState("");
  const [userTranslation, setUserTranslation] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradingResult | null>(null);

  const fetchPassage = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUserTranslation("");
    setPassage("");

    try {
      const response = await fetch("/api/comprehension/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masteredCharacters: state.masteredCharacters,
          levelId: state.currentLevel,
        }),
      });

      if (!response.ok) {
        const errData = await response.json() as { error?: string };
        throw new Error(errData.error || "Failed to generate passage.");
      }

      const data = await response.json() as {
        kannada: string;
        english: string;
        romanization: string;
      };

      setPassage(data.kannada);
      setCorrectTranslation(data.english);
      setRomanization(data.romanization);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPassage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTranslation.trim() || grading) return;

    setGrading(true);
    setError(null);

    try {
      const response = await fetch("/api/comprehension/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage,
          correctTranslation,
          userTranslation,
        }),
      });

      if (!response.ok) {
        const errData = await response.json() as { error?: string };
        throw new Error(errData.error || "Failed to grade translation.");
      }

      const data = await response.json() as GradingResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while grading.");
    } finally {
      setGrading(false);
    }
  };

  const handleFinish = () => {
    // Award XP based on rating: excellent: 40 XP, good: 30 XP, partial: 15 XP, incorrect: 5 XP
    let xp = 5;
    if (result) {
      if (result.rating === "excellent") xp = 40;
      else if (result.rating === "good") xp = 30;
      else if (result.rating === "partial") xp = 15;
    }
    dispatch({ type: "COMPLETE_COMPREHENSION", xpReward: xp });
  };

  // Color mappings for UI badges and cards
  const ratingThemes = {
    excellent: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      text: "text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      badge: "Excellent 🌟",
    },
    good: {
      bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      text: "text-cyan-400",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
      badge: "Good 👍",
    },
    partial: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      text: "text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      badge: "Partial Details 🤔",
    },
    incorrect: {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      text: "text-rose-400",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      badge: "Needs Work 📚",
    },
  };

  const theme = result ? ratingThemes[result.rating] : ratingThemes.partial;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-3xl mx-auto flex flex-col justify-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => dispatch({ type: "GO_HOME" })}
          disabled={loading || grading}
          className="text-sand-dim text-sm flex items-center gap-1 hover:text-sand transition-colors disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-saffron">
          🤖 AI Reading Arena
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-saffron/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-saffron rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-white text-center">
              Nemotron is crafting a custom passage...
            </p>
            <p className="text-xs text-sand-dim/60 text-center max-w-xs leading-relaxed">
              Writing a story strictly using your learned Kannada characters.
            </p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-10 gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl font-bold">
              ⚠
            </div>
            <p className="text-sm text-rose-400 text-center max-w-md">
              {error}
            </p>
            <button
              onClick={fetchPassage}
              className="px-6 py-2.5 rounded-xl bg-saffron text-onyx font-bold text-sm hover:opacity-95 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {!loading && !error && !result && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Display Kannada Passage */}
            <GlassCard className="p-8 flex flex-col items-center gap-4 text-center border-saffron/20 relative shadow-[0_0_40px_rgba(241,178,74,0.05)]">
              <span className="text-[10px] uppercase tracking-widest text-saffron font-bold">
                Read the Kannada Text
              </span>
              <p className="font-kannada text-3xl sm:text-4xl leading-relaxed text-white select-none my-4">
                {passage}
              </p>
              
              {/* Optional romanization helper */}
              <details className="w-full text-left mt-2">
                <summary className="text-[11px] text-sand-dim/50 hover:text-saffron cursor-pointer transition-colors outline-none select-none">
                  Struggling? Show romanized helper
                </summary>
                <p className="text-xs text-sand-dim/80 font-medium italic mt-2 p-2.5 rounded bg-white/5 border border-white/5 leading-relaxed">
                  {romanization}
                </p>
              </details>
            </GlassCard>

            {/* Translation Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label htmlFor="translation" className="text-xs font-semibold text-sand uppercase tracking-wider">
                What does this passage mean? Explain in English:
              </label>
              
              <textarea
                id="translation"
                rows={4}
                value={userTranslation}
                onChange={(e) => setUserTranslation(e.target.value)}
                disabled={grading}
                placeholder="e.g. The boy is going home. His mother will give him food..."
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-saffron/50 transition-colors placeholder:text-sand-dim/30 resize-none leading-relaxed"
                required
              />

              <button
                type="submit"
                disabled={!userTranslation.trim() || grading}
                className="w-full py-3.5 rounded-xl bg-saffron text-onyx font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(241,178,74,0.2)] hover:shadow-[0_0_32px_rgba(241,178,74,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {grading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
                    Analyzing translation...
                  </>
                ) : (
                  "Submit Translation"
                )}
              </button>
            </form>
          </motion.div>
        )}

        {result && !loading && !error && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Top Score & Rating card */}
            <div className={`p-6 rounded-2xl border ${theme.bg} ${theme.glow} flex flex-col sm:flex-row items-center gap-4 sm:justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎓</span>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Tutor Evaluation</p>
                  <p className="text-xl font-extrabold leading-tight">{theme.badge}</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{result.score}</span>
                <span className="text-sm opacity-60">/100</span>
              </div>
            </div>

            {/* Side-by-side translation comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-sand-dim font-bold">Your Translation</span>
                <p className="text-sm leading-relaxed text-white whitespace-pre-wrap italic mt-1">
                  &ldquo;{userTranslation}&rdquo;
                </p>
              </GlassCard>

              <GlassCard className="p-4 flex flex-col gap-1 border-emerald-500/10">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Correct Meaning</span>
                <p className="text-sm leading-relaxed text-emerald-200/90 whitespace-pre-wrap italic mt-1">
                  &ldquo;{correctTranslation}&rdquo;
                </p>
              </GlassCard>
            </div>

            {/* Detail checklist */}
            <GlassCard className="p-5">
              <span className="text-xs uppercase tracking-wider text-sand-dim font-bold mb-3 block">
                Comprehension Breakdown
              </span>
              <div className="flex flex-col gap-2.5">
                {result.details.map((d, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-white/3 border border-white/5 p-3"
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold
                      ${d.correct 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }
                    `}>
                      {d.correct ? "✓" : "!"}
                    </span>
                    <p className={`text-sm ${d.correct ? "text-sand" : "text-sand-dim/80 line-through"}`}>
                      {d.item}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Detailed tutor explanation */}
            <GlassCard className="p-6 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-saffron/5 rounded-full blur-2xl pointer-events-none" />
              <span className="text-xs uppercase tracking-wider text-saffron font-bold">
                Tutor Feedback
              </span>
              <p className="text-sm leading-relaxed text-white/95 whitespace-pre-wrap">
                {result.feedback}
              </p>
            </GlassCard>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchPassage}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sand hover:bg-white/10 font-bold text-sm tracking-wide transition-all active:scale-95"
              >
                Try Another Story
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-saffron text-onyx hover:opacity-95 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(241,178,74,0.2)] hover:shadow-[0_0_28px_rgba(241,178,74,0.35)] transition-all active:scale-95"
              >
                Finish & Claim XP
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
