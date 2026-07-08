"use server";

import { revalidatePath } from "next/cache";

import { mapDocumentActionError } from "@/lib/documents/action-errors";
import {
  PayloadBuildError,
  buildEnrollmentLiabilityFormPayload,
} from "@/lib/documents/payload-builder";
import { DocumentGenerationService } from "@/lib/documents/service";
import { logDocumentEvent, maskPhone } from "@/lib/documents/audit";
import { createDocumentSignedUrl } from "@/lib/documents/storage";
import {
  buildWhatsAppShareUrl,
  composeEnrollmentLiabilityWhatsAppMessage,
  normalizePhoneE164,
} from "@/lib/documents/whatsapp";
import {
  DOC_SIGNING_TTL_SECONDS,
  buildSigningPageUrl,
  generateSigningToken,
} from "@/lib/documents/signing/token";
import {
  uploadSignedArtifact,
} from "@/lib/documents/signing/merge-signed-pdf";
import type {
  DocumentSignatureStatus,
  EnrollmentLiabilityFormPayload,
} from "@/lib/documents/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";
import type { EnrollmentLiabilityDraftInput } from "@/lib/documents/templates/enrollment-liability-form/v1/schema";
import {
  ROUTES,
  routeMatriculaTermo,
  routeMatriculaTermoNovo,
} from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  createEnrollmentLiabilityDraftSchema,
  enrollmentLiabilityDocumentIdSchema,
  listEnrollmentLiabilityFormsSchema,
  updateEnrollmentLiabilityDraftSchema,
} from "@/lib/validations/enrollment-liability-forms";

export type EnrollmentLiabilityFormRow = {
  id: string;
  student_id: string;
  student_name: string | null;
  status: "pending" | "ready" | "failed" | "archived";
  signature_status: DocumentSignatureStatus | null;
  number: string | null;
  version: number;
  variant: "adult" | "minor" | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
};

export type EnrollmentLiabilityFormDetail = EnrollmentLiabilityFormRow & {
  draft: EnrollmentLiabilityDraftInput | null;
  payload: EnrollmentLiabilityFormPayload | null;
  signed_storage_key: string | null;
  signing_expires_at: string | null;
  whatsapp_phone: string | null;
  whatsapp_disabled_reason: string | null;
};

type ActionOk<T> = { ok: true } & T;
type ActionErr = { ok: false; error: string };

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

function resolveWhatsAppPhone(args: {
  variant: "adult" | "minor" | null;
  studentPhone: string | null;
  guardianPhone: string | null;
  payload: EnrollmentLiabilityFormPayload | null;
}): { phoneE164: string | null; reason: string | null } {
  if (args.variant === "minor") {
    const fromStudent = normalizePhoneE164(args.guardianPhone);
    if (fromStudent) return { phoneE164: fromStudent, reason: null };
    const fromPayload = normalizePhoneE164(args.payload?.guardian?.phone ?? null);
    if (fromPayload) return { phoneE164: fromPayload, reason: null };
    return {
      phoneE164: null,
      reason: "Cadastre o telefone do responsável (guardian_phone) para enviar.",
    };
  }
  const phone = normalizePhoneE164(args.studentPhone);
  if (phone) return { phoneE164: phone, reason: null };
  return {
    phoneE164: null,
    reason: "Aluno sem telefone válido para WhatsApp.",
  };
}

