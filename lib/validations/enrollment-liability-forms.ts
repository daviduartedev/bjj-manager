import { z } from "zod";

import { enrollmentLiabilityDraftSchema } from "@/lib/documents/templates/enrollment-liability-form/v1/schema";

export const createEnrollmentLiabilityDraftSchema = enrollmentLiabilityDraftSchema;

export const updateEnrollmentLiabilityDraftSchema = z
  .object({
    documentId: z.string().uuid("Documento inválido."),
    draft: enrollmentLiabilityDraftSchema,
  })
  .strict();

export const enrollmentLiabilityDocumentIdSchema = z
  .object({
    documentId: z.string().uuid("Documento inválido."),
  })
  .strict();

export const listEnrollmentLiabilityFormsSchema = z
  .object({
    studentId: z.string().uuid().optional(),
    signatureStatus: z.enum(["awaiting_signature", "signed"]).optional(),
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Mês inválido.")
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type CreateEnrollmentLiabilityDraftInput = z.infer<
  typeof createEnrollmentLiabilityDraftSchema
>;
