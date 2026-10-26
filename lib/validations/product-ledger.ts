import { z } from "zod";

import { LEDGER_PAYMENT_METHODS } from "@/lib/products/ledger";

const moneyCents = z.coerce.number().int().min(1, "Indique o valor.").max(99_999_999);
const method = z.enum(LEDGER_PAYMENT_METHODS);
const reminder = z.string().trim().max(500).optional().nullable();

const saleFields = {
  kind: z.literal("sale"),
  studentId: z.string().uuid("Escolha o aluno."),
  productId: z.string().uuid("Escolha o produto."),
  productVariantId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(99),
  totalCents: moneyCents,
  installmentCount: z.coerce.number().int().min(1).max(24),
  paymentMethod: method,
  note: reminder,
};

const outlayFields = {
  kind: z.literal("outlay"),
  title: z.string().trim().min(1, "Descreva a saída.").max(160),
  totalCents: moneyCents,
  installmentCount: z.coerce.number().int().min(1).max(24),
  paymentMethod: method,
  note: reminder,
};

export const createLedgerNoteSchema = z.discriminatedUnion("kind", [
  z.object(saleFields).strict(),
  z.object(outlayFields).strict(),
]);

export const updateLedgerNoteSchema = z.discriminatedUnion("kind", [
  z.object({ noteId: z.string().uuid(), ...saleFields }).strict(),
  z.object({ noteId: z.string().uuid(), ...outlayFields }).strict(),
]);

export const deleteLedgerNoteSchema = z
  .object({
    noteId: z.string().uuid(),
  })
  .strict();

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
export type UpdateLedgerNoteInput = z.infer<typeof updateLedgerNoteSchema>;
