import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import { createClient } from "@/lib/supabase/server";

const PHOTO_SIGN_TTL_SECONDS = 60 * 60;

export type ProductAudience = "unisex" | "masculine" | "feminine";
export type VariantLine = "unisex" | "feminine";

export type ProductVariantRow = {
  id: string;
  size_label: string;
  stock_quantity: number;
  price_cents: number | null;
  sort_order: number;
  line: VariantLine;
};

export type ProductPhotoRow = {
  id: string;
  sort_order: number;
  url: string | null;
};

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  description: string | null;
  catalog_visible: boolean;
  sort_order: number;
  audience: ProductAudience;
  variants: ProductVariantRow[];
  photos: ProductPhotoRow[];
};

type ProductPhotoRaw = {
  id: string;
  storage_path?: string | null;
  sort_order?: number | null;
};

type ProductRowRaw = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  description?: string | null;
  catalog_visible?: boolean | null;
  sort_order: number;
  audience?: ProductAudience | null;
  product_variants:
    | (Omit<ProductVariantRow, "line" | "price_cents"> & {
        line?: VariantLine | null;
        price_cents?: number | string | null;
      })[]
    | null;
  product_photos?: ProductPhotoRaw[] | null;
};

const SELECT_WITH_PHOTOS = `
      id,
      code,
      name,
      active,
      description,
      catalog_visible,
      sort_order,
      audience,
      product_variants (
        id,
        size_label,
        stock_quantity,
        price_cents,
        sort_order,
        line
      ),
      product_photos (
        id,
        storage_path,
        sort_order
      )
    `;

const SELECT_WITH_STOREFRONT = `
      id,
      code,
      name,
      active,
      description,
      catalog_visible,
      sort_order,
      audience,
      product_variants (
        id,
        size_label,
        stock_quantity,
        price_cents,
        sort_order,
        line
      )
    `;

const SELECT_WITH_AUDIENCE_LINE = `
      id,
      code,
      name,
      active,
      description,
      sort_order,
      audience,
      product_variants (
        id,
        size_label,
        stock_quantity,
        price_cents,
        sort_order,
        line
      )
    `;

/** Compatível só com migração 002 (sem audience / line em variants). */
const SELECT_LEGACY_002 = `
      id,
      code,
      name,
      active,
      sort_order,
      product_variants (
        id,
        size_label,
        stock_quantity,
        sort_order
      )
    `;

/**
 * PostgREST costuma devolver "Could not find the 'audience' column..." ou SQL com "does not exist".
 */
export function isLikelyMissingProducts003Columns(err: unknown): boolean {
  const text = [
    (err as { message?: string })?.message,
    (err as { details?: string })?.details,
    (err as { hint?: string })?.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text) return false;

  const missing =
    text.includes("does not exist") ||
    text.includes("could not find") ||
    text.includes("unknown column") ||
    text.includes("schema cache");

  if (!missing) return false;

  const mentionsAudience = text.includes("audience");
  const mentionsLine =
    text.includes("'line'") ||
    text.includes('"line"') ||
    text.includes(" line ") ||
    text.includes("(line)") ||
    text.includes("column line");

  return mentionsAudience || mentionsLine;
}

export function isLikelyMissingProductPhotos(err: unknown): boolean {
  const text = [
    (err as { message?: string })?.message,
    (err as { details?: string })?.details,
    (err as { hint?: string })?.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text.includes("product_photos")) return false;
  return (
    text.includes("does not exist") ||
    text.includes("could not find") ||
    text.includes("unknown column") ||
    text.includes("schema cache") ||
    text.includes("relationship")
  );
}

export function isLikelyMissingCatalogVisibleColumn(err: unknown): boolean {
  const text = [
    (err as { message?: string })?.message,
    (err as { details?: string })?.details,
    (err as { hint?: string })?.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text.includes("catalog_visible")) return false;
  return (
    text.includes("does not exist") ||
    text.includes("could not find") ||
    text.includes("unknown column") ||
    text.includes("schema cache")
  );
}

function readPriceCents(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return null;
}

type DraftProduct = Omit<ProductRow, "photos"> & {
  photos: (ProductPhotoRow & { storagePath: string | null })[];
};

