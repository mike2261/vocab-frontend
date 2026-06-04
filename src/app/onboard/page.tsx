import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoSection } from "@/components/DemoSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
};

export default function OnboardPage() {
  return (
    <>
      <JsonLd />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <HowItWorks />
        <CTASection />
      </main>
      <footer className="border-t border-neutral-200 py-8" style={{ background: "#fafafa" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary-500" />
            <span className="font-600 text-neutral-600">Lexio</span>
          </div>
          <p>© 2026 Lexio. Built with AI, reviewed by humans.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-neutral-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
