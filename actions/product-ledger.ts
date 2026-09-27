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
  issueLedgerReceiptSchema,
  markLedgerInstallmentPaidSchema,
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

export async function createLedgerNote(input: unknown): Promise<LedgerActionResult> {
  const parsed = createLedgerNoteSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Corrija os campos destacados.";
    return { ok: false, error: msg };
  }

  const auth = await requireProfessor();
  if (!auth.ok) return auth;

  try {
    const supabase = await createClient();
    const accountId = auth.ctx.account.id;
    const amounts = splitInstallments(parsed.data.totalCents, parsed.data.installmentCount);

    let title = parsed.data.kind === "outlay" ? parsed.data.title : "";
    let productName: string | null = null;
    let sizeLabel: string | null = null;
    let quantity = 1;
    let studentId: string | null = null;
    let productId: string | null = null;
    let productVariantId: string | null = null;

    if (parsed.data.kind === "sale") {
      studentId = parsed.data.studentId;
      productId = parsed.data.productId;
      productVariantId = parsed.data.productVariantId ?? null;
      quantity = parsed.data.quantity;
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", parsed.data.productId)
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

    const noteRow = {
      account_id: accountId,
      kind: parsed.data.kind,
      student_id: studentId,
      product_id: productId,
      product_variant_id: productVariantId,
      title,
      product_name: productName,
      size_label: sizeLabel,
      quantity,
      total_cents: parsed.data.totalCents,
      installment_count: parsed.data.installmentCount,
      payment_method: parsed.data.paymentMethod,
      note: parsed.data.note?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const noteId = await insertNote(supabase, noteRow);
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
