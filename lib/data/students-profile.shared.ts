import {
  formatDateBR,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import type { PaymentStatusSlug } from "@/lib/students/payment-ui";
import { isStudentInMonthlyOperationalWallet } from "@/lib/students/monthly-operational-wallet";

/** Tipos e helpers puros partilhados, seguros para import em `"use client"`. */

export type ProfileGraduationRow = {
  id: string;
  resulting_degree: number;
  graduated_at: string;
  was_skip: boolean;
  skip_reason: string | null;
  belt: { slug: string; kind: "adult" | "kids" } | null;
};

export type ProfilePaymentRow = {
  reference_month: string;
  status: PaymentStatusSlug;
  amount_cents: number | null;
  paid_at: string | null;
};

export type StudentProfilePayload = {
  id: string;
  full_name: string;
  kind: "adult" | "kids";
  status: string;
  archived_at: string | null;
  removed_at: string | null;
  birth_date: string | null;
  academy_start_date: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  current_belt_id: string;
  current_degree: number;
  currentBelt: { slug: string; kind: "adult" | "kids" } | null;
  billing: {
    plan_name: string;
    plan_kind: string;
    price_cents: number;
    effective_price_cents: number;
    due_day: number;
  } | null;
  graduations: ProfileGraduationRow[];
  paymentsRecent: ProfilePaymentRow[];
  todayYmd: string;
  currentMonthFirstDay: string;
  currentMonthPayment: ProfilePaymentRow | null;
  ageYears: number | null;
  timeAtBeltPhrase: string | null;
  timeAtDegreePhrase: string | null;
  timeSinceJoinedPhrase: string | null;
  durationBasisNote: string | null;
  currentMonthEffectiveStatus: PaymentStatusSlug;
  currentMonthStatusLabel: string;
  currentMonthOverdue: boolean;
  /** **SPR-9**, **BR-9**: requer Ativo sem arquivo/remoção e plano efectivo. */
  canRegisterMonthlyPayments: boolean;
  monthlyPaymentsBlockedReason: string | null;
  /** Vínculo portal (**SPT-2.3**). */
  user_id: string | null;
  portal_terms_accepted_at: string | null;
};

export function resolveProfileMonthlyPaymentsAccess(args: {
  billingPresent: boolean;
  status: string;
  archived_at: string | null;
  removed_at: string | null;
}): { canRegisterMonthlyPayments: boolean; monthlyPaymentsBlockedReason: string | null } {
  if (!args.billingPresent) {
    return {
      canRegisterMonthlyPayments: false,
      monthlyPaymentsBlockedReason:
        "Associe um plano ao aluno na ficha completa para registar pagamentos.",
    };
  }

  const ok = isStudentInMonthlyOperationalWallet({
    status: args.status,
    archived_at: args.archived_at,
    removed_at: args.removed_at,
  });

  if (ok) {
    return { canRegisterMonthlyPayments: true, monthlyPaymentsBlockedReason: null };
  }

  if (args.removed_at) {
    return {
      canRegisterMonthlyPayments: false,
      monthlyPaymentsBlockedReason:
        "Este cadastro foi removido da operação corrente. Anule a remoção na lista «Removidos» antes de registar mensalidades.",
    };
  }

  if (args.archived_at) {
    return {
      canRegisterMonthlyPayments: false,
      monthlyPaymentsBlockedReason:
        "Aluno arquivado. Desarquive-o na vista «Arquivados» antes de registar mensalidades.",
    };
  }

  if (args.status !== "active") {
    return {
      canRegisterMonthlyPayments: false,
      monthlyPaymentsBlockedReason:
        "Apenas alunos Activos fazem parte da carteira mensal. Ajuste a situação do aluno.",
    };
  }

  return {
    canRegisterMonthlyPayments: false,
    monthlyPaymentsBlockedReason:
      "Não é possível registar mensalidade para este estado do aluno.",
  };
}

export function profileFormatPaidAt(iso: string | null): string {
  if (!iso) return ",";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return ",";
  return formatDateBR(toCalendarDateStringInAppTZ(d)) ?? ",";
}
