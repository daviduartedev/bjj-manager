"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, Input, SearchField, ToggleButton, ToggleButtonGroup } from "react-aria-components";

import {
  filterStorefrontByName,
  storefrontChipWhatsAppHref,
  type StorefrontCard,
} from "@/lib/storefront/storefront";

export type StorefrontPublicCard = StorefrontCard & {
  cover: { urls: string[]; fallback: "logo" | "none" };
};

type StoreContext = {
  academyName: string;
  storeUrl: string;
  whatsappE164: string | null;
  logoSrc: string | null;
};

export function StorefrontProductList({
  products,
  ...store
}: { products: readonly StorefrontPublicCard[] } & StoreContext) {
  const [query, setQuery] = useState("");
  const visible = filterStorefrontByName(products, query);

  return (
    <>
      <SearchField
        aria-label="Buscar produto"
        value={query}
        onChange={setQuery}
        className="px-1 py-2 sm:max-w-sm"
      >
        <Input
          placeholder="Buscar produto"
          autoComplete="off"
          className="w-full rounded-md border border-[var(--store-border)] bg-[var(--store-card)] px-3 py-2 text-sm text-[var(--store-card-text)] outline-none placeholder:text-[var(--store-muted)] focus:ring-2 focus:ring-[var(--store-accent)]"
        />
      </SearchField>
      {visible.length === 0 ? (
        <p className="px-1 py-8 text-sm text-[var(--store-muted)]">Nenhum produto com esse nome</p>
      ) : (
        <ul className="grid grid-cols-2 gap-1 px-1 pb-2 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <StorefrontTile key={`${product.name}-${index}`} product={product} store={store} />
          ))}
        </ul>
      )}
    </>
  );
}

function StorefrontTile({
  product,
  store,
}: {
  product: StorefrontPublicCard;
  store: StoreContext;
}) {
  const [selectedIndex, setSelectedIndex] = useState(product.initialChipIndex);
  const selected = selectedIndex == null ? null : (product.chips[selectedIndex] ?? null);
  const href = selected?.available
    ? storefrontChipWhatsAppHref({
        whatsappE164: store.whatsappE164,
        name: product.name,
        tamanho: selected.label,
        priceLabel: selected.priceLabel,
        academyName: store.academyName,
        storeUrl: store.storeUrl,
      })
    : null;

  const cover = product.cover.urls[0] ?? null;
  const fallbackLogo = !cover && product.cover.fallback === "logo" ? store.logoSrc : null;

  const sizes = (
    <ToggleButtonGroup
      aria-label={`Tamanhos de ${product.name}`}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={selectedIndex == null ? [] : [String(selectedIndex)]}
      onSelectionChange={(keys) => {
        const first = [...keys][0];
        if (first != null) setSelectedIndex(Number(first));
      }}
      className="flex flex-wrap gap-1"
    >
      {product.chips.map((chip, chipIndex) => (
        <ToggleButton
          key={`${chip.label}-${chipIndex}`}
          id={String(chipIndex)}
          isDisabled={!chip.available}
          className="rounded border border-[var(--store-border)] px-2 py-0.5 text-xs text-[var(--store-card-text)] outline-none data-[disabled]:line-through data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--store-accent)] data-[selected]:border-[var(--store-accent)] data-[selected]:bg-[var(--store-accent)] data-[selected]:text-[var(--store-accent-text)]"
        >
          {chip.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  const action = (
    <div className="flex flex-col gap-2">
      {sizes}
      {selected?.available ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--store-accent)] px-3 py-2 text-sm font-medium text-[var(--store-accent-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-accent)] focus-visible:ring-offset-2"
          >
            Chamar no WhatsApp
          </a>
        ) : (
          <Button
            isDisabled
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--store-accent)] px-3 py-2 text-sm font-medium text-[var(--store-accent-text)] opacity-40"
          >
            Chamar no WhatsApp
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <li className="group relative overflow-hidden rounded-md border border-[var(--store-border)] bg-[var(--store-card)] text-[var(--store-card-text)]">
      <div className="relative aspect-[4/5] w-full bg-[var(--store-border)]">
        {cover ? (
          <Image src={cover} alt={product.name} fill unoptimized className="object-cover" sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" />
        ) : fallbackLogo ? (
          <Image src={fallbackLogo} alt="" fill unoptimized className="object-contain p-10" sizes="25vw" />
        ) : null}
      </div>
      <div className="flex flex-col px-2 py-2 md:absolute md:inset-x-0 md:bottom-0 md:bg-[var(--store-card)]/95 md:backdrop-blur">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">{product.name}</h2>
            <p className="text-xs text-[var(--store-muted)]">{product.audienceLabel}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold">{selected?.priceLabel ?? "—"}</span>
        </div>
        <div className="flex flex-col gap-2 pt-2 md:max-h-0 md:overflow-hidden md:pt-0 md:opacity-0 md:transition-all md:duration-200 md:group-focus-within:max-h-64 md:group-focus-within:pt-2 md:group-focus-within:opacity-100 md:group-hover:max-h-64 md:group-hover:pt-2 md:group-hover:opacity-100">
          {product.description ? (
            <p className="line-clamp-2 text-xs text-[var(--store-muted)]">{product.description}</p>
          ) : null}
          {action}
        </div>
      </div>
    </li>
  );
}
