import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .email("Digite um e-mail válido.");

const studentIdSchema = z.string().uuid("Aluno inválido.");

/** Associar Auth existente (**STU-12.1**). */
export const provisionLinkExistingSchema = z
  .object({
    mode: z.literal("link_existing"),
    studentId: studentIdSchema,
    authEmail: emailSchema,
  })
  .strict();

/** Criar utilizador + convite por e-mail (**STU-12.5**, **AUTH-8.5**). */
export const provisionCreateInviteSchema = z
  .object({
    mode: z.literal("create_invite"),
    studentId: studentIdSchema,
    email: emailSchema,
  })
  .strict();

/** Criar utilizador + senha temporária (**STU-12.6**). */
export const provisionCreatePasswordSchema = z
  .object({
    mode: z.literal("create_password"),
    studentId: studentIdSchema,
    email: emailSchema,
  })
  .strict();

export const provisionPortalAccessSchema = z.discriminatedUnion("mode", [
  provisionLinkExistingSchema,
  provisionCreateInviteSchema,
  provisionCreatePasswordSchema,
]);

export type ProvisionPortalAccessInput = z.infer<typeof provisionPortalAccessSchema>;

/** @deprecated usar campos do discriminated union */
export type ProvisionLinkExistingInput = z.infer<typeof provisionLinkExistingSchema>;

export const completeStudentOnboardingSchema = z
  .object({
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Aceite o termo de uso para continuar." }),
    }),
    guardianEmail: z
      .string()
      .trim()
      .email("Digite um e-mail válido para o responsável.")
      .optional()
      .or(z.literal("")),
  })
  .strict();

export type CompleteStudentOnboardingInput = z.infer<typeof completeStudentOnboardingSchema>;

export const completeStudentOnboardingWithGuardianSchema = completeStudentOnboardingSchema.extend({
  guardianEmail: emailSchema,
});

export const checkInSchema = z
  .object({
    classSessionId: z.string().uuid("Sessão inválida."),
  })
  .strict();

export type CheckInInput = z.infer<typeof checkInSchema>;

export const cancelCheckInSchema = checkInSchema;

export type CancelCheckInInput = z.infer<typeof cancelCheckInSchema>;
