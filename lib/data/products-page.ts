import { createClient } from "@/lib/supabase/server";

export type ProductAudience = "unisex" | "masculine" | "feminine";
export type VariantLine = "unisex" | "feminine";

export type ProductVariantRow = {
  id: string;
  size_label: string;
  stock_quantity: number;
  sort_order: number;
  line: VariantLine;
};

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  audience: ProductAudience;
  variants: ProductVariantRow[];
};

type ProductRowRaw = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  audience: ProductAudience | null;
  product_variants:
    | (Omit<ProductVariantRow, "line"> & { line?: VariantLine | null })[]
    | null;
};

export async function loadProductsPageData(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      code,
      name,
      active,
      sort_order,
      audience,
      product_variants (
        id,
        size_label,
        stock_quantity,
        sort_order,
        line
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as ProductRowRaw[];

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
      sort_order: row.sort_order,
      audience,
      variants: [...variantById.values()].sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.size_label.localeCompare(b.size_label),
      ),
    };
  });
}
