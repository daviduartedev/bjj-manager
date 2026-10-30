"use client";

import { motion, type Variants } from "framer-motion";

import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

const NAME_COLOR = "color-mix(in srgb, hsl(var(--brand-yellow)) 60%, white)";
const BRAND_COLOR = "color-mix(in srgb, hsl(var(--brand-green)) 55%, white)";

type Token = { text: string; tone?: "name" | "brand"; after?: string };

const name = (text: string, after = ","): Token => ({ text, tone: "name", after });
const plain = (text: string): Token[] => text.split(" ").map((word) => ({ text: word }));

const TOKENS: Token[] = [
  name("Jigoro Kano"),
  name("Hélio Gracie"),
  name("Rillion Gracie"),
  name("Anderson Silva"),
  name("Éder Jofre"),
  name("Popó Freitas"),
  name("Rafaela Silva"),
  name("Aurélio Miguel"),
  name("Natália Falavigna"),
  name("Buakaw", "."),
  ...plain("Antes de virar referência, cada um teve um professor, um tatame e uma academia que abriu as portas no dia seguinte. O"),
  { text: "Casca", tone: "brand" },
  ...plain("existe para que a sua continue abrindo, aula após aula, inclusive no aperto do fim do mês."),
];

const SENTENCE = TOKENS.map((token) => token.text + (token.after ?? "")).join(" ");

const paragraph: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] } },
};

/** Manifesto em faixa escura: as palavras surgem em sequência, saindo do desfoque; nomes em dourado. */
export function LpManifesto() {
  const shouldReduce = useLandingReducedMotion();

  return (
    <section id="manifesto" aria-label="Manifesto do Casca" className="scroll-mt-24 bg-neutral-950 px-5 py-24 text-neutral-100 sm:px-10 sm:py-36">
      <motion.p
        variants={paragraph}
        initial={shouldReduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="mx-auto max-w-5xl text-center text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.2] tracking-[-0.035em]"
      >
        <span className="sr-only">{SENTENCE}</span>
        {TOKENS.map((token, index) => (
          <span key={`${token.text}-${index}`} aria-hidden>
            <motion.span variants={word} className={`inline-block ${token.tone === "name" ? "whitespace-nowrap" : ""}`}>
              <span style={token.tone ? { color: token.tone === "name" ? NAME_COLOR : BRAND_COLOR } : undefined}>{token.text}</span>
              {token.after}
            </motion.span>
            {index < TOKENS.length - 1 ? " " : null}
          </span>
        ))}
      </motion.p>
    </section>
  );
}
