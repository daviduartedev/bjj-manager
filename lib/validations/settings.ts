import { z } from "zod";

const optionalText = (max: number, msg: string) =>
  z
    .union([z.string().trim().max(max, msg), z.literal("")])
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v));

const cnpjDigits = /^[0-9]{14}$/;

export function digitsOnly(v: string): string {
  return v.replace(/\D+/g, "");
}

export function isValidCnpjBasic(v: string): boolean {
  const digits = digitsOnly(v);
  return cnpjDigits.test(digits) && !/^([0-9])\1{13}$/.test(digits);
}

export function maskCnpj(v: string): string {
  const d = digitsOnly(v).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export const updateAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Indique o nome da academia.")
      .max(200, "Nome demasiado longo."),
  })
  .strict();

/** Receiver data (CFG-6): aceita CNPJ mascarado ou só dígitos; servidor armazena 14 dígitos. */
export const updateReceiverSchema = z
  .object({
    legalName: optionalText(200, "Razão social demasiado longa."),
    cnpj: z
      .union([
        z
          .string()
          .trim()
          .transform((v) => digitsOnly(v))
          .refine((d) => d.length === 0 || cnpjDigits.test(d), {
            message: "CNPJ deve ter 14 dígitos.",
          })
          .refine((d) => d.length === 0 || !/^([0-9])\1{13}$/.test(d), {
            message: "CNPJ inválido.",
          }),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : v)),
  })
  .strict();

export type UpdateReceiverInput = z.infer<typeof updateReceiverSchema>;

/** Cliente: mantém máscara para edição, validador igual ao servidor. */
export const updateReceiverFormSchema = z
  .object({
    legalName: z.string().trim().max(200, "Razão social demasiado longa."),
    cnpj: z
      .string()
      .trim()
      .superRefine((v, ctx) => {
        const d = digitsOnly(v);
        if (d.length === 0) return;
        if (!cnpjDigits.test(d)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ deve ter 14 dígitos.",
          });
          return;
        }
        if (/^([0-9])\1{13}$/.test(d)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ inválido.",
          });
        }
      }),
  })
  .strict();

export type UpdateReceiverFormValues = z.infer<typeof updateReceiverFormSchema>;

export const updateProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Indique o seu nome.")
      .max(120, "Nome demasiado longo."),
    phone: z
      .union([z.string().trim().max(40, "Telefone demasiado longo."), z.literal("")])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : v)),
  })
  .strict();

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Cliente (sem transform em `phone`), mensagens iguais ao servidor; servidor usa `updateProfileSchema.strict()`. */
export const updateProfileFormSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Indique o seu nome.")
      .max(120, "Nome demasiado longo."),
    phone: z.string().trim().max(40, "Telefone demasiado longo."),
  })
  .strict();

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

/**
 * Só cliente — antes de construir o literal enviado a `updatePlan` (servidor valida `updatePlanSchema.strict()`).
 */
export const planRowFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Indique um nome para o plano.")
      .max(120, "Nome demasiado longo."),
    reaisStr: z.string().trim().min(1, "Indique o valor mensal em reais."),
  })
  .strict()
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
