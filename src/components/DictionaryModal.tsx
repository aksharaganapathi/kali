"use client";

import { motion } from "framer-motion";
import { DICTIONARY } from "@/lib/dictionary";
import { AppState } from "@/types";
import { useMemo, useState } from "react";

interface DictionaryModalProps {
  state: AppState;
  onClose: () => void;
}

export default function DictionaryModal({ state, onClose }: DictionaryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const displayWords = useMemo(() => {
    return DICTIONARY.filter((w) => {
      const searchMatch =
        w.kannada.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.romanization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    }).sort((a, b) => a.minLevel - b.minLevel);
  }, [searchTerm]);

  const { unlocked, locked } = useMemo(() => {
    const unl = [];
    const lck = [];
    for (const w of displayWords) {
      if (w.requiredChars.every((c) => state.masteredCharacters.includes(c))) {
        unl.push(w);
      } else {
        lck.push(w);
      }
    }
    return { unlocked: unl, locked: lck };
  }, [displayWords, state.masteredCharacters]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/80 backdrop-blur-sm p-4 sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl h-[85vh] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Kali Dictionary</h2>
            <p className="text-sm text-sand-dim mt-1">Review words and their meanings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-sand-dim hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <input
            type="text"
            placeholder="Search by Kannada, english, or romanization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-sand-dim/50 focus:outline-none focus:border-saffron/50 transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {unlocked.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-correct tracking-widest uppercase mb-4 sticky top-0 bg-[#1a1a2e]/90 backdrop-blur py-2 z-10">
                Unlocked Words ({unlocked.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {unlocked.map((word) => (
                  <div key={word.kannada} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-2xl font-kannada text-saffron mb-1.5">{word.kannada}</div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-sm font-medium text-white/90">{word.meaning}</span>
                      <span className="text-xs text-sand-dim/60 italic">{word.romanization}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {locked.length > 0 && (
            <section className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <h3 className="text-sm font-semibold text-sand-dim tracking-widest uppercase mb-4 sticky top-0 bg-[#1a1a2e]/90 backdrop-blur py-2 z-10">
                Locked Words ({locked.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {locked.map((word) => (
                  <div key={word.kannada} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-2xl font-kannada text-white/50 mb-1.5">{word.kannada}</div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-sm font-medium text-white/50">{word.meaning}</span>
                      <span className="text-xs text-sand-dim/40 italic">{word.romanization}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {displayWords.length === 0 && (
            <div className="text-center py-20 text-sand-dim">No words found for "{searchTerm}"</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
