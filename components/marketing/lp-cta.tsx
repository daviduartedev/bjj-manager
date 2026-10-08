import Image from "next/image";

import { LpEnterLink } from "@/components/marketing/lp-chrome";
import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// LpCta — final call-to-action section
// ---------------------------------------------------------------------------

export function LpCta() {
  return (
    <LpSection className="bg-black text-center">
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

        <h2 className="mx-auto mt-8 max-w-3xl font-sans text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
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