function normalizeRows(rows: ProductRowRaw[]): DraftProduct[] {
  const byProductId = new Map<string, ProductRowRaw>();
  for (const row of rows) {
    if (!byProductId.has(row.id)) {
      byProductId.set(row.id, row);
    }
  }

  return [...byProductId.values()].map((row) => {
    const rawVariants = row.product_variants ?? [];
    const variantById = new Map<string, ProductVariantRow>();
    for (const v of rawVariants) {
      if (!variantById.has(v.id)) {
        const line: VariantLine =
          v.line === "feminine" ? "feminine" : "unisex";
        variantById.set(v.id, {
          id: v.id,
          size_label: v.size_label,
          stock_quantity: v.stock_quantity,
          price_cents: readPriceCents(v.price_cents),
          sort_order: v.sort_order,
          line,
        });
      }
    }
    const audience: ProductAudience =
      row.audience === "masculine" ||
      row.audience === "feminine" ||
      row.audience === "unisex"
        ? row.audience
        : "unisex";

    const photoById = new Map<string, ProductPhotoRaw>();
    for (const photo of row.product_photos ?? []) {
      if (photo?.id && !photoById.has(photo.id)) photoById.set(photo.id, photo);
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      active: row.active,
      description: typeof row.description === "string" ? row.description : null,
      catalog_visible: row.catalog_visible === true,
      sort_order: row.sort_order,
      audience,
      variants: [...variantById.values()].sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.size_label.localeCompare(b.size_label),
      ),
      photos: [...photoById.values()]
        .sort(
          (a, b) =>
            (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id.localeCompare(b.id),
        )
        .map((photo) => ({
          id: photo.id,
          sort_order: photo.sort_order ?? 0,
          url: null as string | null,
          storagePath: typeof photo.storage_path === "string" ? photo.storage_path : null,
        })),
    };
  });
}

async function signProductPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: DraftProduct[],
): Promise<ProductRow[]> {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      photos: await Promise.all(
        row.photos.map(async (photo) => {
          let url: string | null = null;
          if (photo.storagePath) {
            if (/^https?:\/\//i.test(photo.storagePath)) {
              url = photo.storagePath;
            } else {
              const { data } = await supabase.storage
                .from(BRANDING_BUCKET)
                .createSignedUrl(photo.storagePath, PHOTO_SIGN_TTL_SECONDS);
              url = data?.signedUrl ?? null;
            }
          }
          return { id: photo.id, sort_order: photo.sort_order, url };
        }),
      ),
    })),
  );
}

export async function loadProductsPageData(): Promise<ProductRow[]> {
  const supabase = await createClient();

  const withPhotos = await supabase
    .from("products")
    .select(SELECT_WITH_PHOTOS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!withPhotos.error) {
    return signProductPhotos(supabase, normalizeRows((withPhotos.data ?? []) as ProductRowRaw[]));
  }

  const modern =
    isLikelyMissingProductPhotos(withPhotos.error)
      ? await supabase
          .from("products")
          .select(SELECT_WITH_STOREFRONT)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true })
      : withPhotos;

  if (!modern.error) {
    return signProductPhotos(supabase, normalizeRows((modern.data ?? []) as ProductRowRaw[]));
  }

  if (isLikelyMissingCatalogVisibleColumn(modern.error)) {
    const withoutFlag = await supabase
      .from("products")
      .select(SELECT_WITH_AUDIENCE_LINE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!withoutFlag.error) {
      return signProductPhotos(
        supabase,
        normalizeRows((withoutFlag.data ?? []) as ProductRowRaw[]),
      );
    }

    if (isLikelyMissingProducts003Columns(withoutFlag.error)) {
      console.warn(
        "[produtos] Colunas audience/line ausentes — a usar consulta compatível com migração 002. Aplique db/migrations/003_product_audience_variant_line.sql para filtros femininos.",
        withoutFlag.error.message,
      );

      const legacy = await supabase
        .from("products")
        .select(SELECT_LEGACY_002)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!legacy.error) {
        return signProductPhotos(
          supabase,
          normalizeRows((legacy.data ?? []) as ProductRowRaw[]),
        );
      }
    }

    throw withoutFlag.error;
  }

  if (isLikelyMissingProducts003Columns(modern.error)) {
    console.warn(
      "[produtos] Colunas audience/line ausentes — a usar consulta compatível com migração 002. Aplique db/migrations/003_product_audience_variant_line.sql para filtros femininos.",
      modern.error.message,
    );

    const legacy = await supabase
      .from("products")
      .select(SELECT_LEGACY_002)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!legacy.error) {
      return signProductPhotos(supabase, normalizeRows((legacy.data ?? []) as ProductRowRaw[]));
    }
  }

  throw modern.error;
}
