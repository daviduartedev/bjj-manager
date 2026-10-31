"use client";

import Image from "next/image";
import { useEffect, useState, type FocusEvent } from "react";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import {
  LANDING_ACADEMIES,
  LANDING_TESTIMONIALS,
  type LandingAcademy,
  type LandingTestimonial,
} from "@/components/marketing/lp-testimonials-content";
import { useLandingReducedMotion } from "@/components/marketing/use-landing-reduced-motion";
import { cn } from "@/lib/utils";

/** Tempo de cada depoimento em destaque antes de passar para o próximo. */
const AUTOPLAY_MS = 6000;

const BRAND_STRIPE = "linear-gradient(to right, hsl(var(--brand-green)) 0 33.333%, hsl(var(--brand-yellow)) 33.333% 66.666%, hsl(var(--brand-blue)) 66.666% 100%)";

/** Logo ao lado do nome da academia: decorativa, porque o nome já está escrito ao lado. */
function AcademyLogo({ academy }: { academy: LandingAcademy }) {
  if (academy.logo) {
    return (
      <span
        className={cn(
          "relative inline-block size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5",
          academy.logoTone === "light" ? "bg-neutral-900" : "bg-white",
        )}
      >
        <Image src={academy.logo} alt="" fill sizes="48px" className="object-contain p-1" />
      </span>
    );
  }
  return (
    <span aria-hidden className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
      {academy.initials}
    </span>
  );
}

/** Logo da tarja, em cores; logo clara vira escura para aparecer no fundo branco. */
function AcademyStripLogo({ academy }: { academy: LandingAcademy }) {
  if (!academy.logo) {
    return <span className="text-lg font-bold tracking-[-0.02em] text-foreground">{academy.name}</span>;
  }
  return (
    <span className="relative block h-20 w-20 sm:h-28 sm:w-36">
      <Image
        src={academy.logo}
        alt={academy.name}
        fill
        sizes="144px"
        className={cn("object-contain", academy.logoTone === "light" ? "brightness-0" : "")}
      />
    </span>
  );
}

/** Foto em cor com canto quase reto e tarja da marca na base; o destaque ganha sombra verde e tarja mais grossa. */
function PhotoCard({ item, highlighted }: { item: LandingTestimonial; highlighted: boolean }) {
  return (
    <span
      className={cn(
        "relative block aspect-[9/16] w-full overflow-hidden rounded-[4px] bg-neutral-900 transition-shadow duration-500",
        highlighted ? "shadow-[8px_8px_0_0_hsl(var(--brand-green))]" : "shadow-none",
      )}
    >
      <Image src={item.photo} alt={`${item.name}, ${item.role}`} fill sizes="(min-width: 1024px) 240px, 62vw" className="object-cover" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      <span
        aria-hidden
        className={cn("absolute inset-x-0 bottom-0 transition-all duration-500", highlighted ? "h-2" : "h-1")}
        style={{ background: BRAND_STRIPE }}
      />
    </span>
  );
}

/**
 * Depoimentos: os cartões alternam sozinhos a citação em destaque; a tarja de logos fica abaixo.
 * A troca pausa com o mouse ou o foco na área, para depois de um clique e não acontece com movimento reduzido.
 */
export function LpTestimonials() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [paused, setPaused] = useState(false);
  const shouldReduce = useLandingReducedMotion();
  const rotating = autoplay && !paused && !shouldReduce && LANDING_TESTIMONIALS.length > 1;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % LANDING_TESTIMONIALS.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [rotating]);

  const current = LANDING_TESTIMONIALS[active];
  if (!current) return null;

  function choose(index: number) {
    setAutoplay(false);
    setActive(index);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  }

  return (
    <LpSection id="depoimentos" className="scroll-mt-24 bg-white">
      <div role="region" aria-label="Depoimentos de quem usa o Casca">
        <LpReveal>
          <h2 className="mx-auto max-w-[22ch] text-center text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground">
            Quem gerencia a academia usando o <span className="sr-only">Casca</span>
            <span aria-hidden className="inline-block whitespace-nowrap align-[-0.12em]">
              <CascaNavLogo asLink={false} tone="light-bg" imgClassName="h-[1.05em] sm:h-[1.05em]" />
            </span>{" "}
            <span className="block text-brand-green">conta como é.</span>
          </h2>
        </LpReveal>

        <div
          className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={onBlur}
        >
          <ul className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 pr-7 sm:mx-0 sm:px-0 sm:pr-2 lg:justify-end lg:overflow-visible">
            {LANDING_TESTIMONIALS.map((item, index) => (
              <li key={`${item.name}-${index}`} className={cn("w-[62vw] max-w-[240px] shrink-0 snap-center lg:w-[240px]", index % 2 === 1 ? "lg:mt-8" : "")}>
                <button
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => choose(index)}
                  className="block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green"
                >
                  <span className="sr-only">Ler depoimento de </span>
                  <PhotoCard item={item} highlighted={index === active} />
                </button>
                <p aria-hidden className={cn("mt-4 text-base font-semibold transition-colors duration-500", index === active ? "text-foreground" : "text-muted-foreground")}>
                  {item.name}
                </p>
              </li>
            ))}
          </ul>

          <figure aria-live={rotating ? "off" : "polite"}>
            <blockquote
              key={active}
              data-testid="landing-testimonial-quote"
              className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-snug tracking-[-0.02em] text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
            >
              “{current.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <AcademyLogo academy={current.academy} />
              <span>
                <span className="block font-semibold text-foreground">{current.name}</span>
                <span className="block text-sm text-muted-foreground">{current.role} · {current.academy.name}</span>
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-24">
          <h3 id="lp-academias-titulo" className="text-center text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.03em] text-foreground">
            Já contam com a gente <span className="text-brand-green">na gestão</span>
          </h3>
          <ul aria-labelledby="lp-academias-titulo" className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-8 sm:justify-around">
            {LANDING_ACADEMIES.map((academy, index) => (
              <li key={`${academy.name}-${index}`}>
                <AcademyStripLogo academy={academy} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LpSection>
  );
}
