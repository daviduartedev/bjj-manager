import { createClient } from "@/lib/supabase/server";

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
};

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

function normalizeRows(rows: ProductRowRaw[]): ProductRow[] {
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
    };
  });
}

export async function loadProductsPageData(): Promise<ProductRow[]> {
  const supabase = await createClient();

  const modern = await supabase
    .from("products")
    .select(SELECT_WITH_STOREFRONT)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!modern.error) {
    return normalizeRows((modern.data ?? []) as ProductRowRaw[]);
  }

  if (isLikelyMissingCatalogVisibleColumn(modern.error)) {
    const withoutFlag = await supabase
      .from("products")
      .select(SELECT_WITH_AUDIENCE_LINE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!withoutFlag.error) {
      return normalizeRows((withoutFlag.data ?? []) as ProductRowRaw[]);
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
        return normalizeRows((legacy.data ?? []) as ProductRowRaw[]);
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
      return normalizeRows((legacy.data ?? []) as ProductRowRaw[]);
    }
  }

  throw modern.error;
}
