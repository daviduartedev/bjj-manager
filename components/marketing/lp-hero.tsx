import { Geologica } from "next/font/google";
import Link from "next/link";

import { LpReveal } from "@/components/marketing/lp-primitives";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

const heroDisplay = Geologica({ subsets: ["latin"], weight: "700", display: "swap" });

export function LpHero() {
  return (
    <section aria-label="Conheça o Casca" className="bg-white pb-8 pt-32 sm:pt-44">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <LpReveal onLoad>
          <h1 className={`${heroDisplay.className} max-w-[19ch] text-[clamp(2.75rem,6.1vw,5.25rem)] leading-[1.06] tracking-[-0.055em] text-foreground`}>
            Sua academia <span className="text-brand-blue">organizada</span> para dar o{" "}
            <span className="text-brand-green">próximo passo.</span>
          </h1>
        </LpReveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
          <LpReveal onLoad delay={0.1}>
            <p className="max-w-[57ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Você dá aula, acompanha os alunos e ainda cuida do negócio. O Casca reúne cadastros,
              treinos e mensalidades em uma plataforma brasileira para ajudar sua academia a crescer.
            </p>
          </LpReveal>
          <LpReveal onLoad delay={0.18}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
                Organizar minha academia
              </Link>
              <Link href="#sistema" className="inline-flex min-h-12 items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
                Conhecer o Casca
              </Link>
            </div>
          </LpReveal>
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-7 text-muted-foreground">
          <span className="font-medium text-foreground">Muay Thai, Boxe, Jiu-Jítsu e Judô.</span>{" "}
          Cada modalidade com sua história. Sua academia com tudo organizado.
        </p>
        <LpReveal className="mt-12 sm:mt-16" direction="scale">
          <div className="overflow-hidden rounded-2xl border border-border bg-white p-1.5 sm:rounded-3xl sm:p-2">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl">
              <LpSystemVideo compact />
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Um olhar por dentro do Casca. Demonstração com dados de exemplo.</p>
        </LpReveal>
      </div>
    </section>
  );
}
