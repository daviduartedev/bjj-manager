"use client";

import Image from "next/image";

import {
  beltAssetNeedsContrastFrame,
  beltAssetPath,
  clampDegreeForBeltAsset,
} from "@/lib/graduation/belt-asset";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  kind: "adult" | "kids";
  degree: number;
  className?: string;
  /** Faixa horizontal compacta para listas. */
  compact?: boolean;
};

export function BeltIllustration({
  slug,
  kind,
  degree,
  className,
  compact,
}: Props) {
  const clamped = clampDegreeForBeltAsset(slug, kind, degree);
  const src = beltAssetPath(slug, kind, degree);
  const needsContrast = beltAssetNeedsContrastFrame(slug);
  const h = compact ? "h-3" : "h-4";
  const w = compact ? "w-24" : "w-32";

  return (
    <div
      className={cn("inline-flex flex-col items-start gap-0.5", className)}
      aria-hidden
      title={`${slug} grau ${clamped}`}
    >
      <div
        className={cn(
          "inline-flex shrink-0 items-center overflow-hidden rounded-[3px]",
          needsContrast
            ? "border border-neutral-300/90 bg-neutral-200/80 p-px shadow-sm dark:border-neutral-600 dark:bg-neutral-800/90"
            : "border border-transparent",
        )}
      >
        <Image
          src={src}
          alt=""
          width={256}
          height={32}
          className={cn("object-contain object-left", h, w)}
          draggable={false}
        />
      </div>
      {!compact && clamped > 0 ? (
        <span className="text-[10px] text-muted-foreground">
          {clamped} {clamped === 1 ? "grau" : "graus"}
        </span>
      ) : !compact ? (
        <span className="text-[10px] text-muted-foreground">Sem grau</span>
      ) : null}
    </div>
  );
}
