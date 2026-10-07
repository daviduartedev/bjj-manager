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
    <LpSection id="faq">
      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        {/* Left column — sticky on desktop */}
        <LpReveal>
          <div className="lg:sticky lg:top-28 mb-12 lg:mb-0">
            <LpEyebrow>FAQ</LpEyebrow>
            <LpDisplay className="mt-6 text-[clamp(2.25rem,5vw,4rem)]">
              Perguntas frequentes
            </LpDisplay>
            <p className="mt-6 max-w-[36ch] leading-relaxed text-white/60">
              O que donos e professores perguntam antes de entrar.
            </p>
          </div>
        </LpReveal>

        {/* Right column — accordion */}
        <LpReveal delay={0.1}>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span aria-hidden className="font-sans text-2xl font-semibold text-bjj-red group-open:hidden">
                    +
                  </span>
                  <span
                    aria-hidden
                    className="hidden font-sans text-2xl font-semibold text-bjj-red group-open:inline"
                  >
                    −
                  </span>
                </summary>
                <p className="max-w-[56ch] pb-5 leading-relaxed text-white/60">{a}</p>
              </details>
            ))}
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
