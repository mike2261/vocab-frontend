"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#how-it-works", label: "How it works" },
];

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleCTA() {
    router.push(getStoredToken() ? '/dashboard' : '/login');
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <BookOpen size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-700 text-neutral-900 text-base tracking-tight">Lexio</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-500 font-500">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-neutral-900 transition-colors">
                {label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => handleCTA()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block px-4 py-2 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get started free
            </motion.button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden bg-white border-b border-neutral-200 shadow-lg"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-500 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {label}
                </a>
              ))}
              <button
                onClick={() => { handleCTA(); setMobileOpen(false); }}
                className="mt-1 w-full py-2.5 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Get started free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
