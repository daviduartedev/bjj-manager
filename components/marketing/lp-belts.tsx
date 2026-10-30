"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Award, CalendarCheck, CheckCheck, UserPlus } from "lucide-react";
import { useRef } from "react";

import { LpReveal } from "@/components/marketing/lp-primitives";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

const MILESTONES = [
  { icon: UserPlus, when: "08 de outubro", title: "Matrícula", body: "Marina entra para a turma da noite." },
  { icon: CalendarCheck, when: "12 treinos", title: "Presença", body: "Cada aula fica registrada." },
  { icon: CheckCheck, when: "Outubro", title: "Mensalidade", body: "Em dia, confirmada pela academia." },
  { icon: Award, when: "Dezembro", title: "Graduação", body: "Faixa azul, com data e responsável." },
] as const;

/** Ficha do aluno com linha do tempo que se completa durante o scroll. */
export function LpBelts() {
  const shouldReduce = useLandingReducedMotion();
  const timelineRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 0.85", "end 0.55"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="faixas" aria-label="Cada aluno tem uma história" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <LpReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">Cada aluno tem uma história. <span className="text-brand-green">Acompanhe de perto.</span></h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">O aluno chega para treinar. A ficha vai além do nome: reúne os registros que ajudam você a acompanhar quem está na academia.</p>
        </LpReveal>

        <LpReveal direction="scale" className="mt-12 sm:mt-16">
          <figure aria-label="Exemplo da ficha de uma aluna de Jiu-Jitsu" className="rounded-3xl bg-neutral-50 p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <span aria-hidden className="flex size-16 items-center justify-center rounded-full bg-brand-yellow/25 text-xl font-semibold text-foreground">MA</span>
              <div>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Marina Alves</p>
                <p className="mt-1 text-sm text-muted-foreground">Jiu-Jitsu · Turma da noite · Aluna ativa</p>
              </div>
              <span className="rounded-full bg-brand-green/10 px-3 py-1.5 text-xs font-semibold text-brand-green sm:ml-auto">Mensalidade em dia</span>
            </div>

            <ol ref={timelineRef} className="relative mt-10 grid gap-8 pl-12 sm:mt-12 md:grid-cols-4 md:gap-6 md:pl-0 md:pt-14">
              <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-neutral-200 md:bottom-auto md:left-5 md:right-5 md:top-[19px] md:h-0.5 md:w-auto" />
              <motion.span aria-hidden style={shouldReduce ? undefined : { scaleY: fill }} className="absolute bottom-2 left-[19px] top-2 w-0.5 origin-top bg-brand-green md:hidden" />
              <motion.span aria-hidden style={shouldReduce ? undefined : { scaleX: fill }} className="absolute left-5 right-5 top-[19px] hidden h-0.5 origin-left bg-brand-green md:block" />
              {MILESTONES.map(({ icon: Icon, when, title, body }) => (
                <li key={title} className="relative">
                  <span aria-hidden className="absolute -left-12 top-0 flex size-10 items-center justify-center rounded-full bg-brand-green text-white ring-4 ring-neutral-50 md:-top-14 md:left-0">
                    <Icon className="size-4" />
                  </span>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{when}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
            <figcaption className="mt-10 text-xs text-muted-foreground">Ficha ilustrativa de Jiu-Jitsu.</figcaption>
          </figure>
        </LpReveal>

        <p className="mx-auto mt-8 max-w-[52ch] text-center text-sm leading-relaxed text-muted-foreground">No Boxe, o acompanhamento segue com alunos, aulas, presenças e mensalidades. Faixa e grau não são obrigatórios.</p>
      </div>
    </section>
  );
}
