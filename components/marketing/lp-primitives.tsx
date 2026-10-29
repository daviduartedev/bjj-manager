"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

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

/** Marca-texto amarelo atrás de uma palavra, no mesmo espírito de “em dia”. */
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
        "bg-[linear-gradient(transparent_58%,hsl(var(--brand-yellow)/0.55)_58%,hsl(var(--brand-yellow)/0.55)_92%,transparent_92%)] px-1",
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
        "font-sans font-bold tracking-[-0.035em]",
        className,
        surface === "light" ? "text-neutral-950" : "text-white",
        "leading-[1.08]",
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LpReveal — client component, scroll-triggered fade-in with reduced-motion support
// ---------------------------------------------------------------------------

const revealEase = [0.19, 1, 0.22, 1] as const;

type RevealDirection = "up" | "left" | "right" | "scale" | "drop";

const revealInitial = {
  up: {
    opacity: 0,
    y: 72,
    scale: 0.96,
    rotateX: 8,
    filter: "blur(10px)",
    clipPath: "inset(22% 0 0 0 round 0.75rem)",
  },
  left: {
    opacity: 0,
    x: -96,
    y: 18,
    rotate: -2.5,
    scale: 0.96,
    filter: "blur(10px)",
    clipPath: "inset(0 0 0 22% round 0.75rem)",
  },
  right: {
    opacity: 0,
    x: 96,
    y: 18,
    rotate: 2.5,
    scale: 0.96,
    filter: "blur(10px)",
    clipPath: "inset(0 22% 0 0 round 0.75rem)",
  },
  scale: {
    opacity: 0,
    scale: 0.82,
    y: 28,
    rotate: -1.5,
    filter: "blur(12px)",
    clipPath: "inset(12% 12% 12% 12% round 1rem)",
  },
  drop: {
    opacity: 0,
    y: -72,
    scale: 0.96,
    rotateX: -8,
    filter: "blur(10px)",
    clipPath: "inset(0 0 22% 0 round 0.75rem)",
  },
} as const;

const revealVisible = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  rotateX: 0,
  filter: "blur(0px)",
  clipPath: "inset(0 0 0 0 round 0.75rem)",
};

export function LpReveal({
  className,
  delay,
  direction = "up",
  duration = 0.92,
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
  return (
    <motion.div
      className={cn(className, "lp-motion-reveal")}
      initial={revealInitial[direction]}
      animate={onLoad ? revealVisible : undefined}
      whileInView={onLoad ? undefined : revealVisible}
      viewport={onLoad ? undefined : { once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay: delay ?? 0, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}

/** Movimento ligado diretamente ao scroll para imagens e grandes superfícies visuais. */
export function LpScrollDrift({
  className,
  children,
  distance = 72,
  rotate = 2,
  scaleFrom = 0.94,
}: {
  className?: string;
  children: ReactNode;
  distance?: number;
  rotate?: number;
  scaleFrom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
      style={{ y, scale, ...(rotate === 0 ? {} : { rotate: turn }), willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
