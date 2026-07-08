import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logDocumentEvent } from "./audit";
import {
  reserveNextDocumentNumber,
  reserveNextDocumentNumberFallback,
} from "./numbering";
import { sanitizePdfRenderFailureForUser } from "@/lib/documents/render-user-message";

import { renderHtmlToPdf } from "./renderer";
import {
  buildDocumentPath,
  uploadDocumentArtifact,
} from "./storage";
import { resolveTemplate } from "./template-resolver";
import type { DocumentPayload, DocumentType } from "./types";

export type GenerateInput = {
  accountId: string;
  type: DocumentType;
  payload: DocumentPayload;
  /**
   * Idempotência: chave única dentro da conta. Para recibos automáticos
   * usamos `payment_id`. Reemissões NÃO devem usar a mesma chave.
   */
  idempotencyKey?: string | null;
  studentId?: string | null;
  paymentId?: string | null;
  templateId?: string | null;
  reissue?: {
    supersedesId: string;
    reason: string;
  };
  createdByUserId?: string | null;
  /** Rascunho já persistido (matrícula/termo) — gera PDF na mesma linha. */
  existingDocumentId?: string | null;
};

export type GenerateResult =
  | {
      ok: true;
      documentId: string;
      number: string;
      status: "ready";
      pdfPath: string;
      htmlPath: string | null;
      reused: boolean;
    }
  | {
      ok: false;
      documentId: string | null;
      status: "failed";
      errorCode: string;
      errorMessage: string;
    };

export class DocumentGenerationService {
  constructor(private readonly client: SupabaseClient) {}

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const startedAt = Date.now();

    let existingRow:
      | {
          id: string;
          status: string;
          number: string | null;
          pdf_path: string | null;
          html_path: string | null;
          version: number | null;
        }
      | null = null;

    if (input.existingDocumentId) {
      const draft = await this.client
        .from("generated_documents")
        .select("id, status, number, pdf_path, html_path, version")
        .eq("id", input.existingDocumentId)
        .eq("account_id", input.accountId)
        .maybeSingle();

      if (draft.error) throw draft.error;
      if (!draft.data) {
        return {
          ok: false,
          documentId: null,
          status: "failed",
          errorCode: "DRAFT_NOT_FOUND",
          errorMessage: "Rascunho não encontrado.",
        };
      }
      if (draft.data.pdf_path) {
        return {
          ok: false,
          documentId: draft.data.id as string,
          status: "failed",
          errorCode: "DRAFT_ALREADY_GENERATED",
          errorMessage: "Este documento já foi gerado.",
        };
      }
      existingRow = {
        id: draft.data.id as string,
        status: (draft.data.status as string) ?? "",
        number: (draft.data.number as string | null) ?? null,
        pdf_path: (draft.data.pdf_path as string | null) ?? null,
        html_path: (draft.data.html_path as string | null) ?? null,
        version: (draft.data.version as number | null) ?? null,
      };
    } else if (input.idempotencyKey) {
      const existing = await this.client
        .from("generated_documents")
        .select("id, status, number, pdf_path, html_path, version")
        .eq("account_id", input.accountId)
        .eq("idempotency_key", input.idempotencyKey)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing.data) {
        existingRow = {
          id: existing.data.id as string,
          status: (existing.data.status as string) ?? "",
          number: (existing.data.number as string | null) ?? null,
          pdf_path: (existing.data.pdf_path as string | null) ?? null,
          html_path: (existing.data.html_path as string | null) ?? null,
          version: (existing.data.version as number | null) ?? null,
        };
      }

