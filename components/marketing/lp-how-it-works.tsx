"use client";

import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useRef } from "react";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";

const STEPS = [
  {
    title: "Cadastre quem treina com você.",
    body: "Comece pelos alunos: contato, turma e plano. A história de cada um ganha um lugar para continuar.",
    detail: "O primeiro aluno já é um começo.",
  },
  {
    title: "Dê um lugar para cada tarefa.",
    body: "Organize as aulas, registre a presença e acompanhe as mensalidades. Cada coisa no seu lugar, conforme a rotina acontece.",
    detail: "Do treino ao fechamento do mês.",
  },
  {
    title: "Acompanhe. Ajuste. Siga em frente.",
    body: "Consulte o painel, veja o que pede atenção e decida o próximo passo. A organização acompanha o dia a dia da academia.",
    detail: "Para cuidar de quem já está e de quem vem.",
  },
] as const;

export function LpHowItWorks() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start 85%", "end 45%"] });

  return (
    <section id="como-funciona" aria-label="Seu próximo passo começa por aqui" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <div className="grid gap-6 border-t border-border pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-24">
          <LpReveal>
            <h2 className="max-w-[19ch] text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
              Seu próximo passo <span className="text-brand-green">começa por aqui.</span>
            </h2>
          </LpReveal>
          <LpReveal delay={0.1}>
            <p className="max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
              Você não precisa organizar a academia inteira de uma vez. Comece pelo que faz parte do seu dia.
            </p>
          </LpReveal>
        </div>
        <div ref={journeyRef} className="relative mt-14 lg:mt-20">
          <div aria-hidden className="pointer-events-none absolute inset-x-6 top-6 hidden h-px bg-border lg:block">
            <motion.div className="h-full origin-left bg-brand-blue" style={{ scaleX: shouldReduce ? 1 : scrollYProgress }} />
          </div>
          <div aria-hidden className="pointer-events-none absolute bottom-6 left-6 top-6 w-px bg-border lg:hidden">
            <motion.div className="h-full origin-top bg-brand-blue" style={{ scaleY: shouldReduce ? 1 : scrollYProgress }} />
          </div>
          <ol className="grid gap-12 lg:grid-cols-3 lg:gap-12">
          {STEPS.map(({ title, body, detail }, index) => (
            <li key={title} className="relative grid grid-cols-[3rem_1fr] items-start gap-5 lg:block">
              <span aria-hidden className="relative z-10 flex size-12 items-center justify-center rounded-full border border-brand-blue bg-white text-base font-semibold text-brand-blue ring-8 ring-white">
                {index + 1}
              </span>
              <LpReveal className="pt-1 lg:mt-8 lg:pt-0" delay={index * 0.07}>
                <h3 className="max-w-[20ch] text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground">{title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
                <p className="mt-5 text-sm font-medium text-brand-blue">{detail}</p>
              </LpReveal>
            </li>
          ))}
          </ol>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-16">
          <LpSignupLink className="normal-case tracking-normal">Organizar minha academia</LpSignupLink>
          <p className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">Sua academia tem muito pela frente. Vamos organizar o próximo passo?</p>
        </div>
      </div>
    </section>
  );
}
