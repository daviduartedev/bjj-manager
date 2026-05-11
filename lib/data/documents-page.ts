import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import type { DocumentType } from "@/lib/documents/types";

export type DocumentListRow = {
  id: string;
  type: DocumentType;
  status: "pending" | "ready" | "failed" | "archived";
  number: string | null;
  version: number;
  reissue_reason: string | null;
  supersedes_id: string | null;
  student_id: string | null;
  student_name: string | null;
  payment_id: string | null;
  byte_size: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
};

export type LoadDocumentsFilters = {
  type?: DocumentType;
  status?: "pending" | "ready" | "failed" | "archived";
  studentId?: string;
};

export async function loadDocumentsPageData(
  filters: LoadDocumentsFilters = {},
): Promise<{ ctx: Awaited<ReturnType<typeof getCurrentAccount>>; rows: DocumentListRow[] }> {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, rows: [] };

  const supabase = await createClient();
  let q = supabase
    .from("generated_documents")
    .select(
      "id, type, status, number, version, supersedes_id, reissue_reason, student_id, payment_id, byte_size, error_code, error_message, created_at, students(full_name)",
    )
    .eq("account_id", ctx.account.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.type) q = q.eq("type", filters.type);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.studentId) q = q.eq("student_id", filters.studentId);

  const { data, error } = await q;
  if (error) throw error;

  const rows: DocumentListRow[] = ((data ?? []) as Array<Record<string, unknown>>).map(
    (raw) => {
      const studentField = raw.students as
        | { full_name: string }
        | { full_name: string }[]
        | null;
      const student = Array.isArray(studentField) ? studentField[0] : studentField;
      return {
        id: raw.id as string,
        type: raw.type as DocumentType,
        status: raw.status as DocumentListRow["status"],
        number: (raw.number as string | null) ?? null,
        version: raw.version as number,
        reissue_reason: (raw.reissue_reason as string | null) ?? null,
        supersedes_id: (raw.supersedes_id as string | null) ?? null,
        student_id: (raw.student_id as string | null) ?? null,
        student_name: student?.full_name ?? null,
        payment_id: (raw.payment_id as string | null) ?? null,
        byte_size: (raw.byte_size as number | null) ?? null,
        error_code: (raw.error_code as string | null) ?? null,
        error_message: (raw.error_message as string | null) ?? null,
        created_at: raw.created_at as string,
      };
    },
  );

  return { ctx, rows };
}

export async function loadDocumentById(documentId: string): Promise<{
  doc: DocumentListRow | null;
  payload: Record<string, unknown> | null;
}> {
  const ctx = await getCurrentAccount();
  if (!ctx) return { doc: null, payload: null };
  const supabase = await createClient();
  const { data } = await supabase
    .from("generated_documents")
    .select(
      "id, type, status, number, version, supersedes_id, reissue_reason, student_id, payment_id, pdf_path, byte_size, error_code, error_message, payload_json, created_at, students(full_name)",
    )
    .eq("id", documentId)
    .eq("account_id", ctx.account.id)
    .maybeSingle();
  if (!data) return { doc: null, payload: null };
  const studentField = (data as { students?: { full_name: string } | { full_name: string }[] | null }).students ?? null;
  const student = Array.isArray(studentField) ? studentField[0] : studentField;
  const doc: DocumentListRow = {
    id: data.id as string,
    type: data.type as DocumentType,
    status: data.status as DocumentListRow["status"],
    number: (data.number as string | null) ?? null,
    version: data.version as number,
    reissue_reason: (data.reissue_reason as string | null) ?? null,
    supersedes_id: (data.supersedes_id as string | null) ?? null,
    student_id: (data.student_id as string | null) ?? null,
    student_name: student?.full_name ?? null,
    payment_id: (data.payment_id as string | null) ?? null,
    byte_size: (data.byte_size as number | null) ?? null,
    error_code: (data.error_code as string | null) ?? null,
    error_message: (data.error_message as string | null) ?? null,
    created_at: data.created_at as string,
  };
  return { doc, payload: (data.payload_json as Record<string, unknown>) ?? null };
}
