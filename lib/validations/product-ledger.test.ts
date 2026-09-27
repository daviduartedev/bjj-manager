import { describe, expect, it } from "vitest";

import { createLedgerNoteSchema, deleteLedgerNoteSchema, updateLedgerNoteSchema } from "./product-ledger";

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

  it("accepts an edit of an existing sale", () => {
    const parsed = updateLedgerNoteSchema.safeParse({
      noteId: "33333333-3333-3333-3333-333333333333",
      kind: "sale",
      studentId: "11111111-1111-1111-1111-111111111111",
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      totalCents: 35000,
      installmentCount: 1,
      paymentMethod: "pix",
      note: "Teste",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a delete by note id", () => {
    expect(
      deleteLedgerNoteSchema.safeParse({
        noteId: "33333333-3333-3333-3333-333333333333",
      }).success,
    ).toBe(true);
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
