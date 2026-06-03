"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, RefreshCw, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-generated in seconds",
    description:
      "Type any word and get IPA pronunciation, CEFR level, definition, and Vietnamese translation — instantly.",
    color: "text-primary-500",
    bg: "bg-primary-50",
  },
  {
    icon: Brain,
    title: "Spaced repetition",
    description:
      "Our algorithm surfaces words just before you forget them, so every review session is perfectly timed.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: RefreshCw,
    title: "Flashcard flip & swipe",
    description:
      "Review with beautiful interactive flashcards. Flip to reveal, swipe to mark — fast and satisfying.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "Track your progress",
    description:
      "See your streak, mastery level per word, and how your vocabulary is growing over time.",
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] as const } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-800 text-neutral-900 tracking-tight mb-3">
            Everything you need to build vocabulary
          </h2>
          <p className="text-neutral-500 text-base max-w-md mx-auto">
            From AI lookup to long-term retention — Lexio handles the full learning loop.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -3, transition: { type: "spring", stiffness: 260, damping: 24 } }}
              className="bg-white rounded-xl border border-neutral-200 p-6 cursor-default"
            >
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-700 text-neutral-900 text-base mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
