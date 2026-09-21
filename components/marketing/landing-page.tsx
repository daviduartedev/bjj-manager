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
      className="relative bg-[#070707] text-white"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(191,30,39,0.14), transparent)",
          "radial-gradient(ellipse 50% 35% at 90% 30%, rgba(255,255,255,0.05), transparent)",
          "radial-gradient(ellipse 55% 40% at 5% 65%, rgba(191,30,39,0.06), transparent)",
          "radial-gradient(ellipse 45% 35% at 80% 95%, rgba(255,255,255,0.04), transparent)",
        ].join(", "),
        backgroundSize: "100% 100%",
      }}
    >
      {/* Grain sutil por cima do mesh gradient (textura, sem padrão geométrico) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />
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
