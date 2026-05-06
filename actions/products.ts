"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  createProductSchema,
  createProductVariantSchema,
  deleteProductVariantSchema,
  updateProductSchema,
  updateProductVariantSchema,
} from "@/lib/validations/products";

export type ProductActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function fieldErrorsFromZod(err: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const flat = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v?.length) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

function friendlyError(e: unknown): string {
  return mapDatabaseErrorToUserMessage(e) ?? "Não foi possível salvar. Tente novamente.";
}

export async function createProduct(input: unknown): Promise<ProductActionResult> {
  try {
    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();
    const code = `custom-${randomUUID()}`;
    const { error } = await supabase.from("products").insert({
      account_id: ctx.account.id,
      code,
      name: parsed.data.name.trim(),
      active: true,
      sort_order: 100,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function updateProduct(input: unknown): Promise<ProductActionResult> {
  try {
    const parsed = updateProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.name !== undefined) {
      patch.name = parsed.data.name.trim();
    }
    if (parsed.data.active !== undefined) {
      patch.active = parsed.data.active;
    }

    const { error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", parsed.data.productId)
      .eq("account_id", ctx.account.id);

    if (error) throw error;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function createProductVariant(
  input: unknown,
): Promise<ProductActionResult> {
  try {
    const parsed = createProductVariantSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();
    const { data: productRow, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", parsed.data.productId)
      .eq("account_id", ctx.account.id)
      .maybeSingle();

    if (prodErr) throw prodErr;
    if (!productRow) {
      return { ok: false, error: "Produto não encontrado." };
    }

    const { data: maxRows, error: maxErr } = await supabase
      .from("product_variants")
      .select("sort_order")
      .eq("product_id", parsed.data.productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (maxErr) throw maxErr;
    const sortOrder = (maxRows?.[0]?.sort_order ?? 0) + 10;

    const { error } = await supabase.from("product_variants").insert({
      product_id: parsed.data.productId,
      size_label: parsed.data.sizeLabel.trim(),
      stock_quantity: parsed.data.stockQuantity,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function updateProductVariant(
  input: unknown,
): Promise<ProductActionResult> {
  try {
    const parsed = updateProductVariantSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.sizeLabel !== undefined) {
      patch.size_label = parsed.data.sizeLabel.trim();
    }
    if (parsed.data.stockQuantity !== undefined) {
      patch.stock_quantity = parsed.data.stockQuantity;
    }

    const { data: variantRow, error: vErr } = await supabase
      .from("product_variants")
      .select("id, product_id")
      .eq("id", parsed.data.variantId)
      .maybeSingle();

    if (vErr) throw vErr;
    if (!variantRow) {
      return { ok: false, error: "Variação não encontrada." };
    }

    const { data: productRow, error: pErr } = await supabase
      .from("products")
      .select("account_id")
      .eq("id", variantRow.product_id)
      .maybeSingle();

    if (pErr) throw pErr;
    if (!productRow || productRow.account_id !== ctx.account.id) {
      return { ok: false, error: "Variação não encontrada." };
    }

    const { error } = await supabase
      .from("product_variants")
      .update(patch)
      .eq("id", parsed.data.variantId);

    if (error) throw error;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function deleteProductVariant(
  input: unknown,
): Promise<ProductActionResult> {
  try {
    const parsed = deleteProductVariantSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();
    const { data: variantRow, error: vErr } = await supabase
      .from("product_variants")
      .select("id, product_id")
      .eq("id", parsed.data.variantId)
      .maybeSingle();

    if (vErr) throw vErr;
    if (!variantRow) {
      return { ok: false, error: "Variação não encontrada." };
    }

    const { data: productRow, error: pErr } = await supabase
      .from("products")
      .select("account_id")
      .eq("id", variantRow.product_id)
      .maybeSingle();

    if (pErr) throw pErr;
    if (!productRow || productRow.account_id !== ctx.account.id) {
      return { ok: false, error: "Variação não encontrada." };
    }

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", parsed.data.variantId);

    if (error) throw error;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}
