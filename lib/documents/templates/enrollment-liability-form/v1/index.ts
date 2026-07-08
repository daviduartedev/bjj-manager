import type { DocumentPayload } from "@/lib/documents/types";

import { getAslamLogoDataUrl } from "../../shared/brand-assets";
import { buildLayout } from "../../shared/layout";
import { ASLAM_ADULT_CLAUSES, ASLAM_MINOR_CLAUSES } from "./clauses";
import { renderAdultTemplate, renderMinorTemplate } from "./render";

export function renderEnrollmentLiabilityFormV1(payload: DocumentPayload): string {
  if (payload.type !== "enrollment_liability_form") {
    throw new Error(
      "Template enrollment-liability-form/v1 espera payload do tipo enrollment_liability_form.",
    );
  }

  const {
    documentNumber,
    issuedAt,
    receiver,
    variant,
    student,
    guardian,
    signaturePlace,
    signatureImageDataUrl,
    reissue,
  } = payload.data;

  const academyName = receiver.legalName ?? receiver.academyName;
  const logoDataUrl = getAslamLogoDataUrl();

  const body =
    variant === "minor"
      ? renderMinorTemplate({
          receiver,
          logoDataUrl,
          academyName,
          documentNumber,
          issuedAt,
          guardian: guardian!,
          student: {
            fullName: student.fullName,
            age: student.age,
            hasDisability: student.hasDisability,
            usesMedication: student.usesMedication,
            medicationDetails: student.medicationDetails,
            lastPhysicalExamDate: student.lastPhysicalExamDate,
            medicalConditions: student.medicalConditions,
          },
          signaturePlace,
          clauses: ASLAM_MINOR_CLAUSES,
          signatureImageDataUrl: signatureImageDataUrl ?? null,
        })
      : renderAdultTemplate({
          receiver,
          logoDataUrl,
          academyName,
          documentNumber,
          issuedAt,
          student: {
            fullName: student.fullName,
            rg: student.rg,
            cpf: student.cpf,
            address: student.address,
            age: student.age,
            hasDisability: student.hasDisability,
            usesMedication: student.usesMedication,
            medicationDetails: student.medicationDetails,
            lastPhysicalExamDate: student.lastPhysicalExamDate,
            medicalConditions: student.medicalConditions,
          },
          signaturePlace,
          clauses: ASLAM_ADULT_CLAUSES,
          signatureImageDataUrl: signatureImageDataUrl ?? null,
        });

  return buildLayout({
    title: `Matrícula e Termo ${documentNumber}`,
    reissue,
    body,
    footer: `Documento gerado eletronicamente · ${receiver.legalName ?? receiver.academyName} · ${new Date().getFullYear()}`,
  });
}
