import { LpDisplay, LpEyebrow, LpSection } from "@/components/marketing/lp-primitives";

export function LpProductFlow() {
  return (
    <LpSection id="funcionalidades">
      <LpEyebrow>O sistema</LpEyebrow>
      <LpDisplay className="mt-6 text-[clamp(2.25rem,5.5vw,4.75rem)]">
        O que você faz
        <br />
        dentro do Casca
      </LpDisplay>
    </LpSection>
  );
}
