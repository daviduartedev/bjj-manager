import type { DocumentPayload } from "@/lib/documents/types";

import { escapeHtml, formatDateBr } from "../../shared/format";
import { buildLayout } from "../../shared/layout";

export function renderLiabilityTermV1(payload: DocumentPayload): string {
  if (payload.type !== "liability_term") {
    throw new Error("Template liability-term/v1 espera payload do tipo liability_term.");
  }
  const { documentNumber, issuedAt, receiver, student, guardian, bodyMarkdown, reissue } =
    payload.data;

  const guardianBlock = guardian
    ? `
        <div class="section">
          <p class="label">Responsável legal</p>
          <p class="value">${escapeHtml(guardian.fullName)}${
            guardian.document ? ` · ${escapeHtml(guardian.document)}` : ""
          }</p>
        </div>
      `
    : "";

  const body = `
    <div class="header">
      <div class="brand">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
      <div class="doc-number">Termo nº ${escapeHtml(documentNumber)}</div>
    </div>

    <h1 class="title">Termo de Responsabilidade</h1>
    <p class="subtitle">Emitido em ${escapeHtml(formatDateBr(issuedAt))}</p>

    <div class="section">
      <p class="label">Aluno(a)</p>
      <p class="value">${escapeHtml(student.fullName)}${
        student.document ? ` · ${escapeHtml(student.document)}` : ""
      }${student.isMinor ? " · Menor de idade" : ""}</p>
    </div>

    ${guardianBlock}

    <div class="section body-text">${escapeHtml(bodyMarkdown)}</div>

    <div class="signature">
      <div class="signature-line">${escapeHtml(
        guardian?.fullName ?? student.fullName,
      )}</div>
    </div>
  `;

  return buildLayout({
    title: `Termo de Responsabilidade ${documentNumber}`,
    reissue,
    body,
  });
}
