import type { DocumentPayload } from "@/lib/documents/types";

import {
  escapeHtml,
  formatCnpjMask,
  formatDateBr,
  formatMoneyBrl,
} from "../../shared/format";
import { buildLayout } from "../../shared/layout";

export function renderManualReceiptV1(payload: DocumentPayload): string {
  if (payload.type !== "manual_receipt") {
    throw new Error("Template manual-receipt/v1 espera payload do tipo manual_receipt.");
  }
  const { documentNumber, issuedAt, receiver, payer, payment, reissue } = payload.data;

  const body = `
    <div class="header">
      <div class="brand">${escapeHtml(receiver.legalName ?? receiver.academyName)}${
        receiver.cnpj ? ` · CNPJ ${escapeHtml(formatCnpjMask(receiver.cnpj))}` : ""
      }</div>
      <div class="doc-number">Recibo nº ${escapeHtml(documentNumber)}</div>
    </div>

    <h1 class="title">Recibo</h1>
    <p class="subtitle">Emitido em ${escapeHtml(formatDateBr(issuedAt))}</p>

    <div class="section">
      <p class="label">Recebemos de</p>
      <p class="value">${escapeHtml(payer.fullName)}</p>
      ${payer.document ? `<p class="value">CPF/CNPJ: ${escapeHtml(payer.document)}</p>` : ""}
    </div>

    <div class="section">
      <p class="label">Valor</p>
      <p class="amount">${escapeHtml(formatMoneyBrl(payment.amountCents))}</p>
    </div>

    <div class="section">
      <p class="label">Referente a</p>
      <p class="desc">${escapeHtml(payment.description)}</p>
      <p class="desc"><strong>Pago em:</strong> ${escapeHtml(formatDateBr(payment.paidAt))}</p>
    </div>

    <div class="signature">
      <div class="signature-line">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
    </div>
  `;

  return buildLayout({
    title: `Recibo ${documentNumber}`,
    reissue,
    body,
  });
}
