import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal } from "@/components/marketing/lp-primitives";

const steps = [
  {
    n: "01",
    title: "Cadastre a academia",
    body: "Aluno adulto ou kids, plano, faixa e grau de partida, contato e observações. A ficha nasce completa e organizada.",
  },
  {
    n: "02",
    title: "Registre a rotina",
    body: "Promova grau ou faixa com data, confirme a mensalidade quando ela acontece e gere certificados e recibos.",
  },
  {
    n: "03",
    title: "Acompanhe o dia",
    body: "O painel mostra atrasos, aniversariantes e alertas de graduação. Você abre e já sabe onde agir.",
  },
] as const;

export function LpHowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-16 bg-brand-green px-5 py-24 text-white sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <LpReveal>
          <LpEyebrow className="text-white/75">Como funciona</LpEyebrow>
          <LpDisplay surface="dark" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
            Da matrícula ao fim do mês,
            <br />
            <span className="text-brand-yellow">sem planilha solta</span>
          </LpDisplay>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg">
            Três movimentos simples que cobrem o dia a dia de quem ensina e de quem administra a academia.
          </p>
        </LpReveal>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-12 lg:grid-cols-3 lg:gap-16">
          {steps.map(({ n, title, body }, i) => (
            <LpReveal key={title} delay={i * 0.08}>
              <p className="font-sans text-sm font-semibold tracking-[0.18em] text-brand-yellow">{n}</p>
              <p className="mt-5 font-sans text-2xl font-bold tracking-[-0.03em] lg:text-[1.75rem]">{title}</p>
              <p className="mt-3 text-base leading-relaxed text-white/75">{body}</p>
            </LpReveal>
          ))}
        </div>

        <LpReveal className="mt-14 sm:mt-16">
          <LpPillCta tone="yellow" strong="Adulto, Kids 1 e Kids 2" note="no mesmo cadastro.">
            Começar o cadastro
          </LpPillCta>
        </LpReveal>
      </div>
    </section>
  );
}
