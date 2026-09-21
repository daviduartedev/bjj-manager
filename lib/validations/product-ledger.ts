import { z } from "zod";

import { LEDGER_PAYMENT_METHODS } from "@/lib/products/ledger";

const moneyCents = z.coerce.number().int().min(1, "Indique o valor.").max(99_999_999);
const method = z.enum(LEDGER_PAYMENT_METHODS);

export const createLedgerNoteSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("sale"),
      studentId: z.string().uuid("Escolha o aluno."),
      productId: z.string().uuid("Escolha o produto."),
      productVariantId: z.string().uuid().optional().nullable(),
      quantity: z.coerce.number().int().min(1).max(99),
      totalCents: moneyCents,
      installmentCount: z.coerce.number().int().min(1).max(24),
      paymentMethod: method,
      note: z.string().trim().max(500).optional().nullable(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("outlay"),
      title: z.string().trim().min(1, "Descreva a saída.").max(160),
      totalCents: moneyCents,
      installmentCount: z.coerce.number().int().min(1).max(24),
      paymentMethod: method,
      note: z.string().trim().max(500).optional().nullable(),
    })
    .strict(),
]);

export const markLedgerInstallmentPaidSchema = z
  .object({
    installmentId: z.string().uuid(),
  })
  .strict();

export const issueLedgerReceiptSchema = z
  .object({
    noteId: z.string().uuid(),
  })
  .strict();

export type CreateLedgerNoteInput = z.infer<typeof createLedgerNoteSchema>;
