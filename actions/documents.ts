"use server";

import { revalidatePath } from "next/cache";

import { mapDocumentActionError } from "@/lib/documents/action-errors";
import {
  PayloadBuildError,
  buildCertificatePayload,
  buildEnrollmentProofPayload,
  buildLiabilityTermPayload,
  buildManualReceiptPayload,
  buildPaymentReceiptPayload,
} from "@/lib/documents/payload-builder";
import { DocumentGenerationService } from "@/lib/documents/service";
import {
  createDocumentSignedUrl,
} from "@/lib/documents/storage";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@/lib/documents/types";
import {
  buildWhatsAppShareUrl,
  composeDocumentWhatsAppMessage,
  normalizePhoneE164,
} from "@/lib/documents/whatsapp";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  documentIdSchema,
  generateDocumentSchema,
  listDocumentsSchema,
  reissueDocumentSchema,
} from "@/lib/validations/documents";

export type GenerateDocumentResult =
  | {
      ok: true;
      documentId: string;
      number: string;
      pdfPath: string;
      reused: boolean;
    }
  | { ok: false; error: string };

export type GetSignedUrlResult =
  | { ok: true; url: string; documentNumber: string; type: DocumentType }
  | { ok: false; error: string };

export type WhatsAppShareResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export type DocumentRow = {
  id: string;
  type: DocumentType;
  status: "pending" | "ready" | "failed" | "archived";
  number: string | null;
  version: number;
  supersedes_id: string | null;
  reissue_reason: string | null;
  student_id: string | null;
  payment_id: string | null;
  pdf_path: string | null;
  byte_size: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

async function requireAccountContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sessão inválida." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.account_id) {
    return { ok: false as const, error: "Conta não encontrada." };
  }
  return {
    ok: true as const,
    supabase,
    accountId: profile.account_id as string,
    userId: user.id,
  };
}

function mapPayloadError(err: unknown): string {
  if (err instanceof PayloadBuildError) {
    switch (err.code) {
      case "PAYMENT_NOT_FOUND":
        return "Pagamento não encontrado.";
      case "PAYMENT_NOT_PAID":
        return "Apenas pagamentos confirmados geram recibo.";
      case "STUDENT_NOT_FOUND":
        return "Aluno não encontrado.";
      case "ACCOUNT_NOT_FOUND":
        return "Conta não encontrada.";
    }
  }
  return mapDocumentActionError(err);
}

export async function generateDocument(input: unknown): Promise<GenerateDocumentResult> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = generateDocumentSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados do documento.";
    return { ok: false, error: msg };
  }

  try {
    const { supabase, accountId, userId } = ctx;
    const service = new DocumentGenerationService(supabase);

    if (parsed.data.type === "payment_receipt") {
      const built = await buildPaymentReceiptPayload(supabase, {
        accountId,
        paymentId: parsed.data.paymentId,
      });
      const r = await service.generate({
        accountId,
        type: "payment_receipt",
        payload: built.payload,
        idempotencyKey: parsed.data.paymentId,
        paymentId: parsed.data.paymentId,
        studentId: built.studentId,
        createdByUserId: userId,
      });
      if (!r.ok) return { ok: false, error: r.errorMessage };
      revalidatePath(ROUTES.mensalidades);
      revalidatePath(`${ROUTES.alunos}/${built.studentId}`);
      return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: r.reused };
    }

    if (parsed.data.type === "enrollment_proof") {
      const built = await buildEnrollmentProofPayload(supabase, {
        accountId,
        studentId: parsed.data.studentId,
      });
      const r = await service.generate({
        accountId,
        type: "enrollment_proof",
        payload: built.payload,
        studentId: parsed.data.studentId,
        createdByUserId: userId,
      });
      if (!r.ok) return { ok: false, error: r.errorMessage };
      revalidatePath(`${ROUTES.alunos}/${parsed.data.studentId}`);
      return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: r.reused };
    }

    if (parsed.data.type === "certificate") {
      const built = await buildCertificatePayload(supabase, {
        accountId,
        studentId: parsed.data.studentId,
        title: parsed.data.title,
        description: parsed.data.description,
      });
      const r = await service.generate({
        accountId,
        type: "certificate",
        payload: built.payload,
        studentId: parsed.data.studentId,
        createdByUserId: userId,
      });
      if (!r.ok) return { ok: false, error: r.errorMessage };
      revalidatePath(`${ROUTES.alunos}/${parsed.data.studentId}`);
      return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: r.reused };
    }

    if (parsed.data.type === "liability_term") {
      const built = await buildLiabilityTermPayload(supabase, {
        accountId,
        studentId: parsed.data.studentId,
        bodyMarkdown: parsed.data.bodyMarkdown,
        guardianFullName: parsed.data.guardianFullName ?? null,
        guardianDocument: parsed.data.guardianDocument ?? null,
      });
      const r = await service.generate({
        accountId,
        type: "liability_term",
        payload: built.payload,
        studentId: parsed.data.studentId,
        createdByUserId: userId,
      });
      if (!r.ok) return { ok: false, error: r.errorMessage };
      revalidatePath(`${ROUTES.alunos}/${parsed.data.studentId}`);
      return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: r.reused };
    }

    if (parsed.data.type === "manual_receipt") {
      const built = await buildManualReceiptPayload(supabase, {
        accountId,
        studentId: parsed.data.studentId,
        amountCents: parsed.data.amountCents,
        description: parsed.data.description,
        paidAt: parsed.data.paidAt,
        payerFullName: parsed.data.payerFullName ?? null,
        payerDocument: parsed.data.payerDocument ?? null,
      });
      const r = await service.generate({
        accountId,
        type: "manual_receipt",
        payload: built.payload,
        studentId: parsed.data.studentId,
        createdByUserId: userId,
      });
      if (!r.ok) return { ok: false, error: r.errorMessage };
      revalidatePath(`${ROUTES.alunos}/${parsed.data.studentId}`);
      return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: r.reused };
    }

    return { ok: false, error: "Tipo de documento não suportado." };
  } catch (e) {
    return { ok: false, error: mapPayloadError(e) };
  }
}

