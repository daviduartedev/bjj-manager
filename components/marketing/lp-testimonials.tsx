"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import {
  LANDING_ACADEMIES,
  LANDING_TESTIMONIALS,
  type LandingAcademy,
  type LandingTestimonial,
} from "@/components/marketing/lp-testimonials-content";
import { cn } from "@/lib/utils";

/** Verdes da seção derivados do token da marca: escuro para os cartões, claro para selo e destaque. */
const SECTION_COLORS = {
  "--lp-depo-escuro": "color-mix(in srgb, hsl(var(--brand-green)) 40%, black)",
  "--lp-depo-claro": "color-mix(in oklch, color-mix(in oklch, hsl(var(--brand-green)) 65%, hsl(var(--brand-yellow))) 60%, white)",
} as CSSProperties;

function TestimonialBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded-full bg-[var(--lp-depo-claro)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--lp-depo-escuro)]", className)}>
      Depoimento
    </span>
  );
}

/** Logo ao lado do nome da academia: decorativa, porque o nome já está escrito ao lado. */
function AcademyLogo({ academy, size }: { academy: LandingAcademy; size: "sm" | "lg" }) {
  const dimensions = size === "sm" ? "size-8" : "size-12";
  if (academy.logo) {
    return (
      <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5", dimensions)}>
        <Image src={academy.logo} alt="" fill sizes="48px" className="object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-brand-green font-bold text-white", dimensions, size === "sm" ? "text-[10px]" : "text-sm")}
    >
      {academy.initials}
    </span>
  );
}

function PhotoCard({ item }: { item: LandingTestimonial }) {
  return (
    <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-3xl bg-[var(--lp-depo-escuro)]">
      <Image src={item.photo} alt={`${item.name}, ${item.role}`} fill sizes="(min-width: 1024px) 240px, 62vw" className="object-cover opacity-80 mix-blend-luminosity" />
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_35%,transparent_20%,var(--lp-depo-escuro)_85%)]" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--lp-depo-escuro)] via-transparent to-transparent opacity-90" />
      <span aria-hidden><TestimonialBadge className="absolute left-3 top-3" /></span>
    </span>
  );
}

/** Depoimentos: as fotos escolhem a citação em destaque; logos das academias abaixo. */
export function LpTestimonials() {
  const [active, setActive] = useState(0);
  const current = LANDING_TESTIMONIALS[active];
  if (!current) return null;

  return (
    <LpSection id="depoimentos" className="scroll-mt-24 bg-white">
      <div role="region" aria-label="Depoimentos de quem usa o Casca" style={SECTION_COLORS}>
        <LpReveal>
          <h2 className="mx-auto max-w-[22ch] text-center text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground">
            Quem dá aula com o Casca <span className="block text-brand-green">conta como é.</span>
          </h2>
        </LpReveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <ul className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0 lg:justify-end lg:overflow-visible">
            {LANDING_TESTIMONIALS.map((item, index) => (
              <li key={`${item.name}-${index}`} className={cn("w-[62vw] max-w-[240px] shrink-0 snap-center lg:w-[240px]", index % 2 === 0 ? "lg:mt-16" : "")}>
                <button
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className={cn(
                    "block w-full rounded-3xl transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green",
                    index === active ? "ring-4 ring-[var(--lp-depo-claro)]" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <span className="sr-only">Ler depoimento de </span>
                  <PhotoCard item={item} />
                </button>
                <p aria-hidden className="mt-3 text-base font-semibold text-foreground">{item.name}</p>
              </li>
            ))}
          </ul>

          <div>
            <figure aria-live="polite">
              <TestimonialBadge />
              <blockquote data-testid="landing-testimonial-quote" className="mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                “{current.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <AcademyLogo academy={current.academy} size="lg" />
                <span>
                  <span className="block font-semibold text-foreground">{current.name}</span>
                  <span className="block text-sm text-muted-foreground">{current.role} · {current.academy.name}</span>
                </span>
              </figcaption>
            </figure>

            <div className="mt-12">
              <p id="lp-academias-titulo" className="text-sm font-semibold text-muted-foreground">Academias que já usam o Casca</p>
              <ul aria-labelledby="lp-academias-titulo" className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
                {LANDING_ACADEMIES.map((academy, index) => (
                  <li key={`${academy.name}-${index}`} className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                    <AcademyLogo academy={academy} size="sm" />
                    {academy.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LpSection>
  );
}
