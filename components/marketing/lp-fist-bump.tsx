import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpFistBumpHands } from "@/components/marketing/lp-fist-bump-hands";
import { LpHighlightLines } from "@/components/marketing/lp-highlight-lines";

const ROWS = [
  { lead: "Alunos", mark: "em dia", tone: "text-brand-blue" },
  { lead: "Mensalidades", mark: "em dia", tone: "text-brand-green" },
  { lead: "Graduação", mark: "em dia", tone: "text-foreground" },
] as const;

/** Logo após o hero: o cumprimento antes do treino, montado pelo scroll. */
export function LpFistBump() {
  return (
    <section data-testid="lp-fist-bump" className="overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-28">
      <LpFistBumpHands />
      <div className="mx-auto mt-10 max-w-3xl px-5 text-center sm:mt-14">
        <LpHighlightLines as="h2" align="center" rows={ROWS} />
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
