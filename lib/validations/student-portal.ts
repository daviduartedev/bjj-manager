import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .email("Digite um e-mail válido.");

export const provisionPortalAccessSchema = z
  .object({
    studentId: z.string().uuid("Aluno inválido."),
    authEmail: emailSchema,
  })
  .strict();

export type ProvisionPortalAccessInput = z.infer<typeof provisionPortalAccessSchema>;

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
