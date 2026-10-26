import { LpAtmosphere } from "@/components/marketing/lp-atmosphere";
import { LpAudience } from "@/components/marketing/lp-audience";
import { LpBelts } from "@/components/marketing/lp-belts";
import { LpHeader } from "@/components/marketing/lp-chrome";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpFooter } from "@/components/marketing/lp-footer";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpHowItWorks } from "@/components/marketing/lp-how-it-works";
import { LpProductFlow } from "@/components/marketing/lp-product-flow";
import { LpTrust } from "@/components/marketing/lp-trust";

/**
 * Ordem das seções (fundos alternando preto e branco):
 * hero (com o vídeo) → funcionalidades → como funciona → faixas e graus → para quem →
 * segurança → FAQ → CTA (vermelho) → rodapé (escuro).
 */
export function LandingPage() {
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden bg-black text-white">
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
        <LpHowItWorks />
        <LpBelts />
        <LpAudience />
        <LpTrust />
        <LpFaq />
        <LpCta />
      </main>
      <LpFooter />
    </div>
  );
}
