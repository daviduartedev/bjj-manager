import { Geologica } from "next/font/google";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

const heroDisplay = Geologica({ subsets: ["latin"], weight: "700", display: "swap" });
const HERO_EMPHASIS = "bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent forced-colors:bg-none forced-colors:text-[CanvasText]";

export function LpHero() {
  return (
    <section aria-label="Conheça o Casca" className="bg-white pb-8 pt-32 sm:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <LpReveal onLoad>
          <h1 className={`${heroDisplay.className} max-w-[22ch] text-balance text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.08] tracking-[-0.05em] text-foreground md:max-w-none`}>
            A plataforma <span className={HERO_EMPHASIS}>brasileira</span> para gestão de{" "}
            <br className="hidden md:block" />
            <span className={`${HERO_EMPHASIS} md:whitespace-nowrap`}>academias de artes{" "}<span className="whitespace-nowrap">marciais.<svg aria-hidden focusable="false" viewBox="0 0 48 48" fill="currentColor" className="ml-2 inline-block size-[0.7em] align-baseline text-brand-yellow">
              <path d="M24 0C27.5 14 34 20.5 48 24C34 27.5 27.5 34 24 48C20.5 34 14 27.5 0 24C14 20.5 20.5 14 24 0Z" />
            </svg></span></span>
          </h1>
        </LpReveal>
        <div className="mt-8">
          <p className="max-w-[57ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Você dá aula, acompanha os alunos e ainda cuida do negócio. O Casca reúne cadastros,
            treinos e mensalidades em uma plataforma brasileira para ajudar sua academia a crescer.
          </p>
          <div className="mt-8 flex justify-center"><LpSignupLink>Organizar minha academia</LpSignupLink></div>
        </div>
        <LpReveal className="mt-12 sm:mt-16" direction="scale">
          <div className="overflow-hidden rounded-2xl border border-border bg-white p-1.5 sm:rounded-3xl sm:p-2">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl">
              <LpSystemVideo compact />
            </div>
          </div>
        </LpReveal>
      </div>
    </section>
  );
}
