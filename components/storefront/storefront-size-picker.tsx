"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  storefrontChipWhatsAppHref,
  type StorefrontChip,
} from "@/lib/storefront/storefront";
import { cn } from "@/lib/utils";

export function StorefrontSizePicker({
  name,
  chips,
  initialChipIndex,
  academyName,
  storeUrl,
  whatsappE164,
}: {
  name: string;
  chips: readonly StorefrontChip[];
  initialChipIndex: number | null;
  academyName: string;
  storeUrl: string;
  whatsappE164: string | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(initialChipIndex);
  const selected = selectedIndex == null ? null : (chips[selectedIndex] ?? null);
  const href =
    selected?.available
      ? storefrontChipWhatsAppHref({
          whatsappE164,
          name,
          tamanho: selected.label,
          priceLabel: selected.priceLabel,
          academyName,
          storeUrl,
        })
      : null;

  return (
    <div className="mt-3">
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tamanhos">
          {chips.map((chip, index) => {
            const selectedChip = index === selectedIndex;
            return (
              <button
                key={`${chip.label}-${index}`}
                type="button"
                role="radio"
                aria-checked={selectedChip}
                disabled={!chip.available}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  selectedChip
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground",
                  !chip.available && "cursor-not-allowed opacity-40",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {selected ? <p className="mt-3 text-base font-medium">{selected.priceLabel}</p> : null}
      {href ? (
        <Button asChild className="mt-4">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Chamar no WhatsApp
          </a>
        </Button>
      ) : null}
    </div>
  );
}
