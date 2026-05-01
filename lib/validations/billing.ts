import { z } from "zod";

export const updatePlanPriceSchema = z.object({
  planId: z.string().uuid("Identificador de plano inválido."),
  priceCents: z.coerce
    .number()
    .int("O preço deve ser um valor inteiro (centavos).")
    .min(0, "O preço não pode ser negativo."),
});

export type UpdatePlanPriceInput = z.infer<typeof updatePlanPriceSchema>;

export const updatePlanSchema = z
  .object({
    planId: z.string().uuid("Identificador de plano inválido."),
    name: z.string().trim().min(1, "Indique um nome.").max(120).optional(),
    priceCents: z.coerce
      .number()
      .int("O preço deve ser um valor inteiro (centavos).")
      .min(0, "O preço não pode ser negativo.")
      .optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.name !== undefined || d.priceCents !== undefined || d.active !== undefined,
    { message: "Nada para atualizar.", path: ["planId"] },
  );

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

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

export const recordPaymentSchema = z.object({
  studentId: z.string().uuid("Identificador de aluno inválido."),
  referenceMonth: z.string().min(1, "Indique o mês de referência."),
  /**
   * **`paid`**: mensalidade ao valor do plano (definido na conta; servidor ignora qualquer valor manual).
   * **`scholarship`**: isenção / bolsista (`amount_cents` = 0 no registo).
   */
  recordingKind: z.enum(["paid", "scholarship"]).default("paid"),
  paidAt: z.string().optional(),
  notes: z.string().max(4000).optional().nullable(),
  paymentMethod: z.string().max(200).optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const recordPaymentsBulkSchema = z.object({
  studentIds: z
    .array(z.string().uuid("Identificador de aluno inválido."))
    .min(1, "Seleccione pelo menos um aluno."),
  referenceMonth: z.string().min(1, "Indique o mês de referência."),
  paidAt: z.string().optional(),
  notes: z.string().max(4000).optional().nullable(),
  paymentMethod: z.string().max(200).optional().nullable(),
});

export type RecordPaymentsBulkInput = z.infer<typeof recordPaymentsBulkSchema>;

export const voidPaymentSchema = z.object({
  paymentId: z.string().uuid("Identificador de pagamento inválido."),
});

export type VoidPaymentInput = z.infer<typeof voidPaymentSchema>;
