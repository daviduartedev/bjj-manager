import { Check, Lock, Shield } from "lucide-react";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const points = [
  {
    icon: Shield,
    title: "Cada academia no seu espaço",
    body: "O ambiente é multi-academia com isolamento por academia. Você vê só os seus alunos, registros e configurações.",
  },
  {
    icon: Lock,
    title: "Acesso autenticado",
    body: "Quem ensina e quem administra entra com conta própria. O portal do aluno só existe se a academia liberar.",
  },
] as const;

const extras = [
  "Histórico de graduação com data",
  "Mensalidade com status explícito",
  "Documentos gerados a partir do cadastro",
  "Você confirma o pagamento quando ele acontece",
] as const;

export function LpTrust() {
  return (
    <LpSection id="seguranca" className="bg-[#dff3e8]">
      <LpReveal>
        <LpEyebrow tone="green">Segurança e transparência</LpEyebrow>
        <LpDisplay surface="light" className="mt-4 max-w-[18ch] text-[clamp(2.25rem,5vw,4rem)]">
          Os dados da academia ficam na academia
        </LpDisplay>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-neutral-700 sm:text-lg">
          Feito para quem ensina e para quem administra a academia. Sem misturar turmas, financeiro ou
          histórico com outra operação.
        </p>
      </LpReveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
        {points.map(({ icon: Icon, title, body }, i) => (
          <LpReveal key={title} delay={i * 0.08}>
            <Icon className="h-8 w-8 text-brand-green" strokeWidth={1.75} aria-hidden />
            <p className="mt-5 font-sans text-2xl font-bold tracking-[-0.03em] text-foreground">{title}</p>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-neutral-700">{body}</p>
          </LpReveal>
        ))}
      </div>

      <ul className="mt-14 grid gap-3 sm:grid-cols-2">
        {extras.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:text-base">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={3} aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <LpReveal className="mt-12 sm:mt-14">
        <LpPillCta tone="green" strong="Isolamento por academia" note="em toda a operação.">
          Criar minha academia
        </LpPillCta>
      </LpReveal>
    </LpSection>
  );
}
