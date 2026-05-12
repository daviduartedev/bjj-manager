import type { createClient } from "@/lib/supabase/server";

import { BillingDomainError } from "@/lib/billing/domain-error";
import {
  isStudentInMonthlyOperationalWallet,
  type MonthlyOperationalWalletFields,
} from "@/lib/students/monthly-operational-wallet";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export async function loadStudentMonthlyWalletFields(
  supabase: SupabaseServer,
  studentId: string,
): Promise<(MonthlyOperationalWalletFields & { id: string }) | null> {
  const { data, error } = await supabase
    .from("students")
    .select("id, status, archived_at, removed_at")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    status: data.status as string,
    archived_at: (data.archived_at as string | null) ?? null,
    removed_at: (data.removed_at as string | null) ?? null,
  };
}

export async function requireStudentEligibleForMonthlyPayment(
  supabase: SupabaseServer,
  studentId: string,
): Promise<void> {
  const row = await loadStudentMonthlyWalletFields(supabase, studentId);
  if (!row) throw new BillingDomainError("STUDENT_NOT_AVAILABLE");
  if (!isStudentInMonthlyOperationalWallet(row)) {
    throw new BillingDomainError("MONTHLY_WALLET_EXCLUDED");
  }
}
