import Link from "next/link";

import { LpAnimatedLogo } from "@/components/marketing/lp-animated-logo";
import { LpReveal } from "@/components/marketing/lp-primitives";

export function LpCta() {
  return (
    <section aria-label="Organize o próximo passo da sua academia" className="overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <div className="border-t border-border pt-12 text-center sm:pt-16">
          <LpAnimatedLogo />
          <LpReveal>
            <h2 className="mx-auto mt-5 max-w-[22ch] text-balance text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
              O próximo passo da sua academia começa com <span className="text-brand-green">organização.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[49ch] text-lg leading-relaxed text-muted-foreground">
              Para quem está começando e para quem já tem muita história. Junte alunos, treinos e mensalidades no Casca e cuide do que vem pela frente.
            </p>
            <Link href="/register" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-brand-blue px-8 text-base font-semibold text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
              Organizar minha academia
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Assinatura mensal a partir da adesão. Cancele quando quiser.</p>
          </LpReveal>
        </div>
      </div>
    </section>
  );
}
