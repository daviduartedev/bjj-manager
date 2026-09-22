import { LpFooter, LpHeader } from "@/components/marketing/lp-chrome";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpProductFlow } from "@/components/marketing/lp-product-flow";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

export function LandingPage() {
  return (
    <main className="bg-black text-white">
      <LpHeader />
      <h1 className="sr-only">
        Casca. Alunos, faixa e mensalidade no mesmo lugar, para academias de jiu-jitsu.
      </h1>
      <LpHero />
      <LpProductFlow />
      <LpSystemVideo />
      <LpFaq />
      <LpCta />
      <LpFooter />
    </main>
  );
}
