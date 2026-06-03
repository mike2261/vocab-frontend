"use client";

import { motion } from "framer-motion";
import { FlashCard } from "./FlashCard";

const wordList = [
  { word: "escalate", level: "B2", status: "learning" },
  { word: "resilient", level: "C1", status: "new" },
  { word: "nuance",    level: "C1", status: "mastered" },
  { word: "pragmatic", level: "B2", status: "mastered" },
  { word: "deduce",    level: "B1", status: "learning" },
];

const statusStyle: Record<string, string> = {
  new:      "bg-neutral-100 text-neutral-500",
  learning: "bg-amber-50 text-amber-700",
  mastered: "bg-primary-100 text-primary-700",
};

export function DemoSection() {
  return (
    <section id="demo" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-800 text-neutral-900 tracking-tight mb-3">
            Try it yourself
          </h2>
          <p className="text-neutral-500 text-base">
            Click the card to flip and reveal the definition.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Flashcard */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <FlashCard />
          </motion.div>

          {/* Word list panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-700 text-neutral-900 text-sm">My vocabulary</h3>
              <span className="text-xs text-neutral-400 font-500">5 words</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {wordList.map((w, i) => (
                <motion.div
                  key={w.word}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.05 * i, ease: "easeOut" }}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-600 text-neutral-800 text-sm">{w.word}</span>
                    <span className="text-xs text-neutral-400 font-mono">{w.level}</span>
                  </div>
                  <span
                    className={`text-xs font-600 uppercase tracking-wide px-2 py-0.5 rounded-full ${statusStyle[w.status]}`}
                  >
                    {w.status}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span>Overall progress</span>
                <span className="font-600 text-neutral-700">40%</span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "40%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
