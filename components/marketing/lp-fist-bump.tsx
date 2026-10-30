import { LpFistBumpHands } from "@/components/marketing/lp-fist-bump-hands";
import { LpReveal } from "@/components/marketing/lp-primitives";

export function LpFistBump() {
  return (
    <section data-testid="lp-fist-bump" aria-label="Junto de quem faz a academia acontecer" className="overflow-hidden bg-white pb-12 pt-16 sm:pb-20 sm:pt-24">
      <LpFistBumpHands />
      <LpReveal className="mx-auto mt-6 max-w-3xl px-5 text-center sm:mt-10">
        <h2 className="text-balance text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-5xl">
          Quem faz a academia acontecer <span className="text-brand-blue">não precisa fazer tudo de cabeça.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground sm:text-lg">
          Tem aluno chegando. Tem treino começando. Tem academia para cuidar.
          O Casca está junto para organizar o que acontece entre uma aula e outra.
        </p>
      </LpReveal>
    </section>
  );
}
