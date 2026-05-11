import type { DocumentPayload } from "@/lib/documents/types";

import { escapeHtml, formatDateBr } from "../../shared/format";
import { buildLayout } from "../../shared/layout";

export function renderCertificateV1(payload: DocumentPayload): string {
  if (payload.type !== "certificate") {
    throw new Error("Template certificate/v1 espera payload do tipo certificate.");
  }
  const { documentNumber, issuedAt, receiver, student, certificate, reissue } = payload.data;

  const body = `
    <div class="header">
      <div class="brand">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
      <div class="doc-number">Certificado nº ${escapeHtml(documentNumber)}</div>
    </div>

    <h1 class="title" style="text-align:center;font-size:22pt;margin-top:32px">Certificado</h1>
    <p class="subtitle" style="text-align:center">${escapeHtml(certificate.title)}</p>

    <div class="section body-text" style="margin-top:32px;text-align:center;font-size:13pt;line-height:1.7">
      Conferimos a <strong>${escapeHtml(student.fullName)}</strong>${
        student.document ? `, portador(a) do documento ${escapeHtml(student.document)}` : ""
      }, este certificado em reconhecimento a:
    </div>

    <div class="section body-text" style="text-align:center;font-size:12pt;margin-top:24px">
      ${escapeHtml(certificate.description)}
    </div>

    <div class="section body-text" style="text-align:center;margin-top:36px">
      Emitido em ${escapeHtml(formatDateBr(issuedAt))}
    </div>

    <div class="signature">
      <div class="signature-line">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
    </div>
  `;

  return buildLayout({
    title: `Certificado ${documentNumber}`,
    reissue,
    body,
  });
}
