import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";

import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import {
  StorefrontProductList,
  type StorefrontPublicCard,
} from "@/components/storefront/storefront-product-list";
import { resolvePublicAppOrigin } from "@/lib/app-url";
import { getCurrentAccount } from "@/lib/auth";
import { normalizePhoneE164 } from "@/lib/documents/whatsapp";
import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import {
  parseStorefrontTheme,
  projectStorefrontCard,
  projectStorefrontCards,
  resolveStorefrontAccess,
  storefrontCover,
  storefrontPath,
  storefrontThemeDefaults,
  storefrontThemeStyle,
  type StorefrontAccess,
  type StorefrontCardContext,
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
  storefront_theme: unknown;
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
    storefront_theme: record.storefront_theme ?? {},
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
      stockQuantity: record.in_stock === true ? 1 : 0,
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

type StorefrontProductRow = StorefrontProductInput & { photoPaths: string[] };

function readPhotoPaths(value: unknown): string[] {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (!Array.isArray(raw)) return [];
  const paths: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim() !== "") paths.push(item);
  }
  return paths;
}

function readStorefrontProductRows(data: unknown): StorefrontProductRow[] {
  if (!Array.isArray(data)) return [];
  const products: StorefrontProductRow[] = [];
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
      photoPaths: readPhotoPaths(record.photo_paths),
    });
  }
  return products;
}

async function signStorefrontObject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  objectPath: string | null,
): Promise<string | null> {
  if (!objectPath) return null;
  if (/^https?:\/\//i.test(objectPath)) return objectPath;
  const { data } = await supabase.storage
    .from(BRANDING_BUCKET)
    .createSignedUrl(objectPath, LOGO_SIGN_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

async function projectPublicCards(
  rows: readonly StorefrontProductRow[],
  ctx: StorefrontCardContext,
  logoSrc: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<StorefrontPublicCard[]> {
  const projected = rows.filter((row) => projectStorefrontCards([row], ctx).length > 0);
  projected.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return Promise.all(
    projected.map(async (row) => {
      const signed = await Promise.all(row.photoPaths.map((path) => signStorefrontObject(supabase, path)));
      const urls = signed.filter((url): url is string => url != null);
      return {
        ...projectStorefrontCard(row, ctx),
        cover: storefrontCover(
          urls.map((url) => ({ url })),
          logoSrc,
        ),
      };
    }),
  );
}

const loadStorefrontPage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("storefront_account", { p_slug: slug });
  if (error) throw error;

  const account = readStorefrontAccount(data);
  const session = account ? await getCurrentAccount() : null;
  const preview = Boolean(
    account &&
      session &&
      session.profile.role === "professor" &&
      session.profile.account_id === account.id,
  );
  const whatsappE164 = normalizePhoneE164(account?.storefront_whatsapp ?? null);
  const canLoadProducts = Boolean(
    account && (preview || (account.storefront_published && whatsappE164 != null)),
  );

  const storeUrl = `${resolvePublicAppOrigin()}${storefrontPath(slug)}`;
  const cardCtx: StorefrontCardContext = {
    academyName: account?.name ?? "",
    storeUrl,
    whatsappE164,
  };
  let rows: StorefrontProductRow[] = [];
  if (canLoadProducts && account) {
    const listed = await supabase.rpc("storefront_products", { p_slug: slug });
    if (listed.error) throw listed.error;
    rows = readStorefrontProductRows(listed.data);
  }
  const projectedCount = projectStorefrontCards(rows, cardCtx).length;

  const access: StorefrontAccess = resolveStorefrontAccess({
    slugFound: account !== null,
    published: account?.storefront_published ?? false,
    whatsappE164,
    eligibleProductCount: projectedCount,
    preview,
  });
  const logoSrc =
    access === "not_found" ? null : await signStorefrontObject(supabase, account?.logo_url ?? null);
  const products =
    access === "catalog" ? await projectPublicCards(rows, cardCtx, logoSrc, supabase) : [];

  return {
    access,
    account,
    logoSrc,
    products,
    storeUrl,
    whatsappE164,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { access, account } = await loadStorefrontPage(slug);
  return {
    title: access === "not_found" || !account ? "Catálogo não encontrado" : account.name,
    robots: { index: false, follow: false },
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { access, account, logoSrc, products, storeUrl, whatsappE164 } =
    await loadStorefrontPage(slug);
  const theme = parseStorefrontTheme(account?.storefront_theme ?? {});
  const themeStyle = storefrontThemeStyle(theme.ok ? theme.theme : storefrontThemeDefaults());

  return (
    <div
      className="flex min-h-dvh flex-col bg-[var(--store-page)] text-[var(--store-text)]"
      style={themeStyle}
    >
      {access === "not_found" || !account ? (
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6">
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo não encontrado</h1>
        </main>
      ) : (
        <>
          <header className="border-b border-[var(--store-border)] bg-[var(--store-header)] text-[var(--store-header-text)]">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-2 px-2 py-5 text-center sm:py-8">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={account.name}
                  width={480}
                  height={160}
                  unoptimized
                  priority
                  className="h-24 w-auto max-w-full object-contain sm:h-36"
                />
              ) : null}
              <h1 className={logoSrc ? "text-lg font-semibold tracking-tight" : "text-3xl font-semibold tracking-tight"}>
                {account.name}
              </h1>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-0.5 py-1">
            {access === "empty" ? (
              <p className="text-base">Nenhum produto no momento</p>
            ) : (
              <StorefrontProductList
                products={products}
                academyName={account.name}
                storeUrl={storeUrl}
                whatsappE164={whatsappE164}
                logoSrc={logoSrc}
              />
            )}
          </main>
        </>
      )}
      <StorefrontFooter />
    </div>
  );
}
