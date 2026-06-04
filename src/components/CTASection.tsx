"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";

export function CTASection() {
  const router = useRouter();
  const handleCTA = () => router.push(getStoredToken() ? '/dashboard' : '/login');
  return (
    <section className="py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary-500 items-center justify-center mb-6 shadow-lg shadow-primary-200">
            <span className="text-2xl">📚</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-800 text-neutral-900 tracking-tight mb-4">
            Start building your vocabulary today
          </h2>
          <p className="text-neutral-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
            Free to start. No credit card. Add your first word in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => handleCTA()}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-600 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get started — it&apos;s free
              <ArrowRight size={16} />
            </motion.button>
          </div>

          <p className="mt-6 text-xs text-neutral-400">
            Already learning with Lexio?{" "}
            <button onClick={() => handleCTA()} className="text-primary-500 hover:underline">
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