async function issueSigningToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  documentId: string,
  accountId: string,
) {
  const { token, hash } = generateSigningToken();
  const expiresAt = new Date(Date.now() + DOC_SIGNING_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabase
    .from("generated_documents")
    .update({
      signature_status: "awaiting_signature",
      signing_token_hash: hash,
      signing_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("account_id", accountId);

  if (error) throw error;

  logDocumentEvent({
    level: "info",
    event: "document.signing_link.generated",
    documentId,
    documentType: "enrollment_liability_form",
    accountId,
  });

  return { token, signingUrl: buildSigningPageUrl(token) };
}

function mapBuildError(err: unknown): string {
  if (err instanceof PayloadBuildError) {
    switch (err.code) {
      case "STUDENT_NOT_FOUND":
        return "Aluno não encontrado.";
      case "NO_OPEN_PLAN":
        return "O aluno precisa de um plano activo.";
      case "GUARDIAN_REQUIRED":
        return "Informe os dados do responsável legal.";
      case "ACCOUNT_NOT_FOUND":
        return "Conta não encontrada.";
    }
  }
  return mapDocumentActionError(err);
}

function isDraftPayload(
  payload: unknown,
): payload is EnrollmentLiabilityDraftInput {
  if (!payload || typeof payload !== "object") return false;
  return "studentId" in payload && "studentAddress" in payload;
}

function extractVariant(
  payload: unknown,
): "adult" | "minor" | null {
  if (!payload || typeof payload !== "object") return null;
  if ("variant" in payload) {
    const v = (payload as { variant?: string }).variant;
    if (v === "adult" || v === "minor") return v;
  }
  if (isDraftPayload(payload) && payload.guardian) return "minor";
  if (isDraftPayload(payload)) return "adult";
  return null;
}

export async function createEnrollmentLiabilityDraft(
  input: unknown,
): Promise<ActionOk<{ documentId: string }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = createEnrollmentLiabilityDraftSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados do formulário.";
    return { ok: false, error: msg };
  }

  try {
    await buildEnrollmentLiabilityFormPayload(ctx.supabase, {
      accountId: ctx.accountId,
      draft: parsed.data,
    });
  } catch (e) {
    return { ok: false, error: mapBuildError(e) };
  }

  const { data, error } = await ctx.supabase
    .from("generated_documents")
    .insert({
      account_id: ctx.accountId,
      type: "enrollment_liability_form",
      status: "pending",
      student_id: parsed.data.studentId,
      payload_json: parsed.data,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Não foi possível criar o rascunho." };
  }

  revalidatePath(ROUTES.matriculasTermos);
  revalidatePath(`${ROUTES.alunos}/${parsed.data.studentId}`);
  return { ok: true, documentId: data.id as string };
}

export async function updateEnrollmentLiabilityDraft(
  input: unknown,
): Promise<ActionOk<{ documentId: string }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = updateEnrollmentLiabilityDraftSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados do formulário.";
    return { ok: false, error: msg };
  }

  const { data: row } = await ctx.supabase
    .from("generated_documents")
    .select("id, status, pdf_path, student_id")
    .eq("id", parsed.data.documentId)
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  if (!row) return { ok: false, error: "Documento não encontrado." };
  if (row.pdf_path) {
    return { ok: false, error: "Documentos já gerados não podem ser editados." };
  }

  try {
    await buildEnrollmentLiabilityFormPayload(ctx.supabase, {
      accountId: ctx.accountId,
      draft: parsed.data.draft,
    });
  } catch (e) {
    return { ok: false, error: mapBuildError(e) };
  }

  const { error } = await ctx.supabase
    .from("generated_documents")
    .update({
      payload_json: parsed.data.draft,
      student_id: parsed.data.draft.studentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.documentId);

  if (error) return { ok: false, error: "Não foi possível actualizar o rascunho." };

  revalidatePath(routeMatriculaTermo(parsed.data.documentId));
  revalidatePath(ROUTES.matriculasTermos);
  return { ok: true, documentId: parsed.data.documentId };
}

export async function generateEnrollmentLiabilityPdf(
  input: unknown,
): Promise<
  | ActionOk<{ documentId: string; number: string; downloadUrl: string }>
  | ActionErr
> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = enrollmentLiabilityDocumentIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Documento inválido." };

  const { data: row } = await ctx.supabase
    .from("generated_documents")
    .select("id, status, pdf_path, payload_json, student_id, number")
    .eq("id", parsed.data.documentId)
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  if (!row) return { ok: false, error: "Documento não encontrado." };
  if (row.pdf_path && row.status === "ready") {
    const url = await createDocumentSignedUrl(ctx.supabase, row.pdf_path as string);
    return {
      ok: true,
      documentId: row.id as string,
      number: (row.number as string | null) ?? "",
      downloadUrl: url,
    };
  }

  if (!isDraftPayload(row.payload_json)) {
    return { ok: false, error: "Rascunho inválido ou incompleto." };
  }

  try {
    const built = await buildEnrollmentLiabilityFormPayload(ctx.supabase, {
      accountId: ctx.accountId,
      draft: row.payload_json,
    });

    const service = new DocumentGenerationService(ctx.supabase);
    const result = await service.generate({
      accountId: ctx.accountId,
      type: "enrollment_liability_form",
      payload: built.payload,
      studentId: built.studentId,
      existingDocumentId: row.id as string,
      createdByUserId: ctx.userId,
    });

    if (!result.ok) return { ok: false, error: result.errorMessage };

    const downloadUrl = await createDocumentSignedUrl(
      ctx.supabase,
      result.pdfPath,
    );

    revalidatePath(routeMatriculaTermo(row.id as string));
    revalidatePath(ROUTES.matriculasTermos);
    revalidatePath(`${ROUTES.alunos}/${built.studentId}`);

    return {
      ok: true,
      documentId: result.documentId,
      number: result.number,
      downloadUrl,
    };
  } catch (e) {
    return { ok: false, error: mapBuildError(e) };
  }
}

