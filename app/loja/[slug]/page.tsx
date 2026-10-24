import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";

import { getCurrentAccount } from "@/lib/auth";
import { normalizePhoneE164 } from "@/lib/documents/whatsapp";
import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import {
  projectStorefrontCatalog,
  resolveStorefrontAccess,
  type StorefrontAccess,
  type StorefrontCatalogProduct,
  type StorefrontProductInput,
  type StorefrontVariantInput,
} from "@/lib/storefront/storefront";
import { createClient } from "@/lib/supabase/server";

const LOGO_SIGN_TTL_SECONDS = 60 * 60;

type StorefrontAccountRow = {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
  storefront_published: boolean;
  storefront_whatsapp: string | null;
};

function readStorefrontAccount(data: unknown): StorefrontAccountRow | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return {
    id: record.id,
    name: record.name,
    logo_url: typeof record.logo_url === "string" ? record.logo_url : null,
    slug: typeof record.slug === "string" ? record.slug : "",
    storefront_published: record.storefront_published === true,
    storefront_whatsapp:
      typeof record.storefront_whatsapp === "string" ? record.storefront_whatsapp : null,
  };
}

function readCents(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return null;
}

function readCount(value: unknown): number {
  const parsed = readCents(value);
  return parsed != null && parsed > 0 ? parsed : 0;
}

function readStorefrontVariants(value: unknown): StorefrontVariantInput[] {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (!Array.isArray(raw)) return [];
  const variants: StorefrontVariantInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.size_label !== "string" || record.size_label.trim() === "") continue;
    variants.push({
      sizeLabel: record.size_label,
      priceCents: readCents(record.price_cents),
      stockQuantity: readCount(record.stock_quantity),
      sortOrder: readCount(record.sort_order),
      line: record.line === "feminine" ? "feminine" : "unisex",
    });
  }
  return variants;
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readStorefrontProductRows(data: unknown): StorefrontProductInput[] {
  if (!Array.isArray(data)) return [];
  const products: StorefrontProductInput[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    if (typeof record.name !== "string" || record.name.trim() === "") continue;
    if (
      record.audience !== "unisex" &&
      record.audience !== "masculine" &&
      record.audience !== "feminine"
    ) {
      continue;
    }
    products.push({
      name: record.name,
      active: record.active === true,
      catalogVisible: record.catalog_visible === true,
      description: typeof record.description === "string" ? record.description : null,
      audience: record.audience,
      variants: readStorefrontVariants(record.variants),
    });
  }
  return products;
}

async function storefrontLogoSrc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  logoUrl: string | null,
): Promise<string | null> {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  const { data } = await supabase.storage
    .from(BRANDING_BUCKET)
    .createSignedUrl(logoUrl, LOGO_SIGN_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

const loadStorefrontPage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("storefront_account", { p_slug: slug });
  if (error) throw error;

  const account = readStorefrontAccount(data);
  const session = account ? await getCurrentAccount() : null;
  const preview = Boolean(account && session && session.profile.account_id === account.id);
  const whatsappE164 = normalizePhoneE164(account?.storefront_whatsapp ?? null);
  const canLoadProducts = Boolean(
    account && (preview || (account.storefront_published && whatsappE164 != null)),
  );

  let products: StorefrontCatalogProduct[] = [];
  if (canLoadProducts) {
    const listed = await supabase.rpc("storefront_products", { p_slug: slug });
    if (listed.error) throw listed.error;
    products = projectStorefrontCatalog(readStorefrontProductRows(listed.data)).products;
  }

  const access: StorefrontAccess = resolveStorefrontAccess({
    slugFound: account !== null,
    published: account?.storefront_published ?? false,
    whatsappE164,
    eligibleProductCount: products.length,
    preview,
  });
  const logoSrc =
    access === "not_found" ? null : await storefrontLogoSrc(supabase, account?.logo_url ?? null);

  return { access, account, logoSrc, products: access === "catalog" ? products : [] };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { access, account } = await loadStorefrontPage(slug);
  return {
    title: access === "not_found" || !account ? "Loja não encontrada" : account.name,
    robots: { index: false, follow: false },
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { access, account, logoSrc, products } = await loadStorefrontPage(slug);

  if (access === "not_found" || !account) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Loja não encontrada</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt=""
          width={192}
          height={64}
          unoptimized
          className="mb-4 h-16 w-auto max-w-full object-contain"
        />
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
      {access === "empty" ? (
        <p className="mt-6 text-base">Nenhum produto no momento</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {products.map((product, index) => (
            <li key={`${product.name}-${index}`} className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold tracking-tight">{product.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.audienceLabel}</p>
              {product.description ? (
                <p className="mt-2 whitespace-pre-wrap text-base">{product.description}</p>
              ) : null}
              {product.priceLabel ? (
                <p className="mt-3 text-base font-medium">{product.priceLabel}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
