import { z } from "zod";

export const updatePlanPriceSchema = z.object({
  planId: z.string().uuid("Identificador de plano inválido."),
  priceCents: z.coerce
    .number()
    .int("O preço deve ser um valor inteiro (centavos).")
    .min(0, "O preço não pode ser negativo."),
});

export type UpdatePlanPriceInput = z.infer<typeof updatePlanPriceSchema>;

const optionalCustom = z.union([
  z.number().int().min(0, "O valor personalizado não pode ser negativo."),
  z.null(),
]);

export const setStudentPlanSchema = z.object({
  studentId: z.string().uuid("Identificador de aluno inválido."),
  planId: z.string().uuid("Identificador de plano inválido."),
  dueDay: z.coerce
    .number()
    .int()
    .min(1, "O dia de vencimento deve estar entre 1 e 28.")
    .max(28, "O dia de vencimento deve estar entre 1 e 28."),
  /** `undefined` omitido no payload JSON mantém-se como ausência → preservar no servidor. */
  customPriceCents: optionalCustom.optional(),
});

export type SetStudentPlanInput = z.infer<typeof setStudentPlanSchema>;
