"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, Users } from "lucide-react";
import { useState } from "react";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";

const STEPS = [
  { title: "Cadastre quem treina com você.", body: "Comece pelos alunos: contato, turma e plano. A história de cada um ganha um lugar para continuar.", note: "O primeiro aluno já é um começo." },
  { title: "Dê um lugar para cada tarefa.", body: "Organize as aulas, registre a presença e acompanhe as mensalidades. Cada coisa no seu lugar, conforme a rotina acontece.", note: "Do treino ao fechamento do mês." },
  { title: "Acompanhe. Ajuste. Siga em frente.", body: "Consulte o painel, veja o que pede atenção e decida o próximo passo. A organização acompanha o dia a dia da academia.", note: "Para cuidar de quem já está e de quem vem." },
] as const;

function StepIllustration({ step }: { step: number }) {
  if (step === 0) return <div className="flex items-center gap-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-lg font-semibold text-brand-blue">MA</span><div><p className="text-xl font-semibold">Marina Alves</p><p className="mt-1 text-sm text-muted-foreground">Turma da noite · Plano Adulto</p><p className="mt-3 flex items-center gap-2 text-sm text-brand-green"><Check className="size-4" />Cadastro organizado.</p></div></div>;
  if (step === 1) return <div className="grid gap-3 sm:grid-cols-3">{[["Aulas", "Turma da noite · 19h"], ["Presença", "Marina veio treinar."], ["Mensalidades", "Outubro recebido."]].map(([title, body]) => <div key={title} className="rounded-xl bg-white p-4 ring-1 ring-black/[0.05]"><span className="flex size-8 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"><CheckCheck className="size-4" /></span><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{body}</p></div>)}</div>;
  return <div><p className="text-sm text-muted-foreground">O que pede atenção hoje</p><div className="mt-4 flex items-center gap-4"><Users className="size-7 text-brand-green" /><p className="text-5xl font-semibold tracking-tight text-brand-green">42</p><span className="text-sm text-muted-foreground">alunos ativos</span></div><p className="mt-5 text-sm">3 mensalidades para conferir · Marina faz aniversário hoje.</p></div>;
}

/** Título fixo com progresso à esquerda; os passos passam à direita conforme o scroll. */
export function LpHowItWorks() {
  const shouldReduce = useLandingReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section id="como-funciona" aria-label="Seu próximo passo começa por aqui" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="max-w-[14ch] text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">Seu próximo passo <span className="text-brand-green">começa por aqui.</span></h2>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">Você não precisa organizar a academia inteira de uma vez. Comece pelo que faz parte do seu dia.</p>
          <ol aria-hidden className="mt-12 hidden space-y-1 lg:block">
            {STEPS.map(({ title }, index) => (
              <li key={title} className={`flex items-center gap-4 py-2 text-sm font-medium transition-colors duration-300 ${active === index ? "text-foreground" : "text-muted-foreground/60"}`}>
                <span className="relative h-0.5 w-10 overflow-hidden rounded-full bg-neutral-200">
                  <span className={`absolute inset-y-0 left-0 rounded-full bg-brand-green transition-all duration-500 ${active === index ? "w-full" : active > index ? "w-full opacity-40" : "w-0"}`} />
                </span>
                <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                {title}
              </li>
            ))}
          </ol>
        </div>

        <div>
        <ol className="space-y-5 sm:space-y-6">
          {STEPS.map(({ title, body, note }, index) => (
            <motion.li
              key={title}
              onViewportEnter={() => setActive(index)}
              viewport={{ amount: 0.6 }}
              initial={shouldReduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduce ? 0 : 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col rounded-3xl bg-neutral-50 p-7 sm:p-10 lg:min-h-[460px]"
            >
              <span aria-hidden className="text-6xl font-semibold tracking-[-0.06em] text-brand-green/25 sm:text-7xl">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 max-w-[22ch] text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-3xl">{title}</h3>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-muted-foreground">{body}</p>
              <p className="mt-4 text-sm font-medium text-brand-green">{note}</p>
              <figure aria-label={`Exemplo do passo ${index + 1}`} className="mt-auto pt-9">
                <div aria-hidden className="rounded-2xl bg-white p-5 shadow-[0_8px_40px_-24px_rgba(0,0,0,0.2)] sm:p-6"><StepIllustration step={index} /></div>
              </figure>
            </motion.li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">Exemplos ilustrativos do Casca.</p>
        </div>
      </div>
      <div className="mt-14 flex justify-center px-5"><LpSignupLink>Organizar minha academia</LpSignupLink></div>
    </section>
  );
}
