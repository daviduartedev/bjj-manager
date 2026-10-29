import Link from "next/link";

import { LpAnimatedLogo } from "@/components/marketing/lp-animated-logo";
import { LpMark, LpReveal } from "@/components/marketing/lp-primitives";

export function LpCta() {
  return (
    <section className="relative overflow-hidden bg-brand-blue px-5 pb-32 pt-20 text-white sm:px-10 sm:pb-40 sm:pt-28 lg:px-16">
      <div className="mx-auto max-w-4xl text-center">
        <LpAnimatedLogo />
        <LpReveal direction="scale" duration={1.1}>
          <h2 className="mx-auto mt-4 max-w-[18ch] text-balance font-sans text-[clamp(2.15rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
            Sua academia ensina. O Casca deixa a operação pronta para o <LpMark className="text-neutral-950">próximo treino</LpMark>.
          </h2>
        </LpReveal>
        <LpReveal direction="left" delay={0.08}>
          <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg">
            Cadastre alunos, registre graduações, acompanhe mensalidades e abra o painel sabendo o que pede
            atenção hoje.
          </p>
        </LpReveal>
        <LpReveal direction="right" delay={0.14}>
          <div className="mt-9 flex justify-center">
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-brand-green px-8 text-sm font-semibold text-white outline-none transition-[background-color,transform] duration-200 hover:-translate-y-1 hover:bg-brand-green/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue active:translate-y-0"
            >
              Criar minha academia
            </Link>
          </div>
        </LpReveal>
        <LpReveal direction="up" delay={0.2}>
          <p className="mt-4 text-sm text-white/65">Cobrança mensal na adesão. Cancele quando quiser.</p>
        </LpReveal>
      </div>
    </section>
  );
}
