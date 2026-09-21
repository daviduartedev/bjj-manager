import { LpFooter, LpHeader } from "@/components/marketing/lp-chrome";
import { LpCta } from "@/components/marketing/lp-cta";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpProblem } from "@/components/marketing/lp-problem";
import { LpProductFlow } from "@/components/marketing/lp-product-flow";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

export function LandingPage() {
  return (
    <main
      className="bg-[#070707] text-white"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(191,30,39,0.10), transparent)",
          "radial-gradient(ellipse 55% 40% at 88% 42%, rgba(255,255,255,0.035), transparent)",
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
      }}
    >
      <LpHeader />
      <h1 className="sr-only">
        Casca. Alunos, faixa e mensalidade na mesma ficha, para academias de jiu-jitsu.
      </h1>
      <LpHero />
      <LpProblem />
      <LpProductFlow />
      <LpSystemVideo />
      <LpFaq />
      <LpCta />
      <LpFooter />
    </main>
  );
}
