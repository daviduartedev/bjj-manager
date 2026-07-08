import "server-only";

import { createHash } from "node:crypto";

import { renderHtmlToPdf } from "@/lib/documents/renderer";
import { resolveTemplate } from "@/lib/documents/template-resolver";
import type { DocumentPayload } from "@/lib/documents/types";
import {
  getDocumentsBucket,
  uploadDocumentArtifact,
} from "@/lib/documents/storage";
import type { SupabaseClient } from "@supabase/supabase-js";

export function buildSignedDocumentPath(args: {
  accountId: string;
  documentId: string;
  ext: "pdf" | "png" | "jpg" | "jpeg";
}): string {
  return `${args.accountId}/${args.documentId}/signed-v1.${args.ext}`;
}

export function sha256Buffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Gera PDF assinado re-renderizando o template com a imagem da assinatura.
 */
export async function renderSignedEnrollmentPdf(args: {
  payload: DocumentPayload;
  signatureDataUrl: string;
}): Promise<Buffer> {
  if (args.payload.type !== "enrollment_liability_form") {
    throw new Error("Tipo de documento inválido para assinatura.");
  }

  const enriched: DocumentPayload = {
    type: "enrollment_liability_form",
    data: {
      ...args.payload.data,
      signatureImageDataUrl: args.signatureDataUrl,
    },
  };

  const template = resolveTemplate("enrollment_liability_form");
  const html = template.builder(enriched);
  return renderHtmlToPdf(html);
}

export async function uploadSignedArtifact(
  client: SupabaseClient,
  args: {
    accountId: string;
    documentId: string;
    content: Buffer;
    mimeType: string;
  },
): Promise<{ path: string; checksum: string; size: number }> {
  const ext =
    args.mimeType === "application/pdf"
      ? "pdf"
      : args.mimeType === "image/png"
        ? "png"
        : "jpg";

  const path = buildSignedDocumentPath({
    accountId: args.accountId,
    documentId: args.documentId,
    ext,
  });

  await uploadDocumentArtifact(client, {
    path,
    content: args.content,
    contentType: args.mimeType,
  });

  return {
    path,
    checksum: sha256Buffer(args.content),
    size: args.content.byteLength,
  };
}

export async function downloadStorageObject(
  client: SupabaseClient,
  path: string,
): Promise<Buffer> {
  const bucket = getDocumentsBucket();
  const { data, error } = await client.storage.from(bucket).download(path);
  if (error || !data) {
    throw error ?? new Error("Ficheiro não encontrado.");
  }
  const ab = await data.arrayBuffer();
  return Buffer.from(ab);
}
