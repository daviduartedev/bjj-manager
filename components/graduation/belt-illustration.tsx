"use client";

import Image from "next/image";

import { beltAssetPath, clampDegreeForBeltAsset } from "@/lib/graduation/belt-asset";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  kind: "adult" | "kids";
  degree: number;
  className?: string;
  /** Ícone menor para listas e histórico compacto. */
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
  const sizeClass = compact ? "size-7" : "size-10";

  return (
    <div
      className={cn("inline-flex flex-col items-start gap-0.5", className)}
      aria-hidden
      title={`${slug} grau ${clamped}`}
    >
      <Image
        src={src}
        alt=""
        width={256}
        height={256}
        className={cn("shrink-0 object-contain", sizeClass)}
        draggable={false}
      />
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
