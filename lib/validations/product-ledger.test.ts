import { describe, expect, it } from "vitest";

import { createLedgerNoteSchema } from "./product-ledger";

describe("createLedgerNoteSchema", () => {
  it("accepts a sale to a student", () => {
    const parsed = createLedgerNoteSchema.safeParse({
      kind: "sale",
      studentId: "11111111-1111-1111-1111-111111111111",
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalCents: 35000,
      installmentCount: 3,
      paymentMethod: "pix",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a sale without a student", () => {
    const parsed = createLedgerNoteSchema.safeParse({
      kind: "sale",
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalCents: 35000,
      installmentCount: 1,
      paymentMethod: "dinheiro",
    });
    expect(parsed.success).toBe(false);
  });
});
