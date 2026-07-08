/**
 * Tipos partilhados do motor documental (DOC- / REC-).
 */

export type DocumentType =
  | "payment_receipt"
  | "enrollment_proof"
  | "certificate"
  | "liability_term"
  | "enrollment_liability_form"
  | "manual_receipt";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  payment_receipt: "Recibo de pagamento",
  enrollment_proof: "Comprovante de matrícula",
  certificate: "Certificado",
  liability_term: "Termo de responsabilidade",
  enrollment_liability_form: "Matrícula e Termo ASLAM",
  manual_receipt: "Recibo manual",
};

/** Prefixo de numeração (NUM-{YYYY}-{seq4}). */
export const DOCUMENT_TYPE_NUMBER_PREFIX: Record<DocumentType, string> = {
  payment_receipt: "REC",
  enrollment_proof: "MAT",
  certificate: "CERT",
  liability_term: "TR",
  enrollment_liability_form: "ELF",
  manual_receipt: "MREC",
};

export type DocumentStatus = "pending" | "ready" | "failed" | "archived";

export type DocumentSignatureStatus = "awaiting_signature" | "signed";

export type DeliveryChannel = "download" | "whatsapp" | "browser_open" | "reissue";
export type DeliveryStatus = "requested" | "completed" | "failed";

export type ReceiverInfo = {
  legalName: string | null;
  cnpj: string | null;
  signaturePath: string | null;
  academyName: string;
};

/**
 * Dados que vão para o template e ficam guardados em `payload_json`. Uso PII mínimo
 * (`lib/documents/audit.ts` mascara antes de qualquer log).
 */
export type PaymentReceiptPayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  payer: {
    fullName: string;
    document: string | null;
  };
  payment: {
    amountCents: number;
    paidAt: string;
    referenceMonth: string;
    paymentMethod: string | null;
    notes: string | null;
    description: string;
  };
};

export type EnrollmentProofPayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  student: {
    fullName: string;
    document: string | null;
    enrolledSinceLabel: string | null;
    planLabel: string;
  };
};

export type CertificatePayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  student: { fullName: string; document: string | null };
  certificate: { title: string; description: string };
};

export type LiabilityTermPayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  student: { fullName: string; document: string | null; isMinor: boolean };
  guardian: { fullName: string; document: string | null } | null;
  bodyMarkdown: string;
};

export type EnrollmentLiabilityAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
};

export type EnrollmentLiabilityGuardian = {
  fullName: string;
  rg: string | null;
  cpf: string | null;
  phone: string | null;
  municipality: string | null;
  state: string | null;
  address: EnrollmentLiabilityAddress;
};

export type EnrollmentLiabilityFormPayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  variant: "adult" | "minor";
  signaturePlace: string;
  student: {
    fullName: string;
    rg: string | null;
    cpf: string | null;
    address: EnrollmentLiabilityAddress;
    age: number | null;
    hasDisability: boolean | null;
    usesMedication: boolean | null;
    medicationDetails: string | null;
    lastPhysicalExamDate: string | null;
    medicalConditions: string | null;
  };
  guardian: EnrollmentLiabilityGuardian | null;
  signatureImageDataUrl?: string | null;
};

export type ManualReceiptPayload = {
  documentNumber: string;
  issuedAt: string;
  reissue: { isReissue: boolean; version: number; reason: string | null };
  receiver: ReceiverInfo;
  payer: { fullName: string; document: string | null };
  payment: {
    amountCents: number;
    paidAt: string;
    description: string;
  };
};

export type DocumentPayload =
  | { type: "payment_receipt"; data: PaymentReceiptPayload }
  | { type: "enrollment_proof"; data: EnrollmentProofPayload }
  | { type: "certificate"; data: CertificatePayload }
  | { type: "liability_term"; data: LiabilityTermPayload }
  | { type: "enrollment_liability_form"; data: EnrollmentLiabilityFormPayload }
  | { type: "manual_receipt"; data: ManualReceiptPayload };
