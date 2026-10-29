import Image from "next/image";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";

/** CTA final em degradê, no mesmo espírito da faixa de fechamento da AbacatePay. */
export function LpCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef8f2_38%,#8ed4a8_72%,#1f7a4d_100%)] px-5 pb-0 pt-24 sm:px-10 sm:pt-32 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(ellipse_at_center,hsl(var(--brand-green)/0.35)_0%,transparent_70%)]"
      />

      <Image
        src="/marketing/logo-emblem-light.png"
        alt=""
        width={720}
        height={720}
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-24 hidden w-[min(42vw,28rem)] select-none opacity-80 lg:block"
      />
      <Image
        src="/marketing/logo-emblem-light.png"
        alt=""
        width={720}
        height={720}
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-28 hidden w-[min(42vw,28rem)] scale-x-[-1] select-none opacity-80 lg:block"
      />

      <LpReveal className="relative z-10 mx-auto max-w-3xl pb-40 text-center sm:pb-52">
        <Image
          src="/marketing/casca-logo-dark.png"
          alt="Casca"
          width={3068}
          height={945}
          className="mx-auto h-8 w-auto sm:h-10"
          data-testid="landing-cta-logo"
        />
        <h2 className="mt-8 text-balance font-sans text-[clamp(2.15rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-neutral-950">
          Sua academia de artes marciais, em um só sistema.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-neutral-700 sm:text-lg">
          Cadastro em minutos, 3 dias de teste com cartão e a primeira cobrança só depois do período de
          avaliação.
        </p>
        <div className="mt-8 flex justify-center">
          <LpSignupLink className="h-14 rounded-full bg-brand-green px-8 text-sm text-white hover:bg-brand-green/90" />
        </div>
        <p className="mt-4 text-sm text-neutral-700/80">Sem mensalidade do aluno no meio. Você confirma o recebimento.</p>
      </LpReveal>
    </section>
  );
}
