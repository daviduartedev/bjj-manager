import { LpPillCta } from "@/components/marketing/lp-chrome";
import {
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// FAQ data — verbatim from the original landing-page.tsx (dd4d723)
// ---------------------------------------------------------------------------

const faqItems = [
  {
    q: "Para que tipo de academia o Casca serve?",
    a: "Para academias de jiu-jitsu que cadastram alunos adulto e kids, registram faixa e grau, acompanham mensalidades e precisam de um painel com o que importa no dia. O foco é quem ensina e quem administra a escola.",
  },
  {
    q: "Os dados da minha academia ficam misturados com outras?",
    a: "Não. O ambiente é multi-academia com isolamento por academia. Você vê só os seus alunos, registros e configurações.",
  },
  {
    q: "Alunos acessam o sistema?",
    a: "O professor trabalha na área operacional. Quando a academia libera o portal, o aluno entra no próprio espaço para aulas, presença e financeiro. Sem portal, o Casca continua só com a equipe interna.",
  },
  {
    q: "Integra com gateway ou cobrança automática por PIX?",
    a: "Não. Pagamentos e status são registrados manualmente quando você confirma na vida real. O controle fica na operação da escola.",
  },
  {
    q: "Posso exportar planilha ou relatório em Excel?",
    a: "Exportação em arquivo não está no escopo atual. O trabalho acontece dentro das telas do Casca.",
  },
  {
    q: "Como obtenho login?",
    a: "O primeiro usuário costuma ser criado por provisionamento junto à equipe que mantém o sistema. Use as credenciais recebidas na página Entrar.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpFaq
// ---------------------------------------------------------------------------

export function LpFaq() {
  return (
    <LpSection id="faq" className="relative z-10 bg-background">
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-28">
        {/* Left column — sticky on desktop */}
        <LpReveal>
          <div className="mb-12 lg:sticky lg:top-28 lg:mb-0">
            <LpEyebrow>FAQ</LpEyebrow>
            <LpDisplay surface="light" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
              Perguntas <span className="text-brand-blue">frequentes</span>
            </LpDisplay>
            <p className="mt-6 max-w-[36ch] leading-relaxed text-muted-foreground">
              O que donos e professores perguntam antes de entrar.
            </p>
            <LpPillCta align="start" className="mt-8">
              Criar minha academia
            </LpPillCta>
          </div>
        </LpReveal>

        {/* Right column — accordion */}
        <LpReveal delay={0.1}>
          <div className="flex flex-col gap-3">
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-[22px] border border-black/[0.06] bg-neutral-50 px-5 transition-[background-color,box-shadow] duration-300 open:bg-white open:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.18)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background sm:px-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground outline-none sm:gap-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue font-sans text-xl font-semibold leading-none text-white transition-colors group-open:bg-neutral-950"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-[56ch] pb-5 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
