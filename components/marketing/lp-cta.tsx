import Image from "next/image";

import { LpEnterLink } from "@/components/marketing/lp-chrome";
import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// LpCta — final call-to-action section
// ---------------------------------------------------------------------------

export function LpCta() {
  return (
    <LpSection className="relative isolate overflow-hidden text-center">
      {/* Radial red glow — same pattern as hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bjj-red/15 blur-[120px]"
      />

      <LpReveal>
        <Image
          src="/uf.png"
          alt="Casca"
          width={240}
          height={72}
          quality={100}
          className="mx-auto h-12 w-auto object-contain sm:h-14"
          data-testid="landing-cta-logo"
        />

        <h2 className="font-lp mx-auto mt-8 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold uppercase !leading-[1.05] tracking-[-0.02em] text-white">
          Feito para quem ensina e para quem administra a escola
        </h2>

        <p className="mx-auto mt-6 max-w-[46ch] leading-relaxed text-white/65">
          Cadastro e histórico do aluno, regras de graduação da rotina, financeiro do mês com status
          explícitos e painel que responde o que está em dia.
        </p>

        <div className="mt-10 flex justify-center">
          <LpEnterLink className="h-12 px-10" />
        </div>
      </LpReveal>
    </LpSection>
  );
}
