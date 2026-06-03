"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RotateCcw } from "lucide-react";

const DEMO_WORD = {
  word: "escalate",
  phonetic: "/ˈeskəleɪt/",
  partOfSpeech: "verb",
  cefrLevel: "B2",
  definition: "to increase rapidly in intensity, amount, or extent",
  translation: "leo thang, gia tăng",
  example: "The conflict began to escalate after the failed negotiations.",
  exampleTranslation: "Xung đột bắt đầu leo thang sau các cuộc đàm phán thất bại.",
};

export function FlashCard() {
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<"know" | "review" | null>(null);

  const reset = () => {
    setFlipped(false);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      {/* Card */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => !result && setFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full"
        >
          {/* Front */}
          <div
            className="w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-600 tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                {DEMO_WORD.cefrLevel}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {DEMO_WORD.partOfSpeech}
              </span>
            </div>

            <div className="text-center py-4">
              <h2 className="text-4xl font-800 text-neutral-900 tracking-tight mb-3">
                {DEMO_WORD.word}
              </h2>
              <div className="flex items-center justify-center gap-2 text-neutral-400">
                <span className="font-mono text-sm">{DEMO_WORD.phonetic}</span>
                <button
                  className="p-1 rounded hover:text-primary-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Volume2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-center text-neutral-400 text-sm mt-6">
              Tap to reveal definition
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-600 tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                {DEMO_WORD.cefrLevel}
              </span>
              <span className="text-xs text-neutral-400 font-medium">{DEMO_WORD.partOfSpeech}</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-base font-500 text-neutral-800 leading-relaxed">
                  {DEMO_WORD.definition}
                </p>
                <p className="text-sm text-primary-600 font-500 mt-1">
                  {DEMO_WORD.translation}
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-600 italic leading-relaxed">
                  &ldquo;{DEMO_WORD.example}&rdquo;
                </p>
                <p className="text-xs text-neutral-400 mt-1 italic">
                  {DEMO_WORD.exampleTranslation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {!flipped && !result && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-neutral-400"
          >
            Click the card to flip
          </motion.p>
        )}

        {flipped && !result && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex gap-3 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setResult("review")}
              className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-sm font-500 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Review again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setResult("know")}
              className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-500 hover:bg-primary-600 transition-colors"
            >
              Got it ✓
            </motion.button>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm font-500 text-neutral-600">
              {result === "know"
                ? "Nice! Moving to next review in 3 days."
                : "No worries, you'll see it again tomorrow."}
            </p>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-500 transition-colors"
            >
              <RotateCcw size={12} />
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