export async function listEnrollmentLiabilityForms(
  input: unknown = {},
): Promise<ActionOk<{ rows: EnrollmentLiabilityFormRow[] }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = listEnrollmentLiabilityFormsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Filtros inválidos." };

  let q = ctx.supabase
    .from("generated_documents")
    .select(
      "id, student_id, status, signature_status, number, version, pdf_path, payload_json, created_at, updated_at, error_message, students ( full_name )",
    )
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.studentId) {
    q = q.eq("student_id", parsed.data.studentId);
  }
  if (parsed.data.signatureStatus) {
    q = q.eq("signature_status", parsed.data.signatureStatus);
  }
  if (parsed.data.month) {
    const [y, m] = parsed.data.month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 1)).toISOString();
    q = q.gte("created_at", start).lt("created_at", end);
  }

  const { data, error } = await q;
  if (error) return { ok: false, error: "Não foi possível listar os documentos." };

  const rows: EnrollmentLiabilityFormRow[] = (data ?? []).map((r) => {
    const studentEmbed = r.students as { full_name: string } | { full_name: string }[] | null;
    const studentName = Array.isArray(studentEmbed)
      ? studentEmbed[0]?.full_name ?? null
      : studentEmbed?.full_name ?? null;
    return {
      id: r.id as string,
      student_id: r.student_id as string,
      student_name: studentName,
      status: r.status as EnrollmentLiabilityFormRow["status"],
      signature_status: (r.signature_status as DocumentSignatureStatus | null) ?? null,
      number: (r.number as string | null) ?? null,
      version: Number(r.version ?? 1),
      variant: extractVariant(r.payload_json),
      pdf_path: (r.pdf_path as string | null) ?? null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      error_message: (r.error_message as string | null) ?? null,
    };
  });

  return { ok: true, rows };
}

export async function getEnrollmentLiabilityForm(
  documentId: string,
): Promise<ActionOk<{ detail: EnrollmentLiabilityFormDetail }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { data, error } = await ctx.supabase
    .from("generated_documents")
    .select(
      "id, student_id, status, signature_status, number, version, pdf_path, signed_storage_key, signing_expires_at, payload_json, created_at, updated_at, error_message, students ( full_name, phone, guardian_phone, birth_date )",
    )
    .eq("id", documentId)
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Documento não encontrado." };

  const studentEmbed = data.students as
    | { full_name: string; phone: string | null; guardian_phone: string | null }
    | { full_name: string; phone: string | null; guardian_phone: string | null }[]
    | null;
  const studentRow = Array.isArray(studentEmbed) ? studentEmbed[0] : studentEmbed;
  const studentName = studentRow?.full_name ?? null;

  const payloadJson = data.payload_json;
  const isDraft = !data.pdf_path && isDraftPayload(payloadJson);
  const payload = !isDraft ? (payloadJson as EnrollmentLiabilityFormPayload) : null;
  const variant = extractVariant(payloadJson);
  const phoneInfo = resolveWhatsAppPhone({
    variant,
    studentPhone: studentRow?.phone ?? null,
    guardianPhone: studentRow?.guardian_phone ?? null,
    payload,
  });

  const detail: EnrollmentLiabilityFormDetail = {
    id: data.id as string,
    student_id: data.student_id as string,
    student_name: studentName,
    status: data.status as EnrollmentLiabilityFormRow["status"],
    signature_status: (data.signature_status as DocumentSignatureStatus | null) ?? null,
    number: (data.number as string | null) ?? null,
    version: Number(data.version ?? 1),
    variant,
    pdf_path: (data.pdf_path as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    error_message: (data.error_message as string | null) ?? null,
    draft: isDraft ? payloadJson : null,
    payload,
    signed_storage_key: (data.signed_storage_key as string | null) ?? null,
    signing_expires_at: (data.signing_expires_at as string | null) ?? null,
    whatsapp_phone: phoneInfo.phoneE164,
    whatsapp_disabled_reason: phoneInfo.reason,
  };

  return { ok: true, detail };
}

export async function getEnrollmentLiabilityDownloadUrl(
  input: unknown,
): Promise<ActionOk<{ url: string; label: string }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = enrollmentLiabilityDocumentIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Documento inválido." };

  const { data } = await ctx.supabase
    .from("generated_documents")
    .select("pdf_path, signed_storage_key, number, status, signature_status")
    .eq("id", parsed.data.documentId)
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  const path =
    data?.signature_status === "signed" && data.signed_storage_key
      ? (data.signed_storage_key as string)
      : (data?.pdf_path as string | null);

  if (!path || data?.status !== "ready") {
    return { ok: false, error: "PDF ainda não disponível." };
  }

  const url = await createDocumentSignedUrl(ctx.supabase, path);
  return {
    ok: true,
    url,
    label: `${DOCUMENT_TYPE_LABELS.enrollment_liability_form} ${data?.number ?? ""}`.trim(),
  };
}

