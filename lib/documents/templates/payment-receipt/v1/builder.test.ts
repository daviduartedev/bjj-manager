import { describe, expect, it } from "vitest";

import type { DocumentPayload } from "@/lib/documents/types";

import { renderPaymentReceiptV1 } from "./index";

function basePayload(): DocumentPayload {
  return {
    type: "payment_receipt",
    data: {
      documentNumber: "REC-2026-0001",
      issuedAt: "2026-05-10T12:00:00.000Z",
      reissue: { isReissue: false, version: 1, reason: null },
      receiver: {
        academyName: "Aslam BJJ",
        legalName: "Aslam BJJ Ltda",
        cnpj: "12345678000123",
        signaturePath: null,
      },
      payer: { fullName: "Aluno Teste", document: "12345678900" },
      payment: {
        amountCents: 12000,
        paidAt: "2026-05-10T12:00:00.000Z",
        referenceMonth: "2026-05-01",
        paymentMethod: "PIX",
        notes: null,
        description: "Mensalidade — plano Adulto",
      },
    },
  };
}

describe("renderPaymentReceiptV1", () => {
  it("inclui número, valor formatado e mês de referência", () => {
    const html = renderPaymentReceiptV1(basePayload());
    expect(html).toContain("REC-2026-0001");
    expect(html).toContain("120,00");
    expect(html).toContain("R$");
    expect(html).toContain("maio de 2026");
    expect(html).toContain("Mensalidade — plano Adulto");
  });

  it("não mostra banner de 2ª via na 1ª emissão", () => {
    const html = renderPaymentReceiptV1(basePayload());
    expect(html).not.toContain("2ª via");
  });

  it("mostra banner de 2ª via na reemissão (v2 com motivo)", () => {
    const payload = basePayload();
    if (payload.type === "payment_receipt") {
      payload.data.reissue = { isReissue: true, version: 2, reason: "Erro de digitação" };
    }
    const html = renderPaymentReceiptV1(payload);
    expect(html).toContain("2ª via");
    expect(html).toContain("Erro de digitação");
  });

  it("escapa HTML em campos do payer", () => {
    const payload = basePayload();
    if (payload.type === "payment_receipt") {
      payload.data.payer.fullName = "<script>alert('x')</script>";
    }
    const html = renderPaymentReceiptV1(payload);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("rejeita payload com tipo errado", () => {
    expect(() =>
      renderPaymentReceiptV1({
        type: "certificate",
        data: {} as never,
      } as DocumentPayload),
    ).toThrow();
  });
});
