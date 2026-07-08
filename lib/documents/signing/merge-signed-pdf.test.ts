import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { renderSignedEnrollmentPdf } from "./merge-signed-pdf";
import type { EnrollmentLiabilityFormPayload } from "@/lib/documents/types";

vi.mock("@/lib/documents/renderer", () => ({
  renderHtmlToPdf: vi.fn(async (html: string) => Buffer.from(html, "utf8")),
}));

const basePayload: EnrollmentLiabilityFormPayload = {
  variant: "adult",
  documentNumber: "ELF-2026-0001",
  issuedAt: "2026-07-08",
  reissue: { isReissue: false, version: 1, reason: null },
  receiver: {
    academyName: "Aslam",
    legalName: "Aslam BJJ LTDA",
    cnpj: null,
    signaturePath: null,
  },
  student: {
    fullName: "João Silva",
    rg: null,
    cpf: null,
    address: {
      street: "Rua A",
      number: "1",
      neighborhood: "Centro",
      city: "SP",
      state: "SP",
      zip: "01000-000",
    },
    age: 36,
    hasDisability: false,
    usesMedication: false,
    medicationDetails: null,
    lastPhysicalExamDate: null,
    medicalConditions: null,
  },
  guardian: null,
  signaturePlace: "São Paulo/SP",
};

describe("renderSignedEnrollmentPdf", () => {
  it("re-renderiza template com imagem de assinatura", async () => {
    const dataUrl = "data:image/png;base64,abc";
    const buf = await renderSignedEnrollmentPdf({
      payload: { type: "enrollment_liability_form", data: basePayload },
      signatureDataUrl: dataUrl,
    });
    const html = buf.toString("utf8");
    expect(html).toContain(dataUrl);
    expect(html).toContain("aslam-signature-img");
  });
});
