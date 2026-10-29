import { LpSaluteArt, type SaluteKind } from "@/components/marketing/lp-salute-art";
import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const SALUTES: ReadonlyArray<{ kind: SaluteKind; art: string; word?: string }> = [
  { kind: "oss", art: "Jiu-jitsu", word: "OSS" },
  { kind: "wai", art: "Muay Thai", word: "SAWADEE" },
  { kind: "taekwondo", art: "Taekwondo" },
  { kind: "boxe", art: "Boxe" },
];

/** Quatro artes, quatro cumprimentos, no mesmo traço do soquinho depois do hero. */
export function LpSalutes() {
  return (
    <LpSection id="cumprimentos" className="bg-[#F5F3F0]">
      <LpReveal direction="left" duration={1.05}>
        <LpDisplay surface="light" className="max-w-[16ch] text-balance text-[clamp(2.25rem,5vw,4rem)]">
          Todo treino começa com um cumprimento.
        </LpDisplay>
        <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Cada arte tem o seu. Depois dele, o Casca cuida da rotina da academia.
        </p>
      </LpReveal>

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-5 lg:grid-cols-4">
        {SALUTES.map(({ kind, art, word }) => (
          <li key={kind}>
            <figure className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white">
              <div className="px-2 pt-4 sm:px-4 sm:pt-6">
                <LpSaluteArt kind={kind} word={word} />
              </div>
              <figcaption className="mt-auto px-4 pb-4 pt-2 text-base font-semibold tracking-[-0.02em] text-neutral-950 sm:px-6 sm:pb-6 sm:text-lg">
                {art}
                {word ? <span className="sr-only">: {word}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
