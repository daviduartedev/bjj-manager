import { z } from "zod";

const docId = z.string().uuid("Identificador de documento inválido.");
const accountScopedId = z.string().uuid("Identificador inválido.");

export const generateDocumentSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("payment_receipt"),
      paymentId: z.string().uuid("Identificador de pagamento inválido."),
    })
    .strict(),
  z
    .object({
      type: z.literal("enrollment_proof"),
      studentId: accountScopedId,
    })
    .strict(),
  z
    .object({
      type: z.literal("certificate"),
      studentId: accountScopedId,
      title: z.string().trim().min(1, "Indique o título.").max(160),
      description: z.string().trim().min(1, "Indique a descrição.").max(2000),
    })
    .strict(),
  z
    .object({
      type: z.literal("liability_term"),
      studentId: accountScopedId,
      bodyMarkdown: z.string().trim().min(1, "Indique o conteúdo.").max(10_000),
      guardianFullName: z.string().trim().max(160).optional().nullable(),
      guardianDocument: z.string().trim().max(40).optional().nullable(),
    })
    .strict(),
  z
    .object({
      type: z.literal("manual_receipt"),
      studentId: accountScopedId,
      amountCents: z.coerce.number().int().min(1, "Indique o valor."),
      description: z.string().trim().min(1, "Indique a descrição.").max(2000),
      paidAt: z.string().min(1, "Indique a data."),
      payerFullName: z.string().trim().max(160).optional().nullable(),
      payerDocument: z.string().trim().max(40).optional().nullable(),
    })
    .strict(),
]);

export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;

export const reissueDocumentSchema = z
  .object({
    documentId: docId,
    reason: z.string().trim().min(3, "Indique o motivo da reemissão.").max(500),
  })
  .strict();

export type ReissueDocumentInput = z.infer<typeof reissueDocumentSchema>;

export const documentIdSchema = z
  .object({ documentId: docId })
  .strict();

export type DocumentIdInput = z.infer<typeof documentIdSchema>;

export const listDocumentsSchema = z
  .object({
    studentId: accountScopedId.optional(),
    paymentId: accountScopedId.optional(),
    type: z
      .enum([
        "payment_receipt",
        "enrollment_proof",
        "enrollment_liability_form",
        "certificate",
        "liability_term",
        "manual_receipt",
      ])
      .optional(),
    status: z.enum(["pending", "ready", "failed", "archived"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
