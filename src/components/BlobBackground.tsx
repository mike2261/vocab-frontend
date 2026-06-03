"use client";

import { motion } from "framer-motion";

const blobs = [
  { color: "#a8f4e1", size: 280, top: "5%",  left: "5%",   delay: 0 },
  { color: "#c4b5fd", size: 260, top: "10%", right: "8%",  delay: 4 },
  { color: "#fcd9bd", size: 240, top: "55%", left: "3%",   delay: 2 },
  { color: "#bae6fd", size: 260, top: "60%", right: "5%",  delay: 6 },
  { color: "#fda4af", size: 220, top: "35%", left: "42%",  delay: 3 },
];

export function BlobBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* white base */}
      <div className="absolute inset-0 bg-white" />

      {blobs.map((b, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 10, -6, 0],
            y: [0, -8, 6, 0],
          }}
          transition={{
            duration: 18 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.delay,
          }}
          className="absolute rounded-full"
          style={{
            width:  b.size,
            height: b.size,
            top:    b.top    ?? "auto",
            left:   b.left   ?? "auto",
            right:  (b as { right?: string }).right  ?? "auto",
            bottom: (b as { bottom?: string }).bottom ?? "auto",
            background: b.color,
            filter: "blur(100px)",
            opacity: 0.25,
          }}
        />
      ))}

      {/* subtle noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
