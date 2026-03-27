"use client";

import { motion } from "framer-motion";
import { LEVELS } from "@/lib/curriculum";
import { generateExerciseSet } from "@/lib/engine";
import { getAnchorWordsForCharacters } from "@/lib/dictionary";
import { AppState, AppAction } from "@/types";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";

interface LevelIntroProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const letterVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" as const },
  }),
};

export default function LevelIntro({ state, dispatch }: LevelIntroProps) {
  const level = LEVELS.find((l) => l.id === state.currentLevel);
  if (!level) return null;
  const anchorWords = getAnchorWordsForCharacters(
    level.characters.map((char) => char.glyph),
    state.currentLevel,
    state.masteredCharacters,
    Math.max(level.characters.length, 8)
  );

  const handleStart = () => {
    const exercises = generateExerciseSet(
      level.id,
      state.masteredCharacters,
      state.confusableQueue
    );
    dispatch({ type: "START_EXERCISE", exercises });
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 max-w-3xl mx-auto flex flex-col">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => dispatch({ type: "GO_HOME" })}
        className="text-sand-dim text-sm flex items-center gap-1 mb-8 hover:text-sand transition-colors self-start"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="text-xs uppercase tracking-widest text-sand-dim">
          Level {level.id}
        </span>
        <h1 className="text-3xl font-semibold mt-2 mb-1">{level.name}</h1>
        <p className="font-kannada text-saffron text-xl mb-3">
          {level.kannadaName}
        </p>
        <p className="text-sm text-sand-dim max-w-md mx-auto">
          {level.description}
        </p>
      </motion.div>

      <GlassCard className="p-6 mb-8 flex-1">
        <p className="text-xs text-sand-dim uppercase tracking-wider mb-4">
          Characters to learn
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {level.characters.map((char, i) => {
            const isMastered = state.masteredCharacters.includes(char.glyph);
            return (
              <motion.div
                key={char.glyph}
                custom={i}
                variants={letterVariant}
                initial="hidden"
                animate="show"
                whileHover={{ scale: 1.1 }}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-xl
                  ${isMastered ? "bg-saffron/10 border border-saffron/20" : "bg-white/5 border border-white/5"}
                  transition-colors group cursor-default
                `}
              >
                <span className="font-kannada text-2xl sm:text-3xl mb-1">
                  {char.context ?? char.glyph}
                </span>
                <span className="text-[10px] text-sand-dim group-hover:text-saffron transition-colors">
                  {char.romanization}
                </span>
                {isMastered && (
                  <span className="absolute top-1 right-1 text-correct text-[10px]">
                    ✓
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-5 mb-8">
        <p className="text-xs text-sand-dim uppercase tracking-wider mb-3">
          Guide words for this lesson
        </p>
        <p className="text-xs text-sand-dim mb-4">
          Each lesson character is mapped to a decodable real-world word built from learned plus current lesson symbols.
        </p>
        <div className="grid gap-2">
          {anchorWords.map((word) => (
            <div
              key={word.kannada}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-kannada text-xl text-sand">{word.kannada}</p>
                <p className="text-xs text-sand-dim">{word.romanization}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-sand">{word.meaning}</p>
                {word.focusGlyph && (
                  <p className="text-[10px] uppercase tracking-wider text-saffron/90">
                    Focus {word.focusGlyph}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Button size="lg" onClick={handleStart}>
          Begin Exercises
        </Button>
      </motion.div>
    </div>
  );
}
