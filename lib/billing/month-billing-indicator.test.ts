import { describe, expect, it } from "vitest";

import { getEffectivePrice } from "./get-effective-price";
import { getMonthBillingIndicator } from "./month-billing-indicator";

const REF = "2025-03-01";

describe("getMonthBillingIndicator", () => {
  it("paid / scholarship / other vêm directamente do registo", () => {
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-31",
        dueDay: 5,
        paymentStatus: "paid",
      }),
    ).toBe("paid");
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-31",
        dueDay: 5,
        paymentStatus: "scholarship",
      }),
    ).toBe("scholarship");
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-31",
        dueDay: 5,
        paymentStatus: "other",
      }),
    ).toBe("other");
  });

  it("sem linha: pendente antes ou no vencimento; atrasado depois", () => {
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-04",
        dueDay: 5,
        paymentStatus: null,
      }),
    ).toBe("pending");
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-05",
        dueDay: 5,
        paymentStatus: null,
      }),
    ).toBe("pending");
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-06",
        dueDay: 5,
        paymentStatus: null,
      }),
    ).toBe("overdue");
  });

  it("pending ou unpaid na linha usam a mesma lógica temporal", () => {
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-06",
        dueDay: 5,
        paymentStatus: "pending",
      }),
    ).toBe("overdue");
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-06",
        dueDay: 5,
        paymentStatus: "unpaid",
      }),
    ).toBe("overdue");
  });

  it("sem due_day (sem vínculo): sempre pendente", () => {
    expect(
      getMonthBillingIndicator({
        referenceMonthFirstDay: REF,
        today: "2025-03-31",
        dueDay: null,
        paymentStatus: null,
      }),
    ).toBe("pending");
  });
});

describe("validação de valor = preço efetivo (contrato PBS-4.2)", () => {
  it("valor enviado deve igualar getEffectivePrice do vínculo", () => {
    const effective = getEffectivePrice({
      customPriceCents: 5000,
      planPriceCents: 12000,
    });
    expect(effective).toBe(5000);
    expect(4999 === effective).toBe(false);
    expect(5000 === effective).toBe(true);
  });
});
