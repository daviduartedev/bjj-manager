"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

/** Uma composição: o emblema chega primeiro e resolve na assinatura completa do Casca. */
export function LpAnimatedLogo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useLandingReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start 88%", "center 55%"],
  });

  const emblemOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48, 0.7], [0, 1, 1, 0]);
  const emblemScale = useTransform(scrollYProgress, [0, 0.38, 0.7], [0.7, 1, 1.04]);
  const emblemY = useTransform(scrollYProgress, [0, 0.38, 0.7], [32, 0, -10]);
  const logoOpacity = useTransform(scrollYProgress, [0.46, 0.7], [0, 1]);
  const logoClip = useTransform(
    scrollYProgress,
    [0.42, 0.82],
    ["inset(0 52% 0 52% round 1rem)", "inset(0 0% 0 0% round 1rem)"],
  );
  const logoScale = useTransform(scrollYProgress, [0.46, 0.86], [0.94, 1]);

  return (
    <div
      ref={rootRef}
      data-testid="landing-cta-logo"
      className="relative mx-auto h-32 w-full max-w-3xl sm:h-44 lg:h-52"
      role="img"
      aria-label="Casca"
    >
      <motion.div
        aria-hidden
        className="lp-logo-emblem absolute inset-0 flex items-center justify-center"
        style={shouldReduce ? { opacity: 0 } : { opacity: emblemOpacity, scale: emblemScale, y: emblemY }}
      >
        <Image
          src="/marketing/logo-emblem-dark.png"
          alt=""
          width={1024}
          height={1024}
          className="h-24 w-24 object-contain sm:h-32 sm:w-32"
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="lp-logo-wordmark absolute inset-0 flex items-center justify-center"
        style={shouldReduce ? { opacity: 1 } : {
          opacity: logoOpacity,
          clipPath: logoClip,
          scale: logoScale,
          willChange: "transform, opacity, clip-path",
        }}
      >
        <Image
          src="/marketing/casca-logo-dark.png"
          alt=""
          width={3068}
          height={945}
          className="h-auto w-[min(75vw,32rem)] object-contain"
        />
      </motion.div>
    </div>
  );
}