      if (
        existingRow &&
        existingRow.status === "ready" &&
        existingRow.pdf_path
      ) {
        return {
          ok: true,
          documentId: existingRow.id,
          number: existingRow.number ?? "",
          status: "ready",
          pdfPath: existingRow.pdf_path,
          htmlPath: existingRow.html_path,
          reused: true,
        };
      }
    }

    const issuedAt = new Date();
    const year = issuedAt.getUTCFullYear();

    let number: string;
    let documentId: string;
    let versionForRow: number;

    if (existingRow) {
      if (existingRow.number) {
        number = existingRow.number;
      } else {
        const reserved = await this.reserveNumberOrFail(input, year);
        if (!reserved.ok) return reserved.result;
        number = reserved.number;
      }
      documentId = existingRow.id;
      versionForRow = existingRow.version ?? 1;
    } else {
      const reserved = await this.reserveNumberOrFail(input, year);
      if (!reserved.ok) return reserved.result;
      number = reserved.number;

      const supersedesVersion = input.reissue
        ? await this.fetchSupersedesVersion(input.reissue.supersedesId)
        : 0;
      versionForRow = input.reissue ? supersedesVersion + 1 : 1;
      documentId = "";
    }

    const reissueMeta = {
      isReissue: Boolean(input.reissue),
      version: versionForRow,
      reason: input.reissue?.reason ?? null,
    } as const;

    const enriched: DocumentPayload = {
      ...input.payload,
      data: {
        ...input.payload.data,
        documentNumber: number,
        issuedAt: issuedAt.toISOString(),
        reissue: reissueMeta,
      },
    } as DocumentPayload;

    if (existingRow) {
      const reset = await this.client
        .from("generated_documents")
        .update({
          status: "pending",
          number,
          version: versionForRow,
          payload_json: enriched.data,
          error_code: null,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (reset.error) {
        logDocumentEvent({
          level: "error",
          event: "doc.retry.reset_failed",
          accountId: input.accountId,
          documentId,
          documentType: input.type,
          payload: { message: reset.error.message, code: reset.error.code },
        });
        return {
          ok: false,
          documentId,
          status: "failed",
          errorCode: "INSERT_FAILED",
          errorMessage:
            "Não foi possível reabrir o documento para nova tentativa.",
        };
      }
    } else {
      const insert = await this.client
        .from("generated_documents")
        .insert({
          account_id: input.accountId,
          type: input.type,
          status: "pending",
          number,
          version: versionForRow,
          supersedes_id: input.reissue?.supersedesId ?? null,
          idempotency_key: input.idempotencyKey ?? null,
          student_id: input.studentId ?? null,
          payment_id: input.paymentId ?? null,
          template_id: input.templateId ?? null,
          payload_json: enriched.data,
          reissue_reason: input.reissue?.reason ?? null,
          created_by: input.createdByUserId ?? null,
        })
        .select("id")
        .single();

      if (insert.error) {
        logDocumentEvent({
          level: "error",
          event: "doc.insert.failed",
          accountId: input.accountId,
          documentType: input.type,
          payload: { message: insert.error.message, code: insert.error.code },
        });
        return {
          ok: false,
          documentId: null,
          status: "failed",
          errorCode: "INSERT_FAILED",
          errorMessage:
            (insert.error.message ?? "").includes("idempotency_key")
              ? "Já existe um documento gerado para esta operação."
              : "Não foi possível registar o documento.",
        };
      }

      documentId = insert.data.id as string;
    }

    try {
      const template = resolveTemplate(input.type);
      const html = template.builder(enriched);
      const pdf = await renderHtmlToPdf(html);

      const pdfPath = buildDocumentPath({
        accountId: input.accountId,
        documentId,
        ext: "pdf",
      });

      await uploadDocumentArtifact(this.client, {
        path: pdfPath,
        content: pdf,
        contentType: "application/pdf",
      });

      await this.client
        .from("generated_documents")
        .update({
          status: "ready",
          pdf_path: pdfPath,
          byte_size: pdf.byteLength,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (input.reissue) {
        await this.client
          .from("generated_documents")
          .update({ status: "archived", updated_at: new Date().toISOString() })
          .eq("id", input.reissue.supersedesId);
      }

      logDocumentEvent({
        level: "info",
        event: "doc.generate.ready",
        accountId: input.accountId,
        documentId,
        documentType: input.type,
        payload: {
          elapsedMs: Date.now() - startedAt,
          version: versionForRow,
          retried: Boolean(existingRow),
        },
      });

      return {
        ok: true,
        documentId,
        number,
        status: "ready",
        pdfPath,
        htmlPath: null,
        reused: false,
      };
    } catch (err) {
      const raw = (err as Error).message ?? "Falha ao gerar PDF.";
      const lower = raw.toLowerCase();
      const code =
        lower.includes("playwright") ||
        lower.includes("chromium") ||
        lower.includes("puppeteer")
          ? "RENDER_FAILED"
          : "STORAGE_FAILED";

      const userMessage = sanitizePdfRenderFailureForUser(raw);

      await this.client
        .from("generated_documents")
        .update({
          status: "failed",
          error_code: code,
          error_message: userMessage.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      logDocumentEvent({
        level: "error",
        event: "doc.generate.failed",
        accountId: input.accountId,
        documentId,
        documentType: input.type,
        payload: { code, message: raw },
      });

      return {
        ok: false,
        documentId,
        status: "failed",
        errorCode: code,
        errorMessage: userMessage,
      };
    }
  }

  private async reserveNumberOrFail(
    input: GenerateInput,
    year: number,
  ): Promise<
    | { ok: true; number: string }
    | { ok: false; result: GenerateResult }
  > {
    try {
      try {
        const reserved = await reserveNextDocumentNumber(this.client, {
          accountId: input.accountId,
          type: input.type,
          year,
        });
        return { ok: true, number: reserved.number };
      } catch {
        const fallback = await reserveNextDocumentNumberFallback(this.client, {
          accountId: input.accountId,
          type: input.type,
          year,
        });
        return { ok: true, number: fallback.number };
      }
    } catch (err) {
      logDocumentEvent({
        level: "error",
        event: "doc.numbering.failed",
        accountId: input.accountId,
        documentType: input.type,
        payload: { message: (err as Error).message },
      });
      return {
        ok: false,
        result: {
          ok: false,
          documentId: null,
          status: "failed",
          errorCode: "NUMBERING_FAILED",
          errorMessage:
            "Não foi possível reservar a numeração do documento.",
        },
      };
    }
  }

  private async fetchSupersedesVersion(id: string): Promise<number> {
    const { data } = await this.client
      .from("generated_documents")
      .select("version")
      .eq("id", id)
      .maybeSingle();
    return Number((data?.version as number | undefined) ?? 1);
  }
}
