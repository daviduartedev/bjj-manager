"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// LpSection — server-safe layout wrapper
// ---------------------------------------------------------------------------

export function LpSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative px-5 py-20 sm:px-10 sm:py-28 lg:px-14", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LpEyebrow — pill label with red dot
// ---------------------------------------------------------------------------

export function LpEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-bjj-red" aria-hidden />
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LpDisplay — big display type
// ---------------------------------------------------------------------------

export function LpDisplay({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "font-sans font-semibold tracking-[-0.02em] leading-[1.08] text-white",
        className,
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LpReveal — client component, scroll-triggered fade-in with reduced-motion support
// ---------------------------------------------------------------------------

export function LpReveal({
  className,
  delay,
  children,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: delay ?? 0, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
