import { Building2, KeyRound, Minus, ShieldCheck } from "lucide-react";

import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const guarantees = [
  {
    icon: Building2,
    title: "Isolamento por academia",
    body: "O ambiente é multi-academia. Você enxerga só os seus alunos, registros e configurações.",
  },
  {
    icon: KeyRound,
    title: "Acesso por login",
    body: "O primeiro usuário é provisionado junto à equipe que mantém o sistema. Depois, cada pessoa entra com as próprias credenciais.",
  },
  {
    icon: ShieldCheck,
    title: "Controle na operação",
    body: "Pagamentos e status são registrados por você, quando acontecem na vida real. Sem automatismo surpresa.",
  },
] as const;

const outOfScope = [
  "Cobrança automática por PIX ou gateway de pagamento",
  "Exportação de planilha ou relatório em Excel",
] as const;

export function LpTrust() {
  return (
    <LpSection id="seguranca" className="relative z-10 overflow-hidden bg-white text-neutral-950">
      <LpReveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bjj-red">
          Segurança e transparência
        </p>
        <LpDisplay surface="light" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
          Seus dados, só seus.
          <br />
          E o que o Casca ainda não faz.
        </LpDisplay>
      </LpReveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
          {guarantees.map(({ icon: Icon, title, body }, i) => (
            <LpReveal key={title} delay={i * 0.08}>
              <div className="flex h-full gap-5 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.3)] sm:flex-col lg:flex-row">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03]">
                  <Icon className="h-5 w-5 text-neutral-800" aria-hidden />
                </span>
                <div>
                  <p className="font-sans text-lg font-semibold tracking-[-0.02em]">{title}</p>
                  <p className="mt-1.5 leading-relaxed text-black/60">{body}</p>
                </div>
              </div>
            </LpReveal>
          ))}
        </div>

        <LpReveal delay={0.15} className="h-full">
          <div className="flex h-full flex-col rounded-3xl bg-neutral-950 p-8 text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Fora do escopo hoje
            </p>
            <p className="mt-4 font-sans text-2xl font-semibold tracking-[-0.02em]">
              Direto ao ponto, antes de você decidir
            </p>
            <ul className="mt-8 space-y-4">
              {outOfScope.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/75">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Minus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 text-sm leading-relaxed text-white/50">
              O trabalho acontece dentro das telas do Casca, com o controle da mensalidade na mão de quem
              administra a escola.
            </p>
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
