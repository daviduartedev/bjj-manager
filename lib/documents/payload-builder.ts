import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { planKindLabels } from "@/lib/i18n/domain-enums";

import type {
  CertificatePayload,
  DocumentPayload,
  EnrollmentLiabilityFormPayload,
  EnrollmentProofPayload,
  LiabilityTermPayload,
  ManualReceiptPayload,
  PaymentReceiptPayload,
  ReceiverInfo,
} from "./types";
import type { EnrollmentLiabilityDraftInput } from "./templates/enrollment-liability-form/v1/schema";

type AccountForReceiver = {
  id: string;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  signature_url: string | null;
};

type StudentRow = {
  id: string;
  full_name: string;
  document: string | null;
  birth_date: string | null;
  academy_start_date: string | null;
};

type PaymentRow = {
  id: string;
  amount_cents: number | null;
  paid_at: string | null;
  reference_month: string;
  payment_method: string | null;
  notes: string | null;
  status: string;
  student_id: string;
};

export class PayloadBuildError extends Error {
  constructor(
    readonly code:
      | "STUDENT_NOT_FOUND"
      | "PAYMENT_NOT_FOUND"
      | "PAYMENT_NOT_PAID"
      | "ACCOUNT_NOT_FOUND"
      | "NO_OPEN_PLAN"
      | "GUARDIAN_REQUIRED",
    message?: string,
  ) {
    super(message ?? code);
  }
}

function buildReceiver(account: AccountForReceiver): ReceiverInfo {
  return {
    academyName: account.name,
    legalName: account.legal_name,
    cnpj: account.cnpj,
    signaturePath: account.signature_url,
  };
}

async function getAccount(
  client: SupabaseClient,
  accountId: string,
): Promise<AccountForReceiver> {
  const { data, error } = await client
    .from("accounts")
    .select("id, name, legal_name, cnpj, signature_url")
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new PayloadBuildError("ACCOUNT_NOT_FOUND");
  return data as AccountForReceiver;
}

async function getStudent(
  client: SupabaseClient,
  studentId: string,
): Promise<StudentRow> {
  const { data, error } = await client
    .from("students")
    .select("id, full_name, document, birth_date, academy_start_date")
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new PayloadBuildError("STUDENT_NOT_FOUND");
  return data as StudentRow;
}

async function getPayment(
  client: SupabaseClient,
  paymentId: string,
): Promise<PaymentRow> {
  const { data, error } = await client
    .from("payments")
    .select(
      "id, amount_cents, paid_at, reference_month, payment_method, notes, status, student_id",
    )
    .eq("id", paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new PayloadBuildError("PAYMENT_NOT_FOUND");
  return data as PaymentRow;
}

async function getOpenStudentPlanLabel(
  client: SupabaseClient,
  studentId: string,
): Promise<string> {
  const { data } = await client
    .from("student_plans")
    .select("plan_id, plans (name, kind)")
    .eq("student_id", studentId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const embed = (data?.plans as { name: string; kind: keyof typeof planKindLabels } | { name: string; kind: keyof typeof planKindLabels }[] | null) ?? null;
  const plan = Array.isArray(embed) ? embed[0] : embed;
  if (!plan) return "—";
  return `${plan.name} (${planKindLabels[plan.kind]})`;
}

function isMinorOnDate(birthDate: string | null, refDate: Date = new Date()): boolean {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return false;
  const ageMs = refDate.getTime() - birth.getTime();
  const years = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  return years < 18;
}

function ageOnDate(birthDate: string | null, refDate: Date = new Date()): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const ageMs = refDate.getTime() - birth.getTime();
  return Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
}

async function assertOpenStudentPlan(
  client: SupabaseClient,
  studentId: string,
): Promise<void> {
  const { data } = await client
    .from("student_plans")
    .select("id")
    .eq("student_id", studentId)
    .is("ended_at", null)
    .limit(1)
    .maybeSingle();
  if (!data) throw new PayloadBuildError("NO_OPEN_PLAN", "Aluno sem plano activo.");
}

export async function buildPaymentReceiptPayload(
  client: SupabaseClient,
  args: { accountId: string; paymentId: string },
): Promise<{ payload: DocumentPayload; studentId: string }> {
  const payment = await getPayment(client, args.paymentId);
  if (payment.status !== "paid") {
    throw new PayloadBuildError("PAYMENT_NOT_PAID");
  }
  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, payment.student_id),
  ]);
  const planLabel = await getOpenStudentPlanLabel(client, student.id);

  const data: PaymentReceiptPayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    payer: { fullName: student.full_name, document: student.document },
    payment: {
      amountCents: Number(payment.amount_cents ?? 0),
      paidAt: payment.paid_at ?? new Date().toISOString(),
      referenceMonth: payment.reference_month,
      paymentMethod: payment.payment_method,
      notes: payment.notes,
      description: `Mensalidade — ${planLabel}`,
    },
  };

  return {
    payload: { type: "payment_receipt", data },
    studentId: student.id,
  };
}

