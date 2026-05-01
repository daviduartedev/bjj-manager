export const BILLING_ERROR_CODES = [
  "PLAN_NOT_AVAILABLE",
  "PLAN_INACTIVE",
  "PLAN_KIND_MISMATCH",
  "STUDENT_NOT_AVAILABLE",
] as const;

export type BillingErrorCode = (typeof BILLING_ERROR_CODES)[number];

export class BillingDomainError extends Error {
  readonly code: BillingErrorCode;

  constructor(code: BillingErrorCode) {
    super(code);
    this.name = "BillingDomainError";
    this.code = code;
  }
}
