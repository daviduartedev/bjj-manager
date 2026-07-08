import { renderCertificateV1 } from "./templates/certificate/v1";
import { renderEnrollmentLiabilityFormV1 } from "./templates/enrollment-liability-form/v1";
import { renderEnrollmentProofV1 } from "./templates/enrollment-proof/v1";
import { renderLiabilityTermV1 } from "./templates/liability-term/v1";
import { renderManualReceiptV1 } from "./templates/manual-receipt/v1";
import { renderPaymentReceiptV1 } from "./templates/payment-receipt/v1";
import type { DocumentPayload, DocumentType } from "./types";

export type TemplateBuilder = (payload: DocumentPayload) => string;

const REGISTRY: Record<DocumentType, { version: number; builder: TemplateBuilder }> = {
  payment_receipt: { version: 1, builder: renderPaymentReceiptV1 },
  enrollment_proof: { version: 1, builder: renderEnrollmentProofV1 },
  certificate: { version: 1, builder: renderCertificateV1 },
  liability_term: { version: 1, builder: renderLiabilityTermV1 },
  enrollment_liability_form: {
    version: 1,
    builder: renderEnrollmentLiabilityFormV1,
  },
  manual_receipt: { version: 1, builder: renderManualReceiptV1 },
};

export function resolveTemplate(type: DocumentType): {
  version: number;
  builder: TemplateBuilder;
} {
  const entry = REGISTRY[type];
  if (!entry) throw new Error(`Template não disponível para tipo ${type}.`);
  return entry;
}
