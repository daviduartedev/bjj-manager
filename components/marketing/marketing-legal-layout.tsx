import type { ReactNode } from "react";

import { LpHeader } from "@/components/marketing/lp-chrome";
import { LpFooter } from "@/components/marketing/lp-footer";

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
    <div className="bg-black text-white">
      <LpHeader solid />
      <article className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="font-sans text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-4 text-sm text-white/50">Atualizado em {updated}.</p>
        <div className="mt-12 space-y-8 text-base leading-relaxed text-white/75 [&_h2]:font-sans [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-white [&_p]:max-w-[62ch] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </article>
      <LpFooter />
    </div>
  );
}
