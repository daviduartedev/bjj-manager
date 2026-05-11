import type { DocumentPayload } from "@/lib/documents/types";

import {
  escapeHtml,
  formatCnpjMask,
  formatDateBr,
} from "../../shared/format";
import { buildLayout } from "../../shared/layout";

export function renderEnrollmentProofV1(payload: DocumentPayload): string {
  if (payload.type !== "enrollment_proof") {
    throw new Error("Template enrollment-proof/v1 espera payload do tipo enrollment_proof.");
  }
  const { documentNumber, issuedAt, receiver, student, reissue } = payload.data;

  const body = `
    <div class="header">
      <div class="brand">${escapeHtml(receiver.legalName ?? receiver.academyName)}${
        receiver.cnpj ? ` · CNPJ ${escapeHtml(formatCnpjMask(receiver.cnpj))}` : ""
      }</div>
      <div class="doc-number">Comprovante nº ${escapeHtml(documentNumber)}</div>
    </div>

    <h1 class="title">Comprovante de Matrícula</h1>
    <p class="subtitle">Emitido em ${escapeHtml(formatDateBr(issuedAt))}</p>

    <div class="section body-text">
      Declaramos para os devidos fins que o(a) aluno(a) <strong>${escapeHtml(student.fullName)}</strong>${
        student.document ? `, portador(a) do documento ${escapeHtml(student.document)}` : ""
      } encontra-se regularmente matriculado(a) no plano <strong>${escapeHtml(student.planLabel)}</strong>${
        student.enrolledSinceLabel
          ? `, com início em ${escapeHtml(student.enrolledSinceLabel)}`
          : ""
      }.
    </div>

    <div class="section body-text">
      Por ser expressão da verdade, firmamos o presente comprovante.
    </div>

    <div class="signature">
      <div class="signature-line">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
    </div>
  `;

  return buildLayout({
    title: `Comprovante de Matrícula ${documentNumber}`,
    reissue,
    body,
  });
}
