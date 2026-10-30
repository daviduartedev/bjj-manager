import Link from "next/link";

import { LpAnimatedLogo } from "@/components/marketing/lp-animated-logo";
import { LP_PRIMARY_CTA } from "@/components/marketing/lp-cta-styles";
import { LpReveal } from "@/components/marketing/lp-primitives";
import { cn } from "@/lib/utils";

export function LpCta() {
  return (
    <section aria-label="Organize o próximo passo da sua academia" className="overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <div className="text-center">
          <LpAnimatedLogo />
          <LpReveal>
            <h2 className="mx-auto mt-5 max-w-[22ch] text-balance text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
              O próximo passo da sua academia começa com <span className="text-brand-green">organização.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[49ch] text-lg leading-relaxed text-muted-foreground">
              Para quem está começando e para quem já tem muita história. Junte alunos, treinos e mensalidades no Casca e cuide do que vem pela frente.
            </p>
            <Link href="/register" className={cn(LP_PRIMARY_CTA, "mt-8 min-h-14 px-8 text-base")}>
              Organizar minha academia
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Assinatura mensal a partir da adesão. Cancele quando quiser.</p>
          </LpReveal>
        </div>
      </div>
    </section>
  );
}
