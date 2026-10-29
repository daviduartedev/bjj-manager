"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES } from "@/lib/routes";
import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import {
  checkStorefrontPhoto,
  normalizeStorefrontDescription,
  reorderStorefrontPhotos,
} from "@/lib/storefront/storefront";
import { requireAcademyWriteAccess } from "@/lib/subscriptions/guards";
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

function revalidateProductViews() {
  revalidatePath(ROUTES.produtos);
  revalidatePath("/loja", "layout");
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
    const writeAccess = await requireAcademyWriteAccess(supabase);
    if (!writeAccess.ok) return writeAccess;
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

    revalidateProductViews();
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
    const writeAccess = await requireAcademyWriteAccess(supabase);
    if (!writeAccess.ok) return writeAccess;
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.name !== undefined) {
      patch.name = parsed.data.name.trim();
    }
    if (parsed.data.active !== undefined) {
      patch.active = parsed.data.active;
    }
    if (parsed.data.audience !== undefined) {
      patch.audience = parsed.data.audience;
    }
    if (parsed.data.description !== undefined) {
      const description = normalizeStorefrontDescription(parsed.data.description);
      if (!description.ok) {
        return { ok: false, error: description.error };
      }
      patch.description = description.description;
    }
    if (parsed.data.catalogVisible !== undefined) {
      patch.catalog_visible = parsed.data.catalogVisible;
    }

    const { error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", parsed.data.productId)
      .eq("account_id", ctx.account.id);

    if (error) throw error;

    revalidateProductViews();
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
    const writeAccess = await requireAcademyWriteAccess(supabase);
    if (!writeAccess.ok) return writeAccess;
    const { data: productRow, error: prodErr } = await supabase
      .from("products")
      .select("id, audience")
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

    const lineDefault =
      parsed.data.line ??
      (productRow.audience === "feminine" ? "feminine" : "unisex");

    const { error } = await supabase.from("product_variants").insert({
      product_id: parsed.data.productId,
      size_label: parsed.data.sizeLabel.trim(),
      stock_quantity: parsed.data.stockQuantity,
      sort_order: sortOrder,
      line: lineDefault,
      price_cents: parsed.data.priceCents ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidateProductViews();
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
    const writeAccess = await requireAcademyWriteAccess(supabase);
    if (!writeAccess.ok) return writeAccess;
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.sizeLabel !== undefined) {
      patch.size_label = parsed.data.sizeLabel.trim();
    }
    if (parsed.data.stockQuantity !== undefined) {
      patch.stock_quantity = parsed.data.stockQuantity;
    }
    if (parsed.data.line !== undefined) {
      patch.line = parsed.data.line;
    }
    if (parsed.data.priceCents !== undefined) {
      patch.price_cents = parsed.data.priceCents;
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

    revalidateProductViews();
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
    const writeAccess = await requireAcademyWriteAccess(supabase);
    if (!writeAccess.ok) return writeAccess;
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

    revalidateProductViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

const PHOTO_CONTENT_TYPE = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

async function requireProfessorProduct(productId: string) {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") {
    return {
      ok: false as const,
      error: "Só o professor pode alterar as fotos do produto.",
    };
  }

  const supabase = await createClient();
  const writeAccess = await requireAcademyWriteAccess(supabase, ctx.account.id);
  if (!writeAccess.ok) return writeAccess;
  const { data: product, error } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("account_id", ctx.account.id)
    .maybeSingle();

  if (error) throw error;
  if (!product) {
    return { ok: false as const, error: "Produto não encontrado." };
  }

  return { ok: true as const, supabase, accountId: ctx.account.id };
}

export async function uploadProductPhoto(formData: FormData): Promise<ProductActionResult> {
  let uploadedPath: string | null = null;
  let supabaseForCleanup: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    const productId = formData.get("productId");
    const file = formData.get("file");
    if (!isUuid(productId)) {
      return { ok: false, error: "Produto não encontrado." };
    }
    if (!(file instanceof File)) {
      return { ok: false, error: "Selecione uma foto." };
    }

    const access = await requireProfessorProduct(productId);
    if (!access.ok) return access;
    supabaseForCleanup = access.supabase;

    const { data: existing, error: listError } = await access.supabase
      .from("product_photos")
      .select("sort_order")
      .eq("product_id", productId);

    if (listError) throw listError;

    const checked = checkStorefrontPhoto(file, existing?.length ?? 0);
    if (!checked.ok) return checked;

    const photoId = randomUUID();
    const storagePath = `${access.accountId}/products/${productId}/${photoId}.${checked.ext}`;
    const body = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await access.supabase.storage
      .from(BRANDING_BUCKET)
      .upload(storagePath, body, {
        cacheControl: "3600",
        upsert: false,
        contentType: PHOTO_CONTENT_TYPE[checked.ext],
      });
    if (uploadError) throw uploadError;
    uploadedPath = storagePath;

    const nextSort =
      (existing ?? []).reduce((max, row) => Math.max(max, row.sort_order ?? 0), -1) + 1;
    const { error: insertError } = await access.supabase.from("product_photos").insert({
      id: photoId,
      product_id: productId,
      storage_path: storagePath,
      sort_order: nextSort,
    });
    if (insertError) throw insertError;

    revalidateProductViews();
    return { ok: true };
  } catch (e) {
    if (uploadedPath && supabaseForCleanup) {
      await supabaseForCleanup.storage.from(BRANDING_BUCKET).remove([uploadedPath]);
    }
    return { ok: false, error: friendlyError(e) };
  }
}

export async function removeProductPhoto(input: unknown): Promise<ProductActionResult> {
  try {
    if (!input || typeof input !== "object") {
      return { ok: false, error: "Foto não encontrada." };
    }
    const record = input as Record<string, unknown>;
    if (!isUuid(record.productId) || !isUuid(record.photoId)) {
      return { ok: false, error: "Foto não encontrada." };
    }

    const access = await requireProfessorProduct(record.productId);
    if (!access.ok) return access;

    const { data: photo, error: readError } = await access.supabase
      .from("product_photos")
      .select("id, storage_path")
      .eq("id", record.photoId)
      .eq("product_id", record.productId)
      .maybeSingle();

    if (readError) throw readError;
    if (!photo || typeof photo.storage_path !== "string") {
      return { ok: false, error: "Foto não encontrada." };
    }

    const { error: deleteError } = await access.supabase
      .from("product_photos")
      .delete()
      .eq("id", record.photoId)
      .eq("product_id", record.productId);
    if (deleteError) throw deleteError;

    await access.supabase.storage.from(BRANDING_BUCKET).remove([photo.storage_path]);

    revalidateProductViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function reorderProductPhotos(input: unknown): Promise<ProductActionResult> {
  try {
    if (!input || typeof input !== "object") {
      return { ok: false, error: "Não foi possível reordenar as fotos." };
    }
    const record = input as Record<string, unknown>;
    if (!isUuid(record.productId) || !Array.isArray(record.orderedIds)) {
      return { ok: false, error: "Não foi possível reordenar as fotos." };
    }
    const orderedIds = record.orderedIds.filter(isUuid);
    if (orderedIds.length !== record.orderedIds.length) {
      return { ok: false, error: "Não foi possível reordenar as fotos." };
    }

    const access = await requireProfessorProduct(record.productId);
    if (!access.ok) return access;

    const { data: rows, error: listError } = await access.supabase
      .from("product_photos")
      .select("id, sort_order")
      .eq("product_id", record.productId);

    if (listError) throw listError;

    const current = [...(rows ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id),
    );
    const next = reorderStorefrontPhotos(current, orderedIds);
    const applied =
      next.length === orderedIds.length && next.every((photo, index) => photo.id === orderedIds[index]);
    if (!applied) {
      return { ok: false, error: "Não foi possível reordenar as fotos." };
    }

    for (let index = 0; index < next.length; index += 1) {
      const { error } = await access.supabase
        .from("product_photos")
        .update({ sort_order: 1000 + index })
        .eq("id", next[index].id)
        .eq("product_id", record.productId);
      if (error) throw error;
    }

    for (let index = 0; index < next.length; index += 1) {
      const { error } = await access.supabase
        .from("product_photos")
        .update({ sort_order: index })
        .eq("id", next[index].id)
        .eq("product_id", record.productId);
      if (error) throw error;
    }

    revalidateProductViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}
