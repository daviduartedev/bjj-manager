import { z } from "zod";

export const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Indique o nome da academia.")
    .max(200, "Nome demasiado longo."),
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Indique o seu nome.")
    .max(120, "Nome demasiado longo."),
  phone: z
    .union([z.string().trim().max(40, "Telefone demasiado longo."), z.literal("")])
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v)),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Cliente (sem transform em `phone`), mensagens iguais ao servidor. */
export const updateProfileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Indique o seu nome.")
    .max(120, "Nome demasiado longo."),
  phone: z.string().trim().max(40, "Telefone demasiado longo."),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

/** Validação por plano na página de configurações (valor em reais como texto). */
export const planRowFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Indique um nome para o plano.")
      .max(120, "Nome demasiado longo."),
    reaisStr: z.string().trim().min(1, "Indique o valor mensal em reais."),
  })
  .superRefine((data, ctx) => {
    const normalized = data.reaisStr.trim().replace(/\s/g, "").replace(",", ".");
    const n = Number(normalized);
    if (Number.isNaN(n) || n < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use um número válido (ex.: 100 ou 120,50).",
        path: ["reaisStr"],
      });
    }
  });

export type PlanRowFormValues = z.infer<typeof planRowFormSchema>;

export function parsePlanRowReaisToCents(reaisStr: string): number {
  const normalized = reaisStr.trim().replace(/\s/g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}
