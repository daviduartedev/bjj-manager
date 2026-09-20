import type { ReactNode } from "react";

import { landingDisplay } from "@/components/marketing/landing-display-font";
import { LpFooter, LpHeader } from "@/components/marketing/lp-chrome";

export function MarketingLegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className={`${landingDisplay.variable} bg-black text-white`}>
      <LpHeader solid />
      <article className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="font-lp text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">
          {title}
        </h1>
        <p className="mt-4 text-sm text-white/50">Atualizado em {updated}.</p>
        <div className="mt-12 space-y-8 text-base leading-relaxed text-white/75 [&_h2]:font-lp [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-[-0.02em] [&_h2]:text-white [&_p]:max-w-[62ch] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </article>
      <LpFooter />
    </div>
  );
}
