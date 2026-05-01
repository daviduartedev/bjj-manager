"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Logo compacta para header/footer da LP (proporção horizontal da marca). */
const NAV_LOGO_SRC = "/uf.png";

export function CascaNavLogo({
  className,
  imgClassName,
  asLink = true,
}: {
  className?: string;
  imgClassName?: string;
  asLink?: boolean;
}) {
  const img = (
    <Image
      src={NAV_LOGO_SRC}
      alt=""
      width={240}
      height={72}
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
          "inline-flex shrink-0 items-center outline-none ring-offset-black focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-bjj-red focus-visible:ring-offset-2",
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
