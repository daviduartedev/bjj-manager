"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PAGE_FRAME_LABEL, pageFrameVariant, type PageFrameKey } from "@/lib/painel/page-frame";

const ORDER: PageFrameKey[] = ["A", "B", "C"];

function nextKey(current: PageFrameKey, direction: -1 | 1): PageFrameKey {
  const index = ORDER.indexOf(current);
  return ORDER[(index + direction + ORDER.length) % ORDER.length] ?? "A";
}

function typingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function PrototypeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = pageFrameVariant(searchParams.get("variant"));

  function writeVariant(next: PageFrameKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (typingTarget(event.target)) return;
      event.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      const selected = pageFrameVariant(params.get("variant"));
      params.set("variant", nextKey(selected, event.key === "ArrowLeft" ? -1 : 1));
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router, searchParams]);

  if (process.env.NODE_ENV === "production") return null;

  const label = `${current} · ${PAGE_FRAME_LABEL[current]}`;

  return (
    <div
      data-testid="prototype-switcher"
      className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-amber-300 bg-black px-1.5 py-1 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] lg:bottom-5"
    >
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-white/15"
        aria-label="Modelo anterior"
        onClick={() => writeVariant(nextKey(current, -1))}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <span className="min-w-[7.5rem] px-1 text-center text-sm font-semibold tracking-wide">{label}</span>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-white/15"
        aria-label="Próximo modelo"
        onClick={() => writeVariant(nextKey(current, 1))}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
