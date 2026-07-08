"use server";

import { z } from "zod";

import { logDocumentEvent, maskName } from "@/lib/documents/audit";
import { mapDocumentActionError } from "@/lib/documents/action-errors";
import type { DocumentPayload, EnrollmentLiabilityFormPayload } from "@/lib/documents/types";
import {
  renderSignedEnrollmentPdf,
  uploadSignedArtifact,
} from "@/lib/documents/signing/merge-signed-pdf";
import {
  buildSigningPageUrl,
  hashSigningToken,
  isSigningTokenExpired,
} from "@/lib/documents/signing/token";
import { createAdminClient } from "@/lib/supabase/admin";

const submitSignatureSchema = z
  .object({
    token: z.string().min(16, "Link inválido."),
    signatureDataUrl: z
      .string()
      .regex(/^data:image\/png;base64,/, "Assinatura inválida."),
  })
  .strict();

export type SigningPageData = {
  documentNumber: string;
  academyName: string;
  studentFirstName: string;
  variant: "adult" | "minor";
  signerLabel: string;
};

async function findDocumentByToken(token: string) {
  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Serviço indisponível." };

  const hash = hashSigningToken(token);
  const { data, error } = await admin
    .from("generated_documents")
    .select(
      "id, account_id, type, status, number, payload_json, signature_status, signing_expires_at, signing_token_hash, pdf_path",
    )
    .eq("signing_token_hash", hash)
    .eq("type", "enrollment_liability_form")
    .maybeSingle();

  if (error) return { ok: false as const, error: "Não foi possível validar o link." };
  if (!data) return { ok: false as const, error: "Link inválido ou expirado." };

  if (data.signature_status === "signed") {
    return { ok: false as const, error: "Este documento já foi assinado." };
  }
  if (isSigningTokenExpired(data.signing_expires_at as string | null)) {
    return { ok: false as const, error: "Link expirado. Peça um novo envio à academia." };
  }
  if (data.status !== "ready" || !data.pdf_path) {
    return { ok: false as const, error: "Documento ainda não está pronto para assinatura." };
  }

  return { ok: true as const, admin, doc: data };
}

export async function getSigningPageData(
  token: string,
): Promise<{ ok: true; data: SigningPageData } | { ok: false; error: string }> {
  const found = await findDocumentByToken(token);
  if (!found.ok) return found;

  const payload = found.doc.payload_json as EnrollmentLiabilityFormPayload;
  const academyName = payload.receiver?.legalName ?? payload.receiver?.academyName ?? "Academia";

  return {
    ok: true,
    data: {
      documentNumber: payload.documentNumber,
      academyName,
      studentFirstName: payload.student.fullName.split(/\s+/)[0] ?? payload.student.fullName,
      variant: payload.variant,
      signerLabel:
        payload.variant === "minor"
          ? payload.guardian?.fullName ?? "Responsável legal"
          : payload.student.fullName,
    },
  };
}

export async function submitSignature(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = submitSignatureSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de assinatura inválidos." };
  }

  const found = await findDocumentByToken(parsed.data.token);
  if (!found.ok) return found;

  try {
    const payload: DocumentPayload = {
      type: "enrollment_liability_form",
      data: found.doc.payload_json as EnrollmentLiabilityFormPayload,
    };

    const pdfBuffer = await renderSignedEnrollmentPdf({
      payload,
      signatureDataUrl: parsed.data.signatureDataUrl,
    });

    const uploaded = await uploadSignedArtifact(found.admin, {
      accountId: found.doc.account_id as string,
      documentId: found.doc.id as string,
      content: pdfBuffer,
      mimeType: "application/pdf",
    });

    const { error: updateError } = await found.admin
      .from("generated_documents")
      .update({
        signature_status: "signed",
        signed_at: new Date().toISOString(),
        signed_storage_key: uploaded.path,
        signed_mime_type: "application/pdf",
        signed_checksum_sha256: uploaded.checksum,
        signing_token_hash: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", found.doc.id);

    if (updateError) throw updateError;

    logDocumentEvent({
      level: "info",
      event: "document.signed",
      documentId: found.doc.id as string,
      documentType: "enrollment_liability_form",
      accountId: found.doc.account_id as string,
      payload: {
        signer: maskName(
          (found.doc.payload_json as EnrollmentLiabilityFormPayload).student.fullName,
        ),
      },
    });

    return { ok: true };
  } catch (e) {
    logDocumentEvent({
      level: "error",
      event: "document.sign.failed",
      documentId: found.doc.id as string,
      documentType: "enrollment_liability_form",
      payload: { message: (e as Error).message },
    });
    return { ok: false, error: mapDocumentActionError(e) };
  }
}

export { buildSigningPageUrl };
