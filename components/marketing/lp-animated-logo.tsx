"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/** Uma composição: o emblema chega primeiro e resolve na assinatura completa do Casca. */
export function LpAnimatedLogo() {
  const rootRef = useRef<HTMLDivElement>(null);
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
      className="relative mx-auto h-56 w-full max-w-6xl sm:h-72 lg:h-[24rem]"
      role="img"
      aria-label="Casca"
    >
      <motion.div
        aria-hidden
        className="lp-logo-emblem absolute inset-0 flex items-center justify-center"
        style={{ opacity: emblemOpacity, scale: emblemScale, y: emblemY, willChange: "transform, opacity" }}
      >
        <Image
          src="/marketing/logo-emblem-light.png"
          alt=""
          width={1024}
          height={1024}
          className="h-40 w-40 object-contain sm:h-56 sm:w-56 lg:h-64 lg:w-64"
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="lp-logo-wordmark absolute inset-0 flex items-center justify-center"
        style={{
          opacity: logoOpacity,
          clipPath: logoClip,
          scale: logoScale,
          willChange: "transform, opacity, clip-path",
        }}
      >
        <Image
          src="/marketing/casca-logo-light.png"
          alt=""
          width={3068}
          height={945}
          className="h-auto w-[min(88vw,50rem)] object-contain"
        />
      </motion.div>
    </div>
  );
}
