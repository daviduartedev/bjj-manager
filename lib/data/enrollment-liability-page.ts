import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import { listEnrollmentLiabilityForms } from "@/actions/enrollment-liability-forms";

export async function loadEnrollmentLiabilityList(filters?: {
  studentId?: string;
  signatureStatus?: "awaiting_signature" | "signed";
  month?: string;
}) {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, rows: [] };

  const result = await listEnrollmentLiabilityForms(filters ?? {});
  if (!result.ok) return { ctx, rows: [], error: result.error };
  return { ctx, rows: result.rows, error: null };
}

export async function loadStudentForEnrollmentForm(studentId: string) {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, student: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, birth_date, document, phone, guardian_phone")
    .eq("id", studentId)
    .eq("account_id", ctx.account.id)
    .maybeSingle();

  if (error || !data) return { ctx, student: null };

  const birth = data.birth_date ? new Date(data.birth_date as string) : null;
  const isMinor = birth
    ? (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25) < 18
    : false;

  return {
    ctx,
    student: {
      id: data.id as string,
      full_name: data.full_name as string,
      birth_date: data.birth_date as string | null,
      document: data.document as string | null,
      phone: data.phone as string | null,
      guardian_phone: data.guardian_phone as string | null,
      isMinor,
    },
  };
}

export async function loadActiveStudentsForPicker() {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, students: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, birth_date")
    .eq("account_id", ctx.account.id)
    .is("removed_at", null)
    .order("full_name", { ascending: true })
    .limit(200);

  if (error) return { ctx, students: [] };

  return {
    ctx,
    students: (data ?? []).map((s) => ({
      id: s.id as string,
      full_name: s.full_name as string,
      birth_date: s.birth_date as string | null,
    })),
  };
}
