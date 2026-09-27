import { getCurrentAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ledgerClient } from "@/lib/products/ledger-client";
import {
  canIssueSaleReceipt,
  classifyLedgerNote,
  type LedgerBucket,
  type LedgerKind,
  type LedgerPaymentMethod,
} from "@/lib/products/ledger";

export type LedgerStudentOption = { id: string; full_name: string };

export type LedgerInstallmentRow = {
  id: string;
  sequence: number;
  amountCents: number;
  paidAt: string | null;
};

export type LedgerNoteRow = {
  id: string;
  kind: LedgerKind;
  title: string;
  studentName: string | null;
  productName: string | null;
  sizeLabel: string | null;
  quantity: number;
  totalCents: number;
  installmentCount: number;
  paymentMethod: LedgerPaymentMethod;
  note: string | null;
  createdAt: string;
  installments: LedgerInstallmentRow[];
  receivedCents: number;
  remainingCents: number;
  bucket: LedgerBucket;
  canIssueReceipt: boolean;
  receiptDocumentId: string | null;
};

export type ProductLedgerPageData = {
  notes: LedgerNoteRow[];
  students: LedgerStudentOption[];
  available: boolean;
};

export async function loadProductLedgerPageData(): Promise<ProductLedgerPageData> {
  const supabase = await createClient();
  const ctx = await getCurrentAccount();

  const { data: notes, error } =
    ctx?.profile.role === "professor"
      ? await ledgerClient(supabase)
        .from("product_ledger_notes")
        .select(
          "id, kind, title, student_id, product_name, size_label, quantity, total_cents, installment_count, payment_method, note, created_at, students(full_name), product_ledger_installments(id, sequence, amount_cents, paid_at)",
        )
        .eq("account_id", ctx.account.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (error) {
    if (error.code === "42P01" || /product_ledger/i.test(error.message)) {
      return { notes: [], students: [], available: false };
    }
    throw error;
  }

  const noteIds = (notes ?? []).map((row) => row.id as string);
  const receiptByNote = new Map<string, string>();
  if (noteIds.length > 0) {
    const keys = noteIds.map((id) => `product-ledger:${id}`);
    const { data: docs } = await supabase
      .from("generated_documents")
      .select("id, idempotency_key, status")
      .in("idempotency_key", keys)
      .eq("status", "ready");
    for (const doc of docs ?? []) {
      const key = String(doc.idempotency_key ?? "");
      const noteId = key.replace(/^product-ledger:/, "");
      if (noteId) receiptByNote.set(noteId, doc.id as string);
    }
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name");

  return {
    available: true,
    students: (students ?? []).map((row) => ({
      id: row.id as string,
      full_name: row.full_name as string,
    })),
    notes: (notes ?? []).map((row) => {
      const installments = (
        (row.product_ledger_installments as Array<{
          id: string;
          sequence: number;
          amount_cents: number;
          paid_at: string | null;
        }>) ?? []
      )
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({
          id: item.id,
          sequence: item.sequence,
          amountCents: item.amount_cents,
          paidAt: item.paid_at,
        }));
      const kind = row.kind as LedgerKind;
      const classified = classifyLedgerNote(kind, Number(row.total_cents), installments);
      const student = row.students as { full_name: string } | { full_name: string }[] | null;
      const studentName = Array.isArray(student)
        ? student[0]?.full_name ?? null
        : student?.full_name ?? null;
      return {
        id: row.id as string,
        kind,
        title: row.title as string,
        studentName,
        productName: (row.product_name as string | null) ?? null,
        sizeLabel: (row.size_label as string | null) ?? null,
        quantity: row.quantity as number,
        totalCents: Number(row.total_cents),
        installmentCount: row.installment_count as number,
        paymentMethod: row.payment_method as LedgerPaymentMethod,
        note: (row.note as string | null) ?? null,
        createdAt: row.created_at as string,
        installments,
        receivedCents: classified.receivedCents,
        remainingCents: classified.remainingCents,
        bucket: classified.bucket,
        canIssueReceipt: canIssueSaleReceipt(kind, classified.remainingCents),
        receiptDocumentId: receiptByNote.get(row.id as string) ?? null,
      };
    }),
  };
}
