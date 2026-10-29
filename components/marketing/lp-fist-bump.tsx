import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpFistBumpHands } from "@/components/marketing/lp-fist-bump-hands";
import { LpHighlightLines } from "@/components/marketing/lp-highlight-lines";
import { LpReveal } from "@/components/marketing/lp-primitives";

const ROWS = [
  { lead: "Cadastro", mark: "com contexto", tone: "text-brand-blue" },
  { lead: "Graduação", mark: "com história", tone: "text-brand-green" },
  { lead: "Mensalidade", mark: "com status", tone: "text-foreground" },
] as const;

/** Logo após o hero: o cumprimento antes do treino, montado pelo scroll. */
export function LpFistBump() {
  return (
    <section data-testid="lp-fist-bump" className="overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-28">
      <LpFistBumpHands />
      <div className="mx-auto mt-10 max-w-3xl px-5 text-center sm:mt-14">
        <LpReveal direction="scale" duration={1.05}>
          <LpHighlightLines as="h2" align="center" rows={ROWS} />
        </LpReveal>
        <LpReveal direction="left" delay={0.08}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            O cumprimento abre o treino. O Casca registra o que vem depois: quem entrou, quem evoluiu e o
            que precisa de atenção antes da próxima aula.
          </p>
        </LpReveal>
        <LpReveal direction="right" delay={0.14}>
          <div className="mt-9 flex justify-center">
            <LpSignupLink>Começar com o Casca</LpSignupLink>
          </div>
        </LpReveal>
      </div>
    </section>
  );
}
