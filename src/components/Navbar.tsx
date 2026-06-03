"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60"
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <BookOpen size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-700 text-neutral-900 text-base tracking-tight">Lexio</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-neutral-500 font-500">
          <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
          <a href="#demo" className="hover:text-neutral-900 transition-colors">Demo</a>
          <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works</a>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Get started free
        </motion.button>
      </div>
    </motion.nav>
  );
}