const MAX_SIGNED_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function sendEnrollmentLiabilityWhatsApp(
  input: unknown,
): Promise<ActionOk<{ url: string; signingUrl: string }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = enrollmentLiabilityDocumentIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Documento inválido." };

  const detailResult = await getEnrollmentLiabilityForm(parsed.data.documentId);
  if (!detailResult.ok) return { ok: false, error: detailResult.error };

  const { detail } = detailResult;
  if (!detail.pdf_path || detail.status !== "ready") {
    return { ok: false, error: "Gere o PDF antes de enviar." };
  }
  if (detail.signature_status === "signed") {
    return { ok: false, error: "Documento já assinado." };
  }
  if (!detail.whatsapp_phone) {
    return { ok: false, error: detail.whatsapp_disabled_reason ?? "Telefone inválido." };
  }

  try {
    const { signingUrl } = await issueSigningToken(
      ctx.supabase,
      detail.id,
      ctx.accountId,
    );

    const { data: account } = await ctx.supabase
      .from("accounts")
      .select("name, legal_name")
      .eq("id", ctx.accountId)
      .maybeSingle();

    const academyName =
      (account?.legal_name as string | null) ??
      (account?.name as string) ??
      "Sua academia";

    const recipientName =
      detail.variant === "minor"
        ? detail.payload?.guardian?.fullName
        : detail.student_name;

    const message = composeEnrollmentLiabilityWhatsAppMessage({
      documentNumber: detail.number ?? "",
      academyName,
      signingUrl,
      recipientFirstName: recipientName?.split(/\s+/)[0] ?? null,
    });

    const url = buildWhatsAppShareUrl({
      phoneE164: detail.whatsapp_phone,
      message,
    });

    await ctx.supabase.from("generated_document_deliveries").insert({
      document_id: detail.id,
      channel: "whatsapp",
      status: "requested",
      metadata_json: {
        phone_masked: maskPhone(detail.whatsapp_phone),
        signing_url_host: new URL(signingUrl).host,
      },
      performed_by: ctx.userId,
    });

    revalidatePath(routeMatriculaTermo(detail.id));
    return { ok: true, url, signingUrl };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export async function uploadSignedEnrollmentDocument(
  formData: FormData,
): Promise<ActionOk<{ documentId: string }> | ActionErr> {
  const ctx = await requireAccountContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const documentId = formData.get("documentId");
  const file = formData.get("file");

  const idParsed = enrollmentLiabilityDocumentIdSchema.safeParse({ documentId });
  if (!idParsed.success || !(file instanceof File)) {
    return { ok: false, error: "Envio inválido." };
  }

  if (file.size > MAX_SIGNED_UPLOAD_BYTES) {
    return { ok: false, error: "Arquivo excede 10 MB." };
  }

  const mime = file.type;
  const allowed = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowed.includes(mime)) {
    return { ok: false, error: "Use PDF, PNG ou JPEG." };
  }

  const { data: row } = await ctx.supabase
    .from("generated_documents")
    .select("id, account_id, status, signature_status")
    .eq("id", idParsed.data.documentId)
    .eq("account_id", ctx.accountId)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  if (!row || row.status !== "ready") {
    return { ok: false, error: "Documento não encontrado." };
  }
  if (row.signature_status === "signed") {
    return { ok: false, error: "Documento já está assinado." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadSignedArtifact(ctx.supabase, {
      accountId: ctx.accountId,
      documentId: row.id as string,
      content: buffer,
      mimeType: mime,
    });

    await ctx.supabase
      .from("generated_documents")
      .update({
        signature_status: "signed",
        signed_at: new Date().toISOString(),
        signed_storage_key: uploaded.path,
        signed_mime_type: mime,
        signed_checksum_sha256: uploaded.checksum,
        signing_token_hash: null,
        signing_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    logDocumentEvent({
      level: "info",
      event: "document.signed",
      documentId: row.id as string,
      documentType: "enrollment_liability_form",
      accountId: ctx.accountId,
      payload: { source: "manual_upload" },
    });

    revalidatePath(routeMatriculaTermo(row.id as string));
    revalidatePath(ROUTES.matriculasTermos);
    return { ok: true, documentId: row.id as string };
  } catch (e) {
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export async function reissueEnrollmentLiabilityForm(input: {
  documentId: string;
  reason: string;
}): Promise<ActionOk<{ documentId: string; number: string }> | ActionErr> {
  const { reissueDocument } = await import("@/actions/documents");
  const r = await reissueDocument({
    documentId: input.documentId,
    reason: input.reason,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(routeMatriculaTermo(r.documentId));
  return { ok: true, documentId: r.documentId, number: r.number };
}

export { routeMatriculaTermoNovo };
