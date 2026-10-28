import Image from "next/image";

import { LpCtaNotes, LpOutlineLink, LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// LpCta — chamada final (card azul dentro da página clara)
// ---------------------------------------------------------------------------

export function LpCta() {
  return (
    <section className="relative z-10 bg-card px-5 pb-16 pt-2 sm:px-10 sm:pb-20 sm:pt-4 lg:px-16 lg:pb-24">
      <LpReveal className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_24px_50px_-28px_rgba(0,40,80,0.55)] sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <Image
            src="/marketing/casca-logo-light.png"
            alt="Casca"
            width={3068}
            height={945}
            quality={100}
            className="mx-auto h-12 w-auto object-contain sm:h-14"
            data-testid="landing-cta-logo"
          />

          <h2 className="mx-auto mt-8 max-w-3xl text-balance font-sans text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em] text-primary-foreground">
            Feito para quem ensina e para quem administra a escola
          </h2>

          <p className="mx-auto mt-6 max-w-[46ch] leading-relaxed text-primary-foreground/80">
            Cadastro e histórico do aluno, regras de graduação da rotina, financeiro do mês com status
            explícitos e painel que responde o que está em dia.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LpSignupLink className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:ring-white focus-visible:ring-offset-primary" />
            <LpOutlineLink href="/login" onDark>
              Entrar
            </LpOutlineLink>
          </div>
          <LpCtaNotes onDark />
        </div>
      </LpReveal>
    </section>
  );
}
