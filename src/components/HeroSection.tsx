"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import { FlashCard } from "./FlashCard";

export function HeroSection() {
  const router = useRouter();
  const handleCTA = () => router.push(getStoredToken() ? '/dashboard' : '/login');
  return (
    <section className="min-h-screen flex items-center pt-14">
      <div className="max-w-5xl mx-auto px-6 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 mb-6"
            >
              <Sparkles size={13} className="text-primary-500" />
              <span className="text-xs font-600 text-primary-700">AI-powered vocabulary</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
              className="text-4xl lg:text-5xl font-800 text-neutral-900 leading-[1.1] tracking-tight mb-5"
            >
              Stop forgetting{" "}
              <span className="text-primary-500">English words.</span>{" "}
              Start owning them.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-md"
            >
              Lexio uses AI to instantly generate definitions, IPA pronunciation, CEFR levels,
              and Vietnamese translations — then keeps you reviewing until words truly stick.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex items-center gap-2 px-5 py-3 bg-primary-500 text-white font-500 rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Start for free
                <ArrowRight size={15} />
              </motion.button>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 border border-neutral-200 text-neutral-700 font-500 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors text-sm cursor-pointer"
              >
                See demo
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-4 mt-10"
            >
              <div className="flex -space-x-2">
                {["#15c39a", "#38d9b1", "#0fa882", "#6eeacb"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-400">
                <span className="font-600 text-neutral-700">2,400+</span> words learned this week
              </p>
            </motion.div>
          </div>

          {/* Right — flashcard demo */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl -z-10" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }} />
            <FlashCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
