"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

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
    <section id={id} className={cn("relative py-20 sm:py-28", className)}>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-16">{children}</div>
    </section>
  );
}

/** Ênfase cromática da landing, sem superfície atrás do texto. */
export function LpMark({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-brand-green",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// LpDisplay — big display type
// ---------------------------------------------------------------------------

export function LpDisplay({
  className,
  surface = "light",
  children,
}: {
  className?: string;
  surface?: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <h2
      className={cn(
        "font-sans font-bold tracking-[-0.035em]",
        className,
        surface === "light" ? "text-neutral-950" : "text-white",
        "leading-[1.08]",
      )}
    >
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// LpReveal — client component, scroll-triggered fade-in with reduced-motion support
// ---------------------------------------------------------------------------

const revealEase = [0.19, 1, 0.22, 1] as const;

type RevealDirection = "up" | "left" | "right" | "scale" | "drop";

const revealInitial = {
  up: { opacity: 0, y: 28 },
  left: { opacity: 0, x: -28 },
  right: { opacity: 0, x: 28 },
  scale: { opacity: 0, scale: 0.97, y: 16 },
  drop: { opacity: 0, y: -16 },
} as const;

const revealVisible = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
};

export function LpReveal({
  className,
  delay,
  direction = "up",
  duration = 0.7,
  onLoad = false,
  children,
}: {
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
  /** Hero e o que já está no ecrã: entra ao carregar, sem esperar o scroll. */
  onLoad?: boolean;
  children: ReactNode;
}) {
  const shouldReduce = useLandingReducedMotion();
  return (
    <motion.div
      className={cn(className, "lp-motion-reveal")}
      initial={shouldReduce ? false : revealInitial[direction]}
      animate={onLoad ? revealVisible : undefined}
      whileInView={onLoad ? undefined : revealVisible}
      viewport={onLoad ? undefined : { once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: shouldReduce ? 0 : duration, delay: shouldReduce ? 0 : delay ?? 0, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}

/** Movimento ligado diretamente ao scroll para imagens e grandes superfícies visuais. */
export function LpScrollDrift({
  className,
  children,
  distance = 24,
  rotate = 0,
  scaleFrom = 0.99,
}: {
  className?: string;
  children: ReactNode;
  distance?: number;
  rotate?: number;
  scaleFrom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useLandingReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [distance, 0, -distance]);
  const turn = useTransform(scrollYProgress, [0, 0.5, 1], [-rotate, 0, rotate]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scaleFrom, 1, scaleFrom]);

  return (
    <motion.div
      ref={ref}
      className={cn("lp-scroll-drift", className)}
      style={shouldReduce ? undefined : { y, scale, ...(rotate === 0 ? {} : { rotate: turn }) }}
    >
      {children}
    </motion.div>
  );
}
