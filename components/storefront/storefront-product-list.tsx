"use client";

import { useState } from "react";

import { StorefrontPhotoFrame } from "@/components/storefront/storefront-photo-frame";
import { StorefrontSizePicker } from "@/components/storefront/storefront-size-picker";
import { Input } from "@/components/ui/input";
import {
  filterStorefrontByName,
  type StorefrontCard,
} from "@/lib/storefront/storefront";

export type StorefrontPublicCard = StorefrontCard & {
  cover: { urls: string[]; fallback: "logo" | "none" };
};

export function StorefrontProductList({
  products,
  academyName,
  storeUrl,
  whatsappE164,
  logoSrc,
}: {
  products: readonly StorefrontPublicCard[];
  academyName: string;
  storeUrl: string;
  whatsappE164: string | null;
  logoSrc: string | null;
}) {
  const [query, setQuery] = useState("");
  const visible = filterStorefrontByName(products, query);

  return (
    <>
      <div className="mt-6">
        <Input
          type="search"
          value={query}
          placeholder="Buscar produto"
          aria-label="Buscar produto"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {visible.length === 0 ? (
        <p className="mt-6 text-base">Nenhum produto com esse nome</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {visible.map((product, index) => (
            <li key={`${product.name}-${index}`} className="border-t border-border pt-6">
              <StorefrontPhotoFrame
                urls={product.cover.urls}
                fallback={product.cover.fallback}
                logoSrc={logoSrc}
              />
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{product.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.audienceLabel}</p>
              {product.description ? (
                <p className="mt-2 whitespace-pre-wrap text-base">{product.description}</p>
              ) : null}
              <StorefrontSizePicker
                name={product.name}
                chips={product.chips}
                initialChipIndex={product.initialChipIndex}
                academyName={academyName}
                storeUrl={storeUrl}
                whatsappE164={whatsappE164}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
