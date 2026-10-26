import type { DocumentPayload } from "@/lib/documents/types";
import { MODALITY_LABELS } from "@/lib/modalities/catalog";

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
  const logoDataUrl = payload.data.logoImageDataUrl ?? null;
  const modality = receiver.modality ?? "jiu_jitsu";
  if (modality !== "jiu_jitsu" && variant === "minor") {
    throw new Error("Esta modalidade não emite termo de menor.");
  }
  const sport = MODALITY_LABELS[modality];
  const clauses = modality === "jiu_jitsu"
    ? variant === "minor" ? ASLAM_MINOR_CLAUSES : ASLAM_ADULT_CLAUSES
    : `Declaro que pratico ${sport} na ${academyName} e que tenho 18 anos ou mais. Reconheço os riscos da atividade física, inclusive lesões, e isento ${academyName} de responsabilidade por danos decorrentes da prática, na medida permitida pela lei. Concordo com as mensalidades combinadas com a academia. Este termo registra a matrícula. Não constitui homologação, filiação ou certificação de confederação ou federação.`;
  const adultTitle = modality === "jiu_jitsu"
    ? undefined
    : `Matrícula e Termo de Responsabilidade de Atleta de ${sport}`;

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
          clauses,
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
          clauses,
          documentTitle: adultTitle,
          practiceLabel: modality === "jiu_jitsu" ? undefined : sport,
          signatureImageDataUrl: signatureImageDataUrl ?? null,
        });

  return buildLayout({
    title: `Matrícula e Termo ${documentNumber}`,
    reissue,
    body,
    footer: `Documento gerado eletronicamente · ${receiver.legalName ?? receiver.academyName} · ${new Date().getFullYear()}`,
  });
}
