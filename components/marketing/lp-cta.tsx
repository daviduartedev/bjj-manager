import Image from "next/image";

import { LpEnterLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// LpCta — chamada final
// ---------------------------------------------------------------------------

export function LpCta() {
  return (
    <section className="relative z-10 overflow-hidden bg-bjj-red px-5 py-24 text-center text-white sm:px-10 sm:py-32 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_38%,rgba(255,255,255,0.14),transparent_100%),radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(0,0,0,0.35),transparent_100%)]"
      />
      <LpReveal className="relative z-10 mx-auto w-full max-w-7xl">
        <Image
          src="/marketing/casca-wordmark-transparent.png"
          alt="Casca"
          width={240}
          height={44}
          quality={100}
          className="mx-auto h-10 w-auto object-contain sm:h-12"
          data-testid="landing-cta-logo"
        />

        <h2 className="mx-auto mt-8 max-w-3xl font-sans text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
          Feito para quem ensina e para quem administra a escola
        </h2>

        <p className="mx-auto mt-6 max-w-[46ch] leading-relaxed text-white/80">
          Cadastro e histórico do aluno, regras de graduação da rotina, financeiro do mês com status
          explícitos e painel que responde o que está em dia.
        </p>

        <div className="mt-10 flex justify-center">
          <LpEnterLink className="h-12 bg-white px-10 text-black hover:bg-white/90 focus-visible:ring-offset-bjj-red" />
        </div>
      </LpReveal>
    </section>
  );
}
