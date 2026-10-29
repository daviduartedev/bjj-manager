import { Geologica } from "next/font/google";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpFistBumpHands } from "@/components/marketing/lp-fist-bump-hands";

const display = Geologica({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const ROWS = [
  { word: "Alunos", tone: "text-brand-blue" },
  { word: "Mensalidades", tone: "text-brand-green" },
  { word: "Graduação", tone: "text-foreground" },
] as const;

/** Logo após o hero: o cumprimento antes do treino, montado pelo scroll. */
export function LpFistBump() {
  return (
    <section data-testid="lp-fist-bump" className="overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-28">
      <LpFistBumpHands />
      <div className="mx-auto mt-10 max-w-3xl px-5 text-center sm:mt-14">
        <h2
          className={`${display.className} text-[clamp(1.85rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.05em] text-foreground`}
        >
          {ROWS.map(({ word, tone }) => (
            <span key={word} className="block whitespace-nowrap">
              <span className={tone}>{word}</span>{" "}
              {/* Amarelo como marca-texto: como cor de texto não tem contraste sobre branco. */}
              <span className="bg-[linear-gradient(transparent_58%,hsl(var(--brand-yellow)/0.55)_58%,hsl(var(--brand-yellow)/0.55)_92%,transparent_92%)] px-1">
                em dia
              </span>
              .
            </span>
          ))}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O Casca é a plataforma brasileira para gestão de academias de artes marciais. Academia em dia é
          academia que cresce.
        </p>
        <div className="mt-9 flex justify-center">
          <LpSignupLink />
        </div>
      </div>
    </section>
  );
}
