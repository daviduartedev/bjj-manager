export type LedgerKind = "sale" | "outlay";
export type LedgerBucket = "a_receber" | "a_pagar" | "quitado";

export const LEDGER_PAYMENT_METHODS = [
  "pix",
  "dinheiro",
  "cartao",
  "transferencia",
  "outro",
] as const;

export type LedgerPaymentMethod = (typeof LEDGER_PAYMENT_METHODS)[number];

export const LEDGER_PAYMENT_METHOD_LABELS: Record<LedgerPaymentMethod, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  transferencia: "Transferência",
  outro: "Outro",
};

export function splitInstallments(totalCents: number, count: number): number[] {
  if (!Number.isInteger(totalCents) || totalCents < 1) {
    throw new Error("Valor inválido.");
  }
  if (!Number.isInteger(count) || count < 1 || count > 24) {
    throw new Error("Número de parcelas inválido.");
  }
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? base + remainder : base,
  );
}

export function receivedCents(
  installments: ReadonlyArray<{ amountCents: number; paidAt: string | null }>,
): number {
  return installments.reduce(
    (sum, row) => (row.paidAt ? sum + row.amountCents : sum),
    0,
  );
}

export function remainingCents(
  installments: ReadonlyArray<{ amountCents: number; paidAt: string | null }>,
): number {
  return installments.reduce(
    (sum, row) => (row.paidAt ? sum : sum + row.amountCents),
    0,
  );
}

export function ledgerBucket(kind: LedgerKind, remaining: number): LedgerBucket {
  if (remaining <= 0) return "quitado";
  return kind === "sale" ? "a_receber" : "a_pagar";
}

/**
 * Sem parcelas carregadas, o saldo em aberto é o total.
 * Tratar isso como quitado escondia a venda de A receber e de A pagar.
 */
export function classifyLedgerNote(
  kind: LedgerKind,
  totalCents: number,
  installments: ReadonlyArray<{ amountCents: number; paidAt: string | null }>,
): { receivedCents: number; remainingCents: number; bucket: LedgerBucket } {
  const received = receivedCents(installments);
  const remaining =
    installments.length === 0 ? Math.max(totalCents, 0) : remainingCents(installments);
  return {
    receivedCents: received,
    remainingCents: remaining,
    bucket: ledgerBucket(kind, remaining),
  };
}

export function canIssueSaleReceipt(kind: LedgerKind, remaining: number): boolean {
  return kind === "sale" && remaining <= 0;
}

export function saleReceiptDescription(args: {
  productName: string;
  sizeLabel: string | null;
  quantity: number;
  installmentCount: number;
  paymentMethodLabel: string;
}): string {
  const size = args.sizeLabel ? ` (${args.sizeLabel})` : "";
  const peca = args.quantity === 1 ? "peça" : "peças";
  return `Venda de ${args.productName}${size}, ${args.quantity} ${peca}, ${args.installmentCount}x no ${args.paymentMethodLabel}.`;
}

export function ledgerNoteIdempotencyKey(noteId: string): string {
  return `product-ledger:${noteId}`;
}
