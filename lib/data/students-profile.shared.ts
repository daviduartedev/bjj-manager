import {
  formatDateBR,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import type { PaymentStatusSlug } from "@/lib/students/payment-ui";

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
};

export function profileFormatPaidAt(iso: string | null): string {
  if (!iso) return ",";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return ",";
  return formatDateBR(toCalendarDateStringInAppTZ(d)) ?? ",";
}
