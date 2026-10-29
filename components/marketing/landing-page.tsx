import { LpBelts } from "@/components/marketing/lp-belts";
import { LpHeader } from "@/components/marketing/lp-header";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpFistBump } from "@/components/marketing/lp-fist-bump";
import { LpFooter } from "@/components/marketing/lp-footer";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpHowItWorks } from "@/components/marketing/lp-how-it-works";
import { LpPricing } from "@/components/marketing/lp-pricing";
import { LpProductOverview } from "@/components/marketing/lp-product-overview";
import { LpSalutes } from "@/components/marketing/lp-salutes";

/** Uma narrativa curta: posição → rotina → processo → especialidade → cumprimentos → oferta. */
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
        <LpProductOverview />
        <LpHowItWorks />
        <LpBelts />
        <LpSalutes />
        <LpPricing />
        <LpFaq />
        <LpCta />
      </main>
      <LpFooter />
    </div>
  );
}
