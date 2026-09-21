import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { DocumentPayload, EnrollmentLiabilityFormPayload } from "@/lib/documents/types";

import { renderEnrollmentLiabilityFormV1 } from "./index";

const ADDRESS = {
  street: "Rua A",
  number: "1",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zip: "01000-000",
};

const ACADEMY_LOGO = "data:image/png;base64,ACADEMYLOGO";

function adultPayload(
  overrides: Partial<EnrollmentLiabilityFormPayload> = {},
): DocumentPayload {
  return {
    type: "enrollment_liability_form",
    data: {
      documentNumber: "ELF-2026-0001",
      issuedAt: "2026-07-08T12:00:00.000Z",
      reissue: { isReissue: false, version: 1, reason: null },
      receiver: {
        academyName: "Academia Horizonte",
        legalName: "Academia Horizonte LTDA",
        cnpj: "12345678000123",
        signaturePath: null,
        logoPath: null,
      },
      variant: "adult",
      signaturePlace: "São Paulo/SP",
      student: {
        fullName: "João Silva",
        rg: "12.345.678-9",
        cpf: "12345678900",
        address: ADDRESS,
        age: 28,
        hasDisability: false,
        usesMedication: false,
        medicationDetails: null,
        lastPhysicalExamDate: null,
        medicalConditions: null,
      },
      guardian: null,
      ...overrides,
    },
  };
}

function minorPayload(
  overrides: Partial<EnrollmentLiabilityFormPayload> = {},
): DocumentPayload {
  return adultPayload({
    variant: "minor",
    guardian: {
      fullName: "Maria Silva",
      rg: "11.111.111-1",
      cpf: "12345678901",
      phone: "11999999999",
      municipality: "São Paulo",
      state: "SP",
      address: ADDRESS,
    },
    student: {
      fullName: "Pedro Silva",
      rg: null,
      cpf: null,
      address: ADDRESS,
      age: 12,
      hasDisability: false,
      usesMedication: false,
      medicationDetails: null,
      lastPhysicalExamDate: null,
      medicalConditions: null,
    },
    ...overrides,
  });
}

describe("renderEnrollmentLiabilityFormV1 — logo da academia", () => {
  it("omite a imagem no termo adulto quando não há logo", () => {
    const html = renderEnrollmentLiabilityFormV1(adultPayload());

    expect(html).not.toContain('class="aslam-logo"');
    expect(html).not.toContain('alt="ASLAM"');
    expect(html).not.toContain("Logo.png");
  });

  it("omite a imagem no termo menor quando não há logo", () => {
    const html = renderEnrollmentLiabilityFormV1(minorPayload());

    expect(html).not.toContain('class="aslam-logo"');
    expect(html).not.toContain('alt="ASLAM"');
    expect(html).not.toContain("Logo.png");
  });

  it("embute a logo da academia no termo adulto com alt do nome", () => {
    const html = renderEnrollmentLiabilityFormV1(
      adultPayload({ logoImageDataUrl: ACADEMY_LOGO }),
    );

    expect(html).toContain(ACADEMY_LOGO);
    expect(html).toContain('class="aslam-logo"');
    expect(html).toContain('alt="Academia Horizonte LTDA"');
    expect(html).not.toContain('alt="ASLAM"');
    expect(html).not.toContain("Logo.png");
  });

  it("embute a logo da academia no termo menor com alt do nome", () => {
    const html = renderEnrollmentLiabilityFormV1(
      minorPayload({ logoImageDataUrl: ACADEMY_LOGO }),
    );

    expect(html).toContain(ACADEMY_LOGO);
    expect(html).toContain('class="aslam-logo"');
    expect(html).toContain('alt="Academia Horizonte LTDA"');
    expect(html).not.toContain('alt="ASLAM"');
    expect(html).not.toContain("Logo.png");
  });
});
