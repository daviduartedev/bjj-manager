"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduce;
}

/** Os dois punhos compartilham o mesmo enquadramento; o scroll os aproxima até o toque no centro. */
export function LpFistBumpHands() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });
  const leftX = useTransform(scrollYProgress, [0, 1], ["-26%", "0%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["26%", "0%"]);
  const impact = useTransform(scrollYProgress, [0.88, 1], [0, 1]);
  const mode = shouldReduce ? "static" : "scroll";

  return (
    <div ref={ref} aria-hidden className="relative mx-auto aspect-[16/5] w-full max-w-[1400px]">
      <motion.div key={`l-${mode}`} style={shouldReduce ? undefined : { x: leftX }} className="absolute inset-0 will-change-transform">
        <Image src="/marketing/lp-fist-left.webp" alt="" fill sizes="100vw" className="object-contain" />
      </motion.div>
      <motion.div key={`r-${mode}`} style={shouldReduce ? undefined : { x: rightX }} className="absolute inset-0 will-change-transform">
        <Image src="/marketing/lp-fist-right.webp" alt="" fill sizes="100vw" className="object-contain" />
      </motion.div>
      <motion.svg
        key={`i-${mode}`}
        viewBox="0 0 40 40"
        style={shouldReduce ? undefined : { opacity: impact, scale: impact }}
        className="absolute left-1/2 top-[2%] h-[22%] w-auto -translate-x-1/2 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        <path d="M20 4v10M8 10l6 7M32 10l-6 7" />
      </motion.svg>
    </div>
  );
}
