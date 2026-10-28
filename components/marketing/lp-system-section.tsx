import { LpSystemVideo } from "@/components/marketing/lp-system-video";
import { LpDisplay, LpEyebrow, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

export function LpSystemSection() {
  return (
    <LpSection className="bg-card">
      <LpReveal>
        <LpEyebrow>O sistema rodando</LpEyebrow>
        <LpDisplay surface="light" className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)]">
          Veja o Casca em uso
        </LpDisplay>
      </LpReveal>
      <LpReveal delay={0.08} className="mt-12 sm:mt-14">
        <LpSystemVideo />
      </LpReveal>
    </LpSection>
  );
}
