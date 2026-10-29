import { Check, Lock, ShieldCheck } from "lucide-react";

import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const points = [
  {
    icon: ShieldCheck,
    title: "Cada academia vê o que é seu",
    body: "Alunos, mensalidades, turmas e configurações ficam isolados por academia. Uma operação não aparece para outra.",
  },
  {
    icon: Lock,
    title: "Cada ação deixa contexto",
    body: "Graduações ficam com data e responsável. Mensalidades mostram o mês e o status. Você sabe o que aconteceu.",
  },
] as const;

const checks = [
  "Acesso autenticado para a equipe",
  "Portal do aluno liberado pela academia",
  "Histórico preservado por aluno",
  "Pagamento confirmado por quem administra",
] as const;

export function LpTrust() {
  return (
    <LpSection id="seguranca" className="bg-brand-blue text-white">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <LpReveal direction="left" duration={1.05}>
          <p className="text-sm font-semibold text-brand-yellow">Confiança para operar</p>
          <LpDisplay surface="dark" className="mt-4 max-w-[14ch] text-[clamp(2.25rem,5vw,4rem)]">
            Informação clara para cuidar da sua academia.
          </LpDisplay>
          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/75 sm:text-lg">
            O Casca foi pensado para uma responsabilidade bem brasileira: ensinar, administrar e ainda
            manter a casa funcionando todos os dias.
          </p>
        </LpReveal>

        <LpReveal direction="right" className="grid gap-8 sm:grid-cols-2" duration={1.05}>
          {points.map(({ icon: Icon, title, body }) => (
            <article key={title} className="ease-lp-expo group border-t border-white/25 pt-6 transition-transform duration-300 hover:-translate-y-2">
              <Icon className="size-7 text-brand-yellow transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.8} aria-hidden />
              <h3 className="mt-5 text-xl font-bold tracking-[-0.025em] text-white">{title}</h3>
              <p className="mt-3 leading-relaxed text-white/75">{body}</p>
            </article>
          ))}
          <ul className="grid gap-3 border-t border-white/25 pt-6 sm:col-span-2 sm:grid-cols-2">
            {checks.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/85 transition-transform duration-300 hover:translate-x-1.5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-yellow" strokeWidth={3} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </LpReveal>
      </div>
    </LpSection>
  );
}
