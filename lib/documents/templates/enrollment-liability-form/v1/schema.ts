import { z } from "zod";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().trim().max(500).nullable().optional(),
);

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max);

export const addressSchema = z.object({
  street: requiredText(200, "Informe o endereço."),
  number: requiredText(20, "Informe o número."),
  neighborhood: requiredText(120, "Informe o bairro."),
  city: requiredText(120, "Informe a cidade."),
  state: requiredText(2, "Informe o estado (UF).").transform((s) => s.toUpperCase()),
  zip: requiredText(12, "Informe o CEP."),
});

export const guardianFormSchema = z.object({
  fullName: requiredText(160, "Informe o nome do responsável."),
  rg: optionalText,
  cpf: optionalText,
  phone: optionalText,
  municipality: optionalText,
  state: optionalText,
  address: addressSchema,
});

export const healthFormSchema = z.object({
  hasDisability: z.boolean().nullable().default(null),
  usesMedication: z.boolean().nullable().default(null),
  medicationDetails: optionalText,
  lastPhysicalExamDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de exame inválida.")
    .nullable()
    .optional(),
  medicalConditions: optionalText,
});

export const enrollmentLiabilityDraftSchema = z
  .object({
    studentId: z.string().uuid("Aluno inválido."),
    studentRg: optionalText,
    studentAddress: addressSchema,
    health: healthFormSchema,
    signaturePlace: requiredText(120, "Informe a cidade para a assinatura."),
    guardian: guardianFormSchema.nullable().optional(),
  })
  .strict();

export type EnrollmentLiabilityDraftInput = z.infer<
  typeof enrollmentLiabilityDraftSchema
>;

export type AddressFields = z.infer<typeof addressSchema>;
export type GuardianFormFields = z.infer<typeof guardianFormSchema>;
export type HealthFormFields = z.infer<typeof healthFormSchema>;