export async function reissueDocument(input: unknown): Promise<GenerateDocumentResult> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = reissueDocumentSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Indique o motivo da reemissão.";
    return { ok: false, error: msg };
  }

  try {
    const { supabase, accountId, userId } = ctx;

    const { data: original } = await supabase
      .from("generated_documents")
      .select(
        "id, type, payload_json, student_id, payment_id, idempotency_key, version, status",
      )
      .eq("id", parsed.data.documentId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (!original) return { ok: false, error: "Documento não encontrado." };

    const service = new DocumentGenerationService(supabase);
    const r = await service.generate({
      accountId,
      type: original.type as DocumentType,
      payload: { type: original.type, data: original.payload_json } as never,
      studentId: original.student_id ?? null,
      paymentId: original.payment_id ?? null,
      reissue: { supersedesId: original.id as string, reason: parsed.data.reason },
      createdByUserId: userId,
    });
    if (!r.ok) return { ok: false, error: r.errorMessage };

    revalidatePath("/documentos");
    if (original.student_id) revalidatePath(`${ROUTES.alunos}/${original.student_id}`);
    return { ok: true, documentId: r.documentId, number: r.number, pdfPath: r.pdfPath, reused: false };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export async function getDocumentDownloadUrl(
  input: unknown,
): Promise<GetSignedUrlResult> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = documentIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Identificador de documento inválido." };

  try {
    const { supabase, accountId } = ctx;
    const { data, error } = await supabase
      .from("generated_documents")
      .select("id, type, number, pdf_path, status")
      .eq("id", parsed.data.documentId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.pdf_path) {
      return { ok: false, error: "Documento ainda não está disponível." };
    }
    if (data.status !== "ready" && data.status !== "archived") {
      return { ok: false, error: "Documento ainda não está pronto." };
    }
    const url = await createDocumentSignedUrl(supabase, data.pdf_path);

    await supabase.from("generated_document_deliveries").insert({
      document_id: data.id,
      channel: "download",
      status: "completed",
      metadata_json: {},
      performed_by: ctx.userId,
    });

    return {
      ok: true,
      url,
      documentNumber: (data.number as string) ?? "",
      type: data.type as DocumentType,
    };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export async function getWhatsAppShareLink(
  input: unknown,
): Promise<WhatsAppShareResult> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = documentIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Identificador inválido." };

  try {
    const { supabase, accountId } = ctx;
    const { data: doc } = await supabase
      .from("generated_documents")
      .select("id, type, number, pdf_path, student_id, status")
      .eq("id", parsed.data.documentId)
      .eq("account_id", accountId)
      .maybeSingle();
    if (!doc || !doc.pdf_path) {
      return { ok: false, error: "Documento ainda não está disponível." };
    }
    if (!doc.student_id) {
      return { ok: false, error: "Este documento não tem aluno associado." };
    }

    const { data: student } = await supabase
      .from("students")
      .select("full_name, phone")
      .eq("id", doc.student_id)
      .maybeSingle();

    const phoneE164 = normalizePhoneE164(student?.phone ?? null);
    if (!phoneE164) {
      return {
        ok: false,
        error: "Aluno sem telefone válido. Atualize o cadastro antes.",
      };
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("name")
      .eq("id", accountId)
      .maybeSingle();

    const signedUrl = await createDocumentSignedUrl(supabase, doc.pdf_path);
    const firstName = (student?.full_name ?? "").split(/\s+/)[0] || null;

    const message = composeDocumentWhatsAppMessage({
      documentNumber: (doc.number as string) ?? "",
      documentTypeLabel: DOCUMENT_TYPE_LABELS[doc.type as DocumentType],
      signedUrl,
      academyName: (account?.name as string) ?? "Sua academia",
      studentFirstName: firstName,
    });
    const url = buildWhatsAppShareUrl({ phoneE164, message });

    await supabase.from("generated_document_deliveries").insert({
      document_id: doc.id,
      channel: "whatsapp",
      status: "requested",
      metadata_json: { phone_masked: `${phoneE164.slice(0, 4)}***${phoneE164.slice(-2)}` },
      performed_by: ctx.userId,
    });

    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export async function listDocuments(input: unknown): Promise<
  | { ok: true; rows: DocumentRow[] }
  | { ok: false; error: string }
> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = listDocumentsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { ok: false, error: "Filtros inválidos." };
  }

  try {
    const { supabase, accountId } = ctx;
    let query = supabase
      .from("generated_documents")
      .select(
        "id, type, status, number, version, supersedes_id, reissue_reason, student_id, payment_id, pdf_path, byte_size, error_code, error_message, created_at, updated_at",
      )
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(parsed.data.limit);

    if (parsed.data.studentId) query = query.eq("student_id", parsed.data.studentId);
    if (parsed.data.paymentId) query = query.eq("payment_id", parsed.data.paymentId);
    if (parsed.data.type) query = query.eq("type", parsed.data.type);
    if (parsed.data.status) query = query.eq("status", parsed.data.status);

    const { data, error } = await query;
    if (error) throw error;
    return { ok: true, rows: (data as DocumentRow[]) ?? [] };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}
