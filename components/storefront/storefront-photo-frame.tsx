"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function StorefrontPhotoFrame({
  urls,
  fallback,
  logoSrc,
}: {
  urls: readonly string[];
  fallback: "logo" | "none";
  logoSrc: string | null;
}) {
  const [index, setIndex] = useState(0);
  const dragStart = useRef<number | null>(null);
  const current = urls[index] ?? urls[0] ?? null;

  if (urls.length === 0) {
    if (fallback !== "logo" || !logoSrc) return null;
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image src={logoSrc} alt="" fill unoptimized className="object-contain p-8" sizes="32rem" />
      </div>
    );
  }

  if (!current) return null;

  function show(next: number) {
    if (urls.length === 0) return;
    const wrapped = ((next % urls.length) + urls.length) % urls.length;
    setIndex(wrapped);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (urls.length < 2) return;
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current == null) return;
    const delta = event.clientX - dragStart.current;
    dragStart.current = null;
    if (delta <= -40) show(index + 1);
    else if (delta >= 40) show(index - 1);
  }

  return (
    <div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        <Image
          src={current}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 32rem) 100vw, 32rem"
          draggable={false}
        />
        {urls.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-sm"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => show(index - 1)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-sm"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => show(index + 1)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      {urls.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2" aria-label="Fotos do produto">
          {urls.map((url, dotIndex) => (
            <button
              key={`${url}-${dotIndex}`}
              type="button"
              aria-label={`Foto ${dotIndex + 1}`}
              aria-current={dotIndex === index ? "true" : undefined}
              className={cn(
                "size-2 rounded-full",
                dotIndex === index ? "bg-foreground" : "bg-foreground/30",
              )}
              onClick={() => show(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