export async function buildEnrollmentProofPayload(
  client: SupabaseClient,
  args: { accountId: string; studentId: string },
): Promise<{ payload: DocumentPayload }> {
  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, args.studentId),
  ]);
  const planLabel = await getOpenStudentPlanLabel(client, student.id);

  const data: EnrollmentProofPayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    student: {
      fullName: student.full_name,
      document: student.document,
      enrolledSinceLabel: student.academy_start_date,
      planLabel,
    },
  };

  return { payload: { type: "enrollment_proof", data } };
}

export async function buildCertificatePayload(
  client: SupabaseClient,
  args: { accountId: string; studentId: string; title: string; description: string },
): Promise<{ payload: DocumentPayload }> {
  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, args.studentId),
  ]);
  const data: CertificatePayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    student: { fullName: student.full_name, document: student.document },
    certificate: { title: args.title, description: args.description },
  };
  return { payload: { type: "certificate", data } };
}

export async function buildLiabilityTermPayload(
  client: SupabaseClient,
  args: {
    accountId: string;
    studentId: string;
    bodyMarkdown: string;
    guardianFullName?: string | null;
    guardianDocument?: string | null;
  },
): Promise<{ payload: DocumentPayload }> {
  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, args.studentId),
  ]);
  const minor = isMinorOnDate(student.birth_date);
  const guardian =
    args.guardianFullName && args.guardianFullName.trim().length > 0
      ? {
          fullName: args.guardianFullName,
          document: args.guardianDocument ?? null,
        }
      : null;

  const data: LiabilityTermPayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    student: { fullName: student.full_name, document: student.document, isMinor: minor },
    guardian,
    bodyMarkdown: args.bodyMarkdown,
  };
  return { payload: { type: "liability_term", data } };
}

export async function buildManualReceiptPayload(
  client: SupabaseClient,
  args: {
    accountId: string;
    studentId: string;
    amountCents: number;
    description: string;
    paidAt: string;
    payerFullName?: string | null;
    payerDocument?: string | null;
  },
): Promise<{ payload: DocumentPayload }> {
  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, args.studentId),
  ]);
  const data: ManualReceiptPayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    payer: {
      fullName: args.payerFullName?.trim() || student.full_name,
      document: args.payerDocument ?? student.document ?? null,
    },
    payment: {
      amountCents: args.amountCents,
      paidAt: args.paidAt,
      description: args.description,
    },
  };
  return { payload: { type: "manual_receipt", data } };
}

export async function buildEnrollmentLiabilityFormPayload(
  client: SupabaseClient,
  args: { accountId: string; draft: EnrollmentLiabilityDraftInput },
): Promise<{ payload: DocumentPayload; studentId: string; variant: "adult" | "minor" }> {
  await assertOpenStudentPlan(client, args.draft.studentId);

  const [account, student] = await Promise.all([
    getAccount(client, args.accountId),
    getStudent(client, args.draft.studentId),
  ]);

  const minor = isMinorOnDate(student.birth_date);
  const variant = minor ? "minor" : "adult";

  if (minor && !args.draft.guardian) {
    throw new PayloadBuildError(
      "GUARDIAN_REQUIRED",
      "Informe os dados do responsável legal.",
    );
  }

  const data: EnrollmentLiabilityFormPayload = {
    documentNumber: "",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: buildReceiver(account),
    variant,
    signaturePlace: args.draft.signaturePlace,
    student: {
      fullName: student.full_name,
      rg: args.draft.studentRg ?? null,
      cpf: student.document,
      address: args.draft.studentAddress,
      age: ageOnDate(student.birth_date),
      hasDisability: args.draft.health.hasDisability ?? null,
      usesMedication: args.draft.health.usesMedication ?? null,
      medicationDetails: args.draft.health.medicationDetails ?? null,
      lastPhysicalExamDate: args.draft.health.lastPhysicalExamDate ?? null,
      medicalConditions: args.draft.health.medicalConditions ?? null,
    },
    guardian: minor && args.draft.guardian
      ? {
          fullName: args.draft.guardian.fullName,
          rg: args.draft.guardian.rg ?? null,
          cpf: args.draft.guardian.cpf ?? null,
          phone: args.draft.guardian.phone ?? null,
          municipality: args.draft.guardian.municipality ?? null,
          state: args.draft.guardian.state ?? null,
          address: args.draft.guardian.address,
        }
      : null,
  };

  return {
    payload: { type: "enrollment_liability_form", data },
    studentId: student.id,
    variant,
  };
}
