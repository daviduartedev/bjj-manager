import type { DocumentPayload } from "@/lib/documents/types";

import {
  escapeHtml,
  formatCnpjMask,
  formatDateBr,
  formatMoneyBrl,
  formatMonthYearBr,
} from "../../shared/format";
import { buildLayout } from "../../shared/layout";

export function renderPaymentReceiptV1(payload: DocumentPayload): string {
  if (payload.type !== "payment_receipt") {
    throw new Error("Template payment-receipt/v1 espera payload do tipo payment_receipt.");
  }
  const { documentNumber, issuedAt, receiver, payer, payment, reissue } = payload.data;

  const headerLine = receiver.legalName
    ? `${escapeHtml(receiver.legalName)}${
        receiver.cnpj ? ` · CNPJ ${escapeHtml(formatCnpjMask(receiver.cnpj))}` : ""
      }`
    : escapeHtml(receiver.academyName);

  const signatureBlock = `
    <div class="signature">
      <div class="signature-line">${escapeHtml(receiver.legalName ?? receiver.academyName)}</div>
    </div>
  `;

  const body = `
    <div class="header">
      <div class="brand">${headerLine}</div>
      <div class="doc-number">Recibo nº ${escapeHtml(documentNumber)}</div>
    </div>

    <h1 class="title">Recibo de Pagamento</h1>
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
      <p class="desc"><strong>Mês de referência:</strong> ${escapeHtml(formatMonthYearBr(payment.referenceMonth))}</p>
      <p class="desc"><strong>Pago em:</strong> ${escapeHtml(formatDateBr(payment.paidAt))}</p>
      ${payment.paymentMethod ? `<p class="desc"><strong>Forma de pagamento:</strong> ${escapeHtml(payment.paymentMethod)}</p>` : ""}
      ${payment.notes ? `<p class="desc"><strong>Observações:</strong> ${escapeHtml(payment.notes)}</p>` : ""}
    </div>

    ${signatureBlock}
  `;

  return buildLayout({
    title: `Recibo ${documentNumber}`,
    reissue,
    body,
  });
}
