"use server";

import { revalidatePath } from "next/cache";

import { getDocumentDownloadUrl } from "@/actions/documents";
import { getCurrentAccount } from "@/lib/auth";
import { buildManualReceiptPayload } from "@/lib/documents/payload-builder";
import { DocumentGenerationService } from "@/lib/documents/service";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import {
  LEDGER_PAYMENT_METHOD_LABELS,
  canIssueSaleReceipt,
  classifyLedgerNote,
  ledgerNoteIdempotencyKey,
  saleReceiptDescription,
  splitInstallments,
  type LedgerKind,
} from "@/lib/products/ledger";
import { ledgerClient } from "@/lib/products/ledger-client";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createLedgerNoteSchema,
  deleteLedgerNoteSchema,
  issueLedgerReceiptSchema,
  markLedgerInstallmentPaidSchema,
  updateLedgerNoteSchema,
  type CreateLedgerNoteInput,
} from "@/lib/validations/product-ledger";

export type LedgerActionResult =
  | { ok: true; documentId?: string; downloadUrl?: string }
  | { ok: false; error: string };

function friendlyError(e: unknown): string {
  return mapDatabaseErrorToUserMessage(e) ?? "Não foi possível salvar. Tente novamente.";
}

type NoteInsert = {
  account_id: string;
  kind: LedgerKind;
  student_id: string | null;
  product_id: string | null;
  product_variant_id: string | null;
  title: string;
  product_name: string | null;
  size_label: string | null;
  quantity: number;
  total_cents: number;
  installment_count: number;
  payment_method: string;
  note: string | null;
  updated_at: string;
};

type ParcelInsert = {
  note_id: string;
  account_id: string;
  sequence: number;
  amount_cents: number;
};

async function insertNote(userClient: SupabaseClient, row: NoteInsert): Promise<string> {
  const { data, error } = await ledgerClient(userClient)
    .from("product_ledger_notes")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function insertParcels(userClient: SupabaseClient, rows: ParcelInsert[]): Promise<void> {
  const { error } = await ledgerClient(userClient).from("product_ledger_installments").insert(rows);
  if (error) throw error;
}

async function requireProfessor() {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") {
    return {
      ok: false as const,
      error: "Conta da academia indisponível. Volte a iniciar sessão.",
    };
  }
  return { ok: true as const, ctx };
}

function fieldError(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): string {
  return Object.values(error.flatten().fieldErrors).flat()[0] ?? "Corrija os campos destacados.";
}

async function buildNoteDraft(
  supabase: SupabaseClient,
  accountId: string,
  data: CreateLedgerNoteInput,
): Promise<{ ok: true; draft: Omit<NoteInsert, "updated_at"> } | { ok: false; error: string }> {
  let title = data.kind === "outlay" ? data.title : "";
  let productName: string | null = null;
  let sizeLabel: string | null = null;
  let quantity = 1;
  let studentId: string | null = null;
  let productId: string | null = null;
  let productVariantId: string | null = null;

  if (data.kind === "sale") {
    studentId = data.studentId;
    productId = data.productId;
    productVariantId = data.productVariantId ?? null;
    quantity = data.quantity;
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", data.productId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (productError) throw productError;
    if (!product) return { ok: false, error: "Produto não encontrado." };
    productName = product.name as string;
    if (productVariantId) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("id, size_label, product_id")
        .eq("id", productVariantId)
        .maybeSingle();
      if (variantError) throw variantError;
      if (!variant || variant.product_id !== product.id) {
        return { ok: false, error: "Tamanho não encontrado." };
      }
      sizeLabel = variant.size_label as string;
    }
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("id", studentId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student) return { ok: false, error: "Aluno não encontrado." };
    title = `${productName}${sizeLabel ? ` ${sizeLabel}` : ""} · ${student.full_name}`;
  }

  return {
    ok: true,
    draft: {
      account_id: accountId,
      kind: data.kind,
      student_id: studentId,
      product_id: productId,
      product_variant_id: productVariantId,
      title,
      product_name: productName,
      size_label: sizeLabel,
      quantity,
      total_cents: data.totalCents,
      installment_count: data.installmentCount,
      payment_method: data.paymentMethod,
      note: data.note?.trim() || null,
    },
  };
}

