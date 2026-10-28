"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Logo horizontal com emblema e nome, nas versões para fundo claro e escuro. */
const logoByTone = {
  "dark-bg": "/marketing/casca-logo-light.png",
  "light-bg": "/marketing/casca-logo-dark.png",
} as const;

export type CascaNavLogoTone = keyof typeof logoByTone;

export function CascaNavLogo({
  className,
  imgClassName,
  asLink = true,
  tone = "dark-bg",
}: {
  className?: string;
  imgClassName?: string;
  asLink?: boolean;
  tone?: CascaNavLogoTone;
}) {
  const img = (
    <Image
      src={logoByTone[tone]}
      alt=""
      width={3068}
      height={945}
      quality={100}
      priority
      className={cn("h-7 w-auto object-contain object-left sm:h-8", imgClassName)}
    />
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={cn(
          "inline-flex shrink-0 items-center outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          tone === "light-bg" ? "ring-offset-card" : "ring-offset-secondary",
          className,
        )}
        aria-label="Casca, página inicial"
      >
        {img}
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Casca">
      {img}
    </span>
  );
}
