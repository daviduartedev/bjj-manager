import { describe, expect, it } from "vitest";

import {
  canIssueSaleReceipt,
  classifyLedgerNote,
  ledgerBucket,
  receivedCents,
  remainingCents,
  saleReceiptDescription,
  splitInstallments,
} from "./ledger";

describe("splitInstallments", () => {
  it("puts the remainder on the last parcel", () => {
    expect(splitInstallments(35000, 3)).toEqual([11666, 11666, 11668]);
  });

  it("keeps a single parcel equal to the total", () => {
    expect(splitInstallments(9900, 1)).toEqual([9900]);
  });
});

describe("ledger remaining and bucket", () => {
  const parcels = [
    { amountCents: 11666, paidAt: "2026-09-01" },
    { amountCents: 11666, paidAt: null },
    { amountCents: 11668, paidAt: null },
  ];

  it("sums unpaid parcels as remaining", () => {
    expect(receivedCents(parcels)).toBe(11666);
    expect(remainingCents(parcels)).toBe(23334);
  });

  it("puts an open sale in a receber", () => {
    expect(ledgerBucket("sale", 23334)).toBe("a_receber");
  });

  it("puts an open outlay in a pagar", () => {
    expect(ledgerBucket("outlay", 5000)).toBe("a_pagar");
  });

  it("marks zero remaining as quitado", () => {
    expect(ledgerBucket("sale", 0)).toBe("quitado");
    expect(ledgerBucket("outlay", 0)).toBe("quitado");
  });
});

describe("classifyLedgerNote", () => {
  it("puts a freshly annotated sale in a receber", () => {
    expect(
      classifyLedgerNote("sale", 35000, [{ amountCents: 35000, paidAt: null }]),
    ).toMatchObject({ remainingCents: 35000, bucket: "a_receber" });
  });

  it("keeps a sale without loaded parcels in a receber", () => {
    expect(classifyLedgerNote("sale", 35000, [])).toMatchObject({
      remainingCents: 35000,
      bucket: "a_receber",
    });
  });

  it("puts an open outlay in a pagar", () => {
    expect(classifyLedgerNote("outlay", 8000, [])).toMatchObject({
      remainingCents: 8000,
      bucket: "a_pagar",
    });
  });

  it("moves a fully paid sale to quitado", () => {
    expect(
      classifyLedgerNote("sale", 35000, [{ amountCents: 35000, paidAt: "2026-09-27" }]),
    ).toMatchObject({ remainingCents: 0, bucket: "quitado" });
  });
});

describe("sale receipt eligibility", () => {
  it("allows a receipt only after a sale is settled", () => {
    expect(canIssueSaleReceipt("sale", 0)).toBe(true);
    expect(canIssueSaleReceipt("sale", 10)).toBe(false);
    expect(canIssueSaleReceipt("outlay", 0)).toBe(false);
  });

  it("names product, installments and method on the receipt line", () => {
    expect(
      saleReceiptDescription({
        productName: "Quimonos KMNO",
        sizeLabel: "A2",
        quantity: 1,
        installmentCount: 3,
        paymentMethodLabel: "PIX",
      }),
    ).toBe("Venda de Quimonos KMNO (A2), 1 peça, 3x no PIX.");
  });
});
