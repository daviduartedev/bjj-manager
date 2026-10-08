import { LpAtmosphere } from "@/components/marketing/lp-atmosphere";
import { LpFooter, LpHeader } from "@/components/marketing/lp-chrome";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpProductFlow } from "@/components/marketing/lp-product-flow";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <main className="relative z-10">
        <LpHeader />
        <h1 className="sr-only">
          Casca. Se preocupe apenas em dar aula. No Casca, você visualiza e organiza toda a gestão da sua academia em um só lugar.
        </h1>
        <div className="relative">
          <LpAtmosphere />
          <LpHero />
        </div>
        <LpProductFlow />
        <LpSystemVideo />
        <LpFaq />
        <LpCta />
        <LpFooter />
      </main>
    </div>
  );
}
