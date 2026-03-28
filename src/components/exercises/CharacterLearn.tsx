"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Exercise } from "@/types";
import { isSpeechAvailable, speak } from "@/lib/speech";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

interface CharacterLearnProps {
  exercise: Exercise;
  onAnswer: (correct: boolean, userAnswer?: string, elapsedMs?: number) => void;
  onNext: () => void;
  feedbackState: "idle" | "correct" | "incorrect";
}

export default function CharacterLearn({ exercise, onNext }: CharacterLearnProps) {
  const speechAvailable = isSpeechAvailable();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlay = async () => {
    if (!speechAvailable || isPlaying) return;
    setIsPlaying(true);
    try {
      await speak(exercise.prompt);
      setHasPlayed(true);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <GlassCard className="p-6 sm:p-7 text-center">
        <p className="text-xs uppercase tracking-wider text-sand-dim mb-3">New Character</p>
        <p className="font-kannada text-6xl sm:text-7xl text-saffron mb-2">{exercise.prompt}</p>
        <p className="text-lg sm:text-xl text-sand mb-5">{exercise.correctAnswer}</p>

        <div className="flex justify-center mb-4">
          <Button
            onClick={handlePlay}
            disabled={!speechAvailable || isPlaying}
            variant="ghost"
          >
            {isPlaying ? "Playing..." : "Hear sound"}
          </Button>
        </div>

        {!speechAvailable && (
          <p className="text-xs text-sand-dim mb-4">
            Audio unavailable right now. Read the romanization aloud once before continuing.
          </p>
        )}

        {speechAvailable && !hasPlayed && (
          <p className="text-xs text-sand-dim mb-4">
            Listen once, repeat aloud, then continue.
          </p>
        )}

        <Button onClick={onNext} size="lg">
          I learned this
        </Button>
      </GlassCard>
    </motion.div>
  );
}
