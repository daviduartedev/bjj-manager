"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

const MODALITIES = ["Judô", "Jiu-Jitsu", "Muay Thai", "Boxe"] as const;
const MODALITY_COLOR = "color-mix(in srgb, hsl(var(--brand-yellow)) 60%, white)";

export function LpModalitiesBanner() {
  const shouldReduce = useLandingReducedMotion();
  const [activeModality, setActiveModality] = useState(0);

  useEffect(() => {
    if (shouldReduce) return;
    const timer = window.setInterval(() => setActiveModality((current) => (current + 1) % MODALITIES.length), 2800);
    return () => window.clearInterval(timer);
  }, [shouldReduce]);

  return (
    <section id="modalidades" aria-label="O Casca nasceu para ajudar sua academia" className="relative my-8 scroll-mt-24 bg-brand-green px-5 py-16 text-white sm:my-12 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="sr-only">O Casca nasceu para ajudar sua academia de Judô, Jiu-Jitsu, Muay Thai e Boxe a crescer.</h2>
        <div aria-hidden className="text-center text-[clamp(1.9rem,4vw,3.5rem)] font-bold leading-[1.2] tracking-[-0.04em]">
          <div className="flex flex-col items-center justify-center gap-x-[0.35em] gap-y-3 sm:flex-row">
            <span className="flex items-center gap-x-[0.3em]">
              <span>O</span>
              <CascaNavLogo asLink={false} tone="dark-bg" className="relative sm:top-[0.08em]" imgClassName="h-[1.15em] sm:h-[1.15em]" />
            </span>
            <span>nasceu para ajudar</span>
          </div>
          {shouldReduce ? (
            <><p className="mt-3">sua academia de</p><p className="mx-auto mt-2 max-w-[27ch] text-[0.8em]" style={{ color: MODALITY_COLOR }}>Judô, Jiu-Jitsu, Muay Thai e Boxe</p><p className="mt-1">a crescer.</p></>
          ) : (
            <div className="mt-3 flex flex-col items-center justify-center gap-y-1 sm:flex-row sm:gap-x-[0.25em]">
              <span className="whitespace-nowrap">sua academia de</span>
              <span className="inline-flex overflow-hidden text-center sm:text-left">
                <AnimatePresence initial={false} mode="wait">
                  <motion.span key={MODALITIES[activeModality]} data-testid="landing-current-modality" style={{ color: MODALITY_COLOR }} className="inline-block whitespace-nowrap text-center sm:text-left" initial={{ y: "75%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-75%", opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                    {MODALITIES[activeModality]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="whitespace-nowrap">a crescer.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
