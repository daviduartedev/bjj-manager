import { LpAudience } from "@/components/marketing/lp-audience";
import { LpBelts } from "@/components/marketing/lp-belts";
import { LpHeader } from "@/components/marketing/lp-chrome";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpFistBump } from "@/components/marketing/lp-fist-bump";
import { LpFooter } from "@/components/marketing/lp-footer";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpHowItWorks } from "@/components/marketing/lp-how-it-works";
import { LpProductFlow } from "@/components/marketing/lp-product-flow";
import { LpPricing } from "@/components/marketing/lp-pricing";
import { LpTrust } from "@/components/marketing/lp-trust";

/**
 * Ordem das seções:
 * hero (com o sistema em uso) → cumprimento → funcionalidades → como funciona →
 * faixas e graus → para quem → segurança → FAQ → CTA (azul) → rodapé (escuro).
 */
export function LandingPage() {
  return (
    <div
      id="top"
      className="relative min-h-screen overflow-x-clip bg-white text-foreground [--background:0_0%_100%]"
    >
      <main className="relative z-10">
        <LpHeader />
        <LpHero />
        <LpFistBump />
        <LpProductFlow />
        <LpHowItWorks />
        <LpBelts />
        <LpAudience />
        <LpTrust />
        <LpPricing />
        <LpFaq />
        <LpCta />
      </main>
      <LpFooter />
    </div>
  );
}
