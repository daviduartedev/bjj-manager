import { createClient } from "@/lib/supabase/server";
import {
  calculateAge,
  timeAtCurrentBelt,
  timeAtCurrentDegree,
  timeSinceJoined,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import type {
  ProfileGraduationRow,
  ProfilePaymentRow,
  StudentProfilePayload,
} from "@/lib/data/students-profile.shared";
import { calendarDateWhenCurrentBeltDegreeEstablished } from "@/lib/students/graduation-current-since";
import type { PaymentStatusSlug } from "@/lib/students/payment-ui";
import {
  isBillingOverdueUi,
  paymentStatusLabelPt,
} from "@/lib/students/payment-ui";

export type {
  ProfileGraduationRow,
  ProfilePaymentRow,
  StudentProfilePayload,
} from "@/lib/data/students-profile.shared";

/** PostgREST pode devolver FK 1:N como object ou array consoante tipos gerados. */
function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

export async function getStudentProfileById(
  studentId: string,
): Promise<StudentProfilePayload | null> {
  const supabase = await createClient();
  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const currentMonthFirstDay = `${todayYmd.slice(0, 7)}-01`;

  const { data: st, error: stErr } = await supabase
    .from("students")
    .select(
      `
      id,
      full_name,
      kind,
      status,
      birth_date,
      academy_start_date,
      document,
      phone,
      email,
      notes,
      current_belt_id,
      current_degree,
      belts!students_current_belt_id_fkey ( slug, kind ),
      student_plans (
        plan_id,
        due_day,
        custom_price_cents,
        ended_at,
        plans ( name, kind, price_cents )
      ),
      student_graduations (
        id,
        resulting_belt_id,
        resulting_degree,
        graduated_at,
        was_skip,
        skip_reason,
        belts!student_graduations_resulting_belt_id_fkey ( slug, kind )
      )
    `,
    )
    .eq("id", studentId)
    .maybeSingle();

  if (stErr || !st) return null;

  const beltRel = relationOne(
    st.belts as
      | { slug: string; kind: "adult" | "kids" }
      | { slug: string; kind: "adult" | "kids" }[]
      | null,
  );

  const plansRel = (st.student_plans ?? null) as
    | {
        plan_id: string;
        due_day: number;
        custom_price_cents: number | null;
        ended_at: string | null;
        plans:
          | { name: string; kind: string; price_cents: number }
          | { name: string; kind: string; price_cents: number }[]
          | null;
      }[]
    | null;

  const open = plansRel?.find((p) => p.ended_at == null);
  const planRow = relationOne(open?.plans ?? null);

  const billing =
    open && planRow
      ? {
          plan_name: planRow.name,
          plan_kind: planRow.kind,
          price_cents: planRow.price_cents,
          effective_price_cents:
            open.custom_price_cents ?? planRow.price_cents,
          due_day: open.due_day,
        }
      : null;

  const rawGradsRaw = (st.student_graduations ?? []) as {
    id: string;
    resulting_belt_id: string;
    resulting_degree: number;
    graduated_at: string;
    was_skip: boolean;
    skip_reason: string | null;
    belts:
      | { slug: string; kind: "adult" | "kids" }
      | { slug: string; kind: "adult" | "kids" }[]
      | null;
  }[];

  const rawGrads = rawGradsRaw.map((g) => ({
    ...g,
    belts: relationOne(g.belts),
  }));

  const graduationsForTimeline = rawGrads.map((g) => ({
    resulting_belt_id: g.resulting_belt_id,
    resulting_degree: g.resulting_degree,
    graduated_at: g.graduated_at,
  }));

  const establishedYmd = calendarDateWhenCurrentBeltDegreeEstablished(
    graduationsForTimeline,
    st.current_belt_id as string,
    st.current_degree as number,
  );

  const academyStart = st.academy_start_date as string | null;
  const fromBeltDegree =
    establishedYmd ?? (rawGrads.length === 0 ? academyStart : null);
  const fallbackNote =
    rawGrads.length === 0
      ? "Tempos calculados pela data de entrada na academia até haver graduações registadas."
      : establishedYmd === null && academyStart
        ? "Estado actual não coincide com o histórico; tempos usam a data de entrada."
        : null;

  const durationFrom = fromBeltDegree ?? academyStart ?? null;

  const ageYears = calculateAge(st.birth_date as string | null, todayYmd);

  const timeAtBeltPhrase = timeAtCurrentBelt(durationFrom, todayYmd);
  const timeAtDegreePhrase = timeAtCurrentDegree(durationFrom, todayYmd);
  const timeSinceJoinedPhrase = timeSinceJoined(academyStart, todayYmd);

  const graduations: ProfileGraduationRow[] = rawGrads
    .map((g) => ({
      id: g.id,
      resulting_degree: g.resulting_degree,
      graduated_at: g.graduated_at,
      was_skip: g.was_skip,
      skip_reason: g.skip_reason,
      belt: g.belts,
    }))
    .sort(
      (a, b) =>
        new Date(b.graduated_at).getTime() - new Date(a.graduated_at).getTime(),
    );

  const { data: payRecent, error: payErr } = await supabase
    .from("payments")
    .select("reference_month, status, amount_cents, paid_at")
    .eq("student_id", studentId)
    .order("reference_month", { ascending: false })
    .limit(12);

  if (payErr) throw payErr;

  const paymentsRecent: ProfilePaymentRow[] = (payRecent ?? []).map((p) => ({
    reference_month: p.reference_month as string,
    status: p.status as PaymentStatusSlug,
    amount_cents: p.amount_cents as number | null,
    paid_at: p.paid_at as string | null,
  }));

  const { data: payMonth } = await supabase
    .from("payments")
    .select("reference_month, status, amount_cents, paid_at")
    .eq("student_id", studentId)
    .eq("reference_month", currentMonthFirstDay)
    .maybeSingle();

  const currentMonthPayment: ProfilePaymentRow | null = payMonth
    ? {
        reference_month: payMonth.reference_month as string,
        status: payMonth.status as PaymentStatusSlug,
        amount_cents: payMonth.amount_cents as number | null,
        paid_at: payMonth.paid_at as string | null,
      }
    : null;

  const currentMonthEffectiveStatus: PaymentStatusSlug =
    currentMonthPayment?.status ?? "pending";

  const dueDay = billing?.due_day ?? 10;
  const currentMonthOverdue =
    billing !== null &&
    isBillingOverdueUi({
      referenceMonthFirstDay: currentMonthFirstDay,
      dueDay,
      status: currentMonthEffectiveStatus,
      todayYmd,
    });

  return {
    id: st.id as string,
    full_name: st.full_name as string,
    kind: st.kind as "adult" | "kids",
    status: st.status as string,
    birth_date: st.birth_date as string | null,
    academy_start_date: academyStart,
    document: st.document as string | null,
    phone: st.phone as string | null,
    email: st.email as string | null,
    notes: st.notes as string | null,
    current_belt_id: st.current_belt_id as string,
    current_degree: st.current_degree as number,
    currentBelt: beltRel,
    billing,
    graduations,
    paymentsRecent,
    todayYmd,
    currentMonthFirstDay,
    currentMonthPayment,
    ageYears,
    timeAtBeltPhrase,
    timeAtDegreePhrase,
    timeSinceJoinedPhrase,
    durationBasisNote: fallbackNote,
    currentMonthEffectiveStatus,
    currentMonthStatusLabel: paymentStatusLabelPt(currentMonthEffectiveStatus),
    currentMonthOverdue,
  };
}
