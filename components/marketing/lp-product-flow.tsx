import {
  LpBrowserFrame,
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const modules = [
  {
    number: "01",
    title: "Alunos",
    src: "/marketing/lp-real-alunos.png",
    alt: "Lista de alunos no Casca",
    url: "casca.app/alunos",
    body: "Lista e ficha completa. Tipo adulto ou kids, contato, status, observações. Cada aluno carrega faixa atual, grau, histórico e a situação financeira do mês.",
  },
  {
    number: "02",
    title: "Graduação",
    src: "/marketing/lp-real-graduacao.png",
    alt: "Histórico de graduação no Casca",
    url: "casca.app/alunos",
    body: "Promoção de grau ou faixa com data e histórico. Se houver pulo de ordem, o sistema pede justificativa antes de concluir.",
  },
  {
    number: "03",
    title: "Mensalidades",
    src: "/marketing/lp-real-mensalidades.png",
    alt: "Resumo de mensalidades no Casca",
    url: "casca.app/mensalidades",
    body: "Preço efetivo e dia de vencimento por aluno. Status explícito. Você confirma o pagamento quando ele acontece na vida real.",
  },
  {
    number: "04",
    title: "Painel",
    src: "/marketing/lp-real-painel.png",
    alt: "Painel do Casca com indicadores do dia",
    url: "casca.app/painel",
    body: "Alunos ativos, mensalidades em atraso, aniversariantes do mês, distribuição por faixa. Atalhos para agir no mesmo dia.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpProductFlow
// ---------------------------------------------------------------------------

export function LpProductFlow() {
  return (
    <LpSection id="funcionalidades">
      {/* Header */}
      <LpReveal>
        <LpEyebrow>O sistema</LpEyebrow>
        <LpDisplay className="mt-6 text-[clamp(2.25rem,5.5vw,4.5rem)]">
          O que você faz
          <br />
          dentro do Casca
        </LpDisplay>
        <p className="mt-6 max-w-[52ch] text-white/60 leading-relaxed">
          Cadastro de alunos adulto e kids, ficha com faixa e grau, histórico de graduação, planos
          Kids 1, Kids 2 e Adulto, mensalidade do mês e o painel do dia.
        </p>
      </LpReveal>

      {/* Modules */}
      <div className="mt-16 space-y-16 sm:space-y-24">
        {modules.map((mod, i) => {
          const isOdd = i % 2 !== 0;
          return (
            <LpReveal key={mod.number}>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                {/* Screenshot */}
                <div className={isOdd ? "lg:order-2" : undefined}>
                  <LpBrowserFrame src={mod.src} alt={mod.alt} url={mod.url} />
                </div>

                {/* Copy */}
                <div>
                  <p className="font-lp text-sm font-bold text-bjj-red tracking-[0.2em]">
                    {mod.number}
                  </p>
                  <LpDisplay className="text-[clamp(2rem,4vw,3.25rem)] mt-3">{mod.title}</LpDisplay>
                  <p className="mt-4 max-w-[46ch] text-white/65 leading-relaxed">{mod.body}</p>
                </div>
              </div>
            </LpReveal>
          );
        })}
      </div>
    </LpSection>
  );
}
