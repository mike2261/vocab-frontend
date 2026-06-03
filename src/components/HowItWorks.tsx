"use client";

import { motion } from "framer-motion";
import { PlusCircle, Layers, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: PlusCircle,
    title: "Add a word",
    description:
      "Type any English word you want to learn. Lexio instantly generates a full card with pronunciation, meaning, CEFR level, and Vietnamese translation.",
  },
  {
    step: "02",
    icon: Layers,
    title: "Review with flashcards",
    description:
      "Flip the card to reveal the definition, then mark whether you knew it. Our spaced repetition algorithm schedules your next review at the perfect time.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Watch your vocabulary grow",
    description:
      "Track your streak, see words move from 'new' to 'mastered', and build a vocabulary that actually stays with you long-term.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-800 text-neutral-900 tracking-tight mb-3">
            Simple by design
          </h2>
          <p className="text-neutral-500 text-base max-w-sm mx-auto">
            Three steps, no fluff. Focus on learning — not the app.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-neutral-200" />

          <div className="grid lg:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center z-10 relative">
                    <s.icon size={22} className="text-primary-500" />
                  </div>
                  <span className="absolute -top-1 -right-2 text-xs font-700 text-primary-500 bg-white">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-700 text-neutral-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
