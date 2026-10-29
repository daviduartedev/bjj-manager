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
    a: "Para academias de artes marciais que cadastram alunos adulto e kids, registram faixa e grau, acompanham mensalidades e precisam de um painel com o que importa no dia. O foco é quem ensina e quem administra a academia.",
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
    q: "Como funcionam os pagamentos?",
    a: "A assinatura da academia no Casca é cobrada pelo AbacatePay. As mensalidades dos alunos continuam no controle da academia: você registra o pagamento quando confirma o recebimento na vida real.",
  },
  {
    q: "Posso exportar planilha ou relatório em Excel?",
    a: "Exportação em arquivo não está no escopo atual. O trabalho acontece dentro das telas do Casca.",
  },
  {
    q: "Como obtenho login?",
    a: "Escolha um plano, cadastre sua academia e confirme o e-mail. Depois, conclua a adesão com cartão para iniciar os 3 dias de teste. O plano é cobrado automaticamente ao final do teste; cancele antes para não ser cobrado.",
  },
  {
    q: "O que acontece se eu cancelar ou não pagar?",
    a: "Ao cancelar, você mantém o acesso até o fim do período pago. Sem pagamento regularizado, a academia fica em modo somente leitura, com os dados e históricos preservados.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpFaq
// ---------------------------------------------------------------------------

export function LpFaq() {
  return (
    <LpSection id="faq" className="relative z-10 bg-[#f3faf6]">
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
          <div className="flex flex-col divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="group has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#f3faf6]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground outline-none sm:gap-6 sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green font-sans text-xl font-semibold leading-none text-white"
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
