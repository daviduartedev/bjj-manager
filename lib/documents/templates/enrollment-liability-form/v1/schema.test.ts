import { describe, expect, it } from "vitest";

import { enrollmentLiabilityDraftSchema } from "./schema";

describe("enrollmentLiabilityDraftSchema", () => {
  const base = {
    studentId: "00000000-0000-4000-8000-000000000001",
    signaturePlace: "São Paulo",
    studentRg: "12.345.678-9",
    studentAddress: {
      street: "Rua A",
      number: "100",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zip: "01000-000",
    },
    health: {
      hasDisability: false,
      usesMedication: false,
      medicationDetails: null,
      lastPhysicalExamDate: "2026-01-15",
      medicalConditions: null,
    },
  };

  it("aceita rascunho adulto sem responsável", () => {
    const r = enrollmentLiabilityDraftSchema.safeParse({
      ...base,
      guardian: null,
    });
    expect(r.success).toBe(true);
  });

  it("aceita rascunho menor com responsável", () => {
    const r = enrollmentLiabilityDraftSchema.safeParse({
      ...base,
      guardian: {
        fullName: "Maria Silva",
        rg: "11.111.111-1",
        cpf: "12345678901",
        phone: "11999999999",
        municipality: "São Paulo",
        state: "SP",
        address: base.studentAddress,
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejeita endereço incompleto", () => {
    const r = enrollmentLiabilityDraftSchema.safeParse({
      ...base,
      studentAddress: { ...base.studentAddress, city: "" },
    });
    expect(r.success).toBe(false);
  });
});
