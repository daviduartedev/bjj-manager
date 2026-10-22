import { describe, expect, it } from "vitest";

import { renderCertificateV1 } from "./templates/certificate/v1";
import { renderEnrollmentLiabilityFormV1 } from "./templates/enrollment-liability-form/v1";
import { renderEnrollmentProofV1 } from "./templates/enrollment-proof/v1";
import type { DocumentPayload, ReceiverInfo } from "./types";

const receiver = (modality: ReceiverInfo["modality"]): ReceiverInfo => ({
  academyName: "Academia Horizonte",
  legalName: "Academia Horizonte LTDA",
  cnpj: null,
  signaturePath: null,
  logoPath: null,
  modality,
});

function enrollment(modality: ReceiverInfo["modality"], variant: "adult" | "minor" = "adult"): DocumentPayload {
  return {
    type: "enrollment_liability_form",
    data: {
      documentNumber: "ELF-2026-0007",
      issuedAt: "2026-10-22T15:00:00.000Z",
      reissue: { isReissue: false, version: 1, reason: null },
      receiver: receiver(modality),
      variant,
      signaturePlace: "São Paulo/SP",
      student: {
        fullName: "João Silva",
        rg: null,
        cpf: null,
        address: { street: "Rua A", number: "1", neighborhood: "Centro", city: "São Paulo", state: "SP", zip: "01000-000" },
        age: variant === "minor" ? 10 : 26,
        hasDisability: false,
        usesMedication: false,
        medicationDetails: null,
        lastPhysicalExamDate: null,
        medicalConditions: null,
      },
      guardian: variant === "minor" ? {
        fullName: "Maria Silva",
        rg: null,
        cpf: null,
        phone: null,
        municipality: "São Paulo",
        state: "SP",
        address: { street: "Rua A", number: "1", neighborhood: "Centro", city: "São Paulo", state: "SP", zip: "01000-000" },
      } : null,
    },
  };
}

describe("documentos por modalidade", () => {
  it("mantém o termo histórico de Jiu-Jitsu quando o payload não traz modalidade", () => {
    const html = renderEnrollmentLiabilityFormV1(enrollment(undefined));
    expect(html).toContain("Atleta de Jiu-Jitsu");
    expect(html).toContain("ASLAM");
  });

  it.each([
    ["boxing", "Boxe"],
    ["judo", "Judô"],
    ["muay_thai", "Muay Thai"],
  ] as const)("emite matrícula de %s com a academia e sem ASLAM ou certificação", (modality, label) => {
    const html = renderEnrollmentLiabilityFormV1(enrollment(modality));
    expect(html).toContain("Academia Horizonte LTDA");
    expect(html).toContain(label);
    expect(html).toContain("18 anos ou mais");
    expect(html).toContain("Não constitui homologação");
    expect(html).not.toContain("ASLAM");
    expect(html).not.toContain("Jiu-Jitsu");
    expect(() => renderEnrollmentLiabilityFormV1(enrollment(modality, "minor"))).toThrow(/menor/);
  });

  it("identifica a modalidade no comprovante e não exige faixa no certificado de Boxe", () => {
    const proof = renderEnrollmentProofV1({
      type: "enrollment_proof",
      data: {
        documentNumber: "MAT-2026-0001",
        issuedAt: "2026-10-22T15:00:00.000Z",
        reissue: { isReissue: false, version: 1, reason: null },
        receiver: receiver("boxing"),
        student: { fullName: "João Silva", document: null, enrolledSinceLabel: null, planLabel: "Adulto" },
      },
    });
    expect(proof).toContain("Modalidade:");
    expect(proof).toContain("Boxe");
    expect(proof).not.toContain("faixa");

    const certificate = renderCertificateV1({
      type: "certificate",
      data: {
        documentNumber: "CERT-2026-0001",
        issuedAt: "2026-10-22T15:00:00.000Z",
        reissue: { isReissue: false, version: 1, reason: null },
        receiver: receiver("boxing"),
        student: { fullName: "João Silva", document: null },
        certificate: { title: "Participação", description: "Frequência no ano." },
      },
    });
    expect(certificate).toContain("João Silva");
    expect(certificate).toContain("Boxe");
    expect(certificate).toContain("Não constitui homologação");
    expect(certificate).not.toContain("faixa");
  });
});