export async function createLedgerNote(input: unknown): Promise<LedgerActionResult> {
  const parsed = createLedgerNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fieldError(parsed.error) };

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const accountId = auth.ctx.account.id;
    const built = await buildNoteDraft(supabase, accountId, parsed.data);
    if (!built.ok) return built;
    const amounts = splitInstallments(parsed.data.totalCents, parsed.data.installmentCount);
    const noteId = await insertNote(supabase, {
      ...built.draft,
      updated_at: new Date().toISOString(),
    });
    await insertParcels(
      supabase,
      amounts.map((amountCents, index) => ({
        note_id: noteId,
        account_id: accountId,
        sequence: index + 1,
        amount_cents: amountCents,
      })),
    );

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function updateLedgerNote(input: unknown): Promise<LedgerActionResult> {
  const parsed = updateLedgerNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fieldError(parsed.error) };

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const ledger = ledgerClient(supabase);
    const accountId = auth.ctx.account.id;
    const { noteId, ...fields } = parsed.data;
    const { data: existing, error } = await ledger
      .from("product_ledger_notes")
      .select(
        "id, kind, student_id, product_id, product_variant_id, quantity, total_cents, installment_count, product_ledger_installments(paid_at)",
      )
      .eq("id", noteId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (error) throw error;
    if (!existing) return { ok: false, error: "Anotação não encontrada." };

    const paid = (
      (existing.product_ledger_installments as Array<{ paid_at: string | null }>) ?? []
    ).some((row) => row.paid_at);
    const sameShape =
      existing.kind === fields.kind &&
      Number(existing.total_cents) === fields.totalCents &&
      existing.installment_count === fields.installmentCount &&
      Number(existing.quantity) === (fields.kind === "sale" ? fields.quantity : 1) &&
      ((existing.student_id as string | null) ?? null) ===
        (fields.kind === "sale" ? fields.studentId : null) &&
      ((existing.product_id as string | null) ?? null) ===
        (fields.kind === "sale" ? fields.productId : null) &&
      ((existing.product_variant_id as string | null) ?? null) ===
        (fields.kind === "sale" ? (fields.productVariantId ?? null) : null);

    if (paid && !sameShape) {
      return {
        ok: false,
        error:
          "Esta anotação já tem parcela paga. Altere só o lembrete e o pagamento, ou exclua o registro.",
      };
    }

    const now = new Date().toISOString();
    if (paid) {
      const { error: updateError } = await ledger
        .from("product_ledger_notes")
        .update({
          payment_method: fields.paymentMethod,
          note: fields.note?.trim() || null,
          ...(fields.kind === "outlay" ? { title: fields.title } : {}),
          updated_at: now,
        })
        .eq("id", noteId)
        .eq("account_id", accountId);
      if (updateError) throw updateError;
      revalidatePath(ROUTES.produtos);
      return { ok: true };
    }

    const built = await buildNoteDraft(supabase, accountId, fields);
    if (!built.ok) return built;
    const { error: updateError } = await ledger
      .from("product_ledger_notes")
      .update({ ...built.draft, updated_at: now })
      .eq("id", noteId)
      .eq("account_id", accountId);
    if (updateError) throw updateError;

    const { error: deleteParcelsError } = await ledger
      .from("product_ledger_installments")
      .delete()
      .eq("note_id", noteId)
      .eq("account_id", accountId);
    if (deleteParcelsError) throw deleteParcelsError;

    const amounts = splitInstallments(fields.totalCents, fields.installmentCount);
    await insertParcels(
      supabase,
      amounts.map((amountCents, index) => ({
        note_id: noteId,
        account_id: accountId,
        sequence: index + 1,
        amount_cents: amountCents,
      })),
    );

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function deleteLedgerNote(input: unknown): Promise<LedgerActionResult> {
  const parsed = deleteLedgerNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Anotação inválida." };

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const { data, error } = await ledgerClient(supabase)
      .from("product_ledger_notes")
      .delete()
      .eq("id", parsed.data.noteId)
      .eq("account_id", auth.ctx.account.id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return { ok: false, error: "Anotação não encontrada." };

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function markLedgerInstallmentPaid(input: unknown): Promise<LedgerActionResult> {
  const parsed = markLedgerInstallmentPaidSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Parcela inválida." };

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const ledger = ledgerClient(supabase);
    const { data: row, error } = await ledger
      .from("product_ledger_installments")
      .select("id, paid_at")
      .eq("id", parsed.data.installmentId)
      .eq("account_id", auth.ctx.account.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) return { ok: false, error: "Parcela não encontrada." };
    if (row.paid_at) return { ok: true };

    const { error: updateError } = await ledger
      .from("product_ledger_installments")
      .update({ paid_at: new Date().toISOString() })
      .eq("id", parsed.data.installmentId)
      .eq("account_id", auth.ctx.account.id);
    if (updateError) throw updateError;

    revalidatePath(ROUTES.produtos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function issueLedgerReceipt(input: unknown): Promise<LedgerActionResult> {
  const parsed = issueLedgerReceiptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Venda inválida." };

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const { data: note, error } = await ledgerClient(supabase)
      .from("product_ledger_notes")
      .select(
        "id, kind, student_id, product_name, size_label, quantity, installment_count, payment_method, total_cents, product_ledger_installments(amount_cents, paid_at)",
      )
      .eq("id", parsed.data.noteId)
      .eq("account_id", auth.ctx.account.id)
      .maybeSingle();
    if (error) throw error;
    if (!note) return { ok: false, error: "Anotação não encontrada." };

    const installments = (
      (note.product_ledger_installments as Array<{
        amount_cents: number;
        paid_at: string | null;
      }>) ?? []
    ).map((row) => ({ amountCents: row.amount_cents, paidAt: row.paid_at }));
    const remaining = classifyLedgerNote(
      note.kind as LedgerKind,
      Number(note.total_cents),
      installments,
    ).remainingCents;
    if (!canIssueSaleReceipt(note.kind as LedgerKind, remaining) || !note.student_id) {
      return { ok: false, error: "O recibo só sai quando a venda estiver quitada." };
    }

    const method = note.payment_method as keyof typeof LEDGER_PAYMENT_METHOD_LABELS;
    const description = saleReceiptDescription({
      productName: (note.product_name as string) || "produto",
      sizeLabel: (note.size_label as string | null) ?? null,
      quantity: note.quantity as number,
      installmentCount: note.installment_count as number,
      paymentMethodLabel: LEDGER_PAYMENT_METHOD_LABELS[method] ?? String(note.payment_method),
    });

    const lastPaid =
      installments.filter((row) => row.paidAt).sort((a, b) => (a.paidAt ?? "").localeCompare(b.paidAt ?? ""))[
        installments.filter((row) => row.paidAt).length - 1
      ]?.paidAt ?? new Date().toISOString();

    const built = await buildManualReceiptPayload(supabase, {
      accountId: auth.ctx.account.id,
      studentId: note.student_id as string,
      amountCents: Number(note.total_cents),
      description,
      paidAt: lastPaid.slice(0, 10),
    });
    const generated = await new DocumentGenerationService(supabase).generate({
      accountId: auth.ctx.account.id,
      type: "manual_receipt",
      payload: built.payload,
      studentId: note.student_id as string,
      idempotencyKey: ledgerNoteIdempotencyKey(note.id as string),
      createdByUserId: auth.ctx.user.id,
    });
    if (!generated.ok) return { ok: false, error: generated.errorMessage };

    const download = await getDocumentDownloadUrl({ documentId: generated.documentId });
    revalidatePath(ROUTES.produtos);
    revalidatePath(ROUTES.documentos);
    return {
      ok: true,
      documentId: generated.documentId,
      downloadUrl: download.ok ? download.url : undefined,
    };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}
