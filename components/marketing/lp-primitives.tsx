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
    <section id={id} className={cn("relative px-5 py-24 sm:px-10 sm:py-32 lg:px-16", className)}>
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LpDisplay — big display type
// ---------------------------------------------------------------------------

export function LpDisplay({
  className,
  surface = "dark",
  children,
}: {
  className?: string;
  surface?: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-sans font-semibold tracking-[-0.02em]",
        className,
        surface === "light" ? "text-neutral-950" : "text-white",
        "leading-[1.15]",
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LpReveal — client component, scroll-triggered fade-in with reduced-motion support
// ---------------------------------------------------------------------------

const revealEase = [0.22, 1, 0.36, 1] as const;

export function LpReveal({
  className,
  delay,
  onLoad = false,
  children,
}: {
  className?: string;
  delay?: number;
  /** Hero e o que já está no ecrã: entra ao carregar, sem esperar o scroll. */
  onLoad?: boolean;
  children: ReactNode;
}) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={onLoad ? { opacity: 1, y: 0 } : undefined}
      whileInView={onLoad ? undefined : { opacity: 1, y: 0 }}
      viewport={onLoad ? undefined : { once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, delay: delay ?? 0, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}
