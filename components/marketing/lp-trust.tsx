import { Building2, KeyRound, Minus, ShieldCheck } from "lucide-react";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal } from "@/components/marketing/lp-primitives";

const guarantees = [
  {
    icon: Building2,
    chip: "bg-brand-blue text-white",
    title: "Isolamento por academia",
    body: "O ambiente é multi-academia. Você enxerga só os seus alunos, registros e configurações.",
  },
  {
    icon: KeyRound,
    chip: "bg-brand-green text-white",
    title: "Acesso por login",
    body: "O primeiro usuário é provisionado junto à equipe que mantém o sistema. Depois, cada pessoa entra com as próprias credenciais.",
  },
  {
    icon: ShieldCheck,
    chip: "bg-brand-yellow text-neutral-950",
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
    <section id="seguranca" className="relative bg-background px-3 py-6 sm:px-4 lg:py-10">
      <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 px-5 py-20 text-white sm:rounded-[44px] sm:px-10 sm:py-28 lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-brand-blue/25 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <LpReveal>
            <LpEyebrow className="text-white/70">Segurança e transparência</LpEyebrow>
            <LpDisplay surface="dark" className="mt-4 text-[clamp(1.7rem,4.8vw,3.75rem)]">
              Seus dados, <span className="text-brand-yellow">só seus</span>.
              <br />
              E o que o Casca <br className="sm:hidden" />ainda não faz.
            </LpDisplay>
          </LpReveal>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 lg:grid-cols-3">
            {guarantees.map(({ icon: Icon, chip, title, body }, i) => (
              <LpReveal key={title} delay={i * 0.08} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white/[0.08] sm:gap-5 sm:p-6 lg:flex-col lg:p-8">
                  <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${chip}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-sans text-lg font-semibold tracking-[-0.02em] lg:text-xl">{title}</p>
                    <p className="mt-1.5 leading-relaxed text-white/70">{body}</p>
                  </div>
                </div>
              </LpReveal>
            ))}

            <LpReveal delay={0.15} className="lg:col-span-3">
              <div className="rounded-[28px] border border-dashed border-white/20 p-7 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
                  <div>
                    <p className="text-sm font-semibold text-brand-yellow">Fora do escopo hoje</p>
                    <p className="mt-3 font-sans text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-[1.75rem]">
                      Direto ao ponto, antes de você decidir
                    </p>
                  </div>
                  <div>
                    <ul className="space-y-4">
                      {outOfScope.map((item) => (
                        <li key={item} className="flex items-start gap-3 leading-relaxed text-white/85">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                            <Minus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-sm leading-relaxed text-white/60">
                      O trabalho acontece dentro das telas do Casca, com o controle da mensalidade na mão de quem
                      administra a escola.
                    </p>
                  </div>
                </div>
              </div>
            </LpReveal>
          </div>

          <LpReveal className="mt-12 sm:mt-14">
            <LpPillCta tone="white" strong="Dados só da sua academia." note="Você confirma cada pagamento.">
              Criar academia
            </LpPillCta>
          </LpReveal>
        </div>
      </div>
    </section>
  );
}
