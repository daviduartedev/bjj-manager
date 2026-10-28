import { Geologica } from "next/font/google";

import { LpOutlineLink, LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

const heroDisplay = Geologica({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const CAPABILITIES = ["Alunos", "Mensalidades", "Graduação", "Aulas", "Pagamentos"] as const;

/** Hero empilhado: texto alinhado à esquerda e o vídeo do produto em moldura clara logo abaixo. */
export function LpHero() {
  return (
    <section className="bg-white pb-8 pt-28 sm:pb-10 sm:pt-36">
      <LpReveal onLoad className="mx-auto w-full max-w-7xl px-3 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <h1
            className={`${heroDisplay.className} text-[clamp(2.5rem,5.2vw,4.75rem)] leading-[1.02] tracking-[-0.05em] text-foreground`}
          >
            A plataforma brasileira para gestão de academias de artes marciais.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Alunos, mensalidades, aulas e a rotina da academia organizados em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LpSignupLink />
            <LpOutlineLink href="#sistema">Ver o sistema</LpOutlineLink>
          </div>
        </div>

        <div className="mt-12 rounded-[1.5rem] border border-black/[0.06] bg-[#f3f4f6] p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-28px_rgba(16,24,40,0.28)] sm:mt-16 sm:rounded-[2rem] sm:p-3">
          <div className="overflow-hidden rounded-[1.1rem] border border-white bg-[#111416] sm:rounded-[1.5rem]">
            <LpSystemVideo compact />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-4 border-b border-border py-9 text-foreground sm:justify-between">
          {CAPABILITIES.map((capability) => (
            <span
              key={capability}
              className={`${heroDisplay.className} text-lg tracking-[-0.03em] sm:text-2xl lg:text-[1.65rem]`}
            >
              {capability}
            </span>
          ))}
        </div>
      </LpReveal>
    </section>
  );
}
