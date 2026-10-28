import Link from "next/link";

import { cn } from "@/lib/utils";

/** Wordmark tipográfico alinhado à marca (sem imagem). Letras A em destaque azul. */
export function CascaWordmarkNav({
  className,
  asLink = true,
}: {
  className?: string;
  asLink?: boolean;
}) {
  const letters = (
    <>
      <span>C</span>
      <span className="text-primary">A</span>
      <span>S</span>
      <span>C</span>
      <span className="text-primary">A</span>
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="outline-none ring-offset-secondary focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Casca, página inicial"
      >
        <span
          className={cn(
            "inline-flex select-none items-baseline gap-0 font-sans font-semibold tracking-[-0.02em] text-white",
            "text-base sm:text-lg",
            className,
          )}
          aria-hidden
        >
          {letters}
        </span>
      </Link>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline gap-0 font-sans font-semibold tracking-[-0.02em] text-white",
        "text-base sm:text-lg",
        className,
      )}
      aria-label="Casca"
    >
      {letters}
    </span>
  );
}
