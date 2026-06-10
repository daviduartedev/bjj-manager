import { createClient } from "@/lib/supabase/server";
import {
  calculateAge,
  timeAtCurrentBelt,
  timeAtCurrentDegree,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import type { BeltCatalogRow } from "@/lib/data/students-catalog";
import { getBeltsCatalog } from "@/lib/data/students-catalog";
import { calendarDateWhenCurrentBeltDegreeEstablished } from "@/lib/students/graduation-current-since";

export type GraduationHistoryRow = {
  id: string;
  resulting_belt_id: string;
  resulting_degree: number;
  graduated_at: string;
  was_skip: boolean;
  skip_reason: string | null;
  weight_kg: number | null;
  belt: { slug: string; kind: "adult" | "kids" } | null;
};

export type GraduationsPagePayload = {
  studentId: string;
  full_name: string;
  kind: "adult" | "kids";
  ageYears: number | null;
  current_belt_id: string;
  current_degree: number;
  currentBelt: { slug: string; kind: "adult" | "kids" } | null;
  timeAtBeltPhrase: string | null;
  timeAtDegreePhrase: string | null;
  durationBasisNote: string | null;
  todayYmd: string;
  graduations: GraduationHistoryRow[];
  belts: BeltCatalogRow[];
};

function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

export async function getGraduationsPageByStudentId(
  studentId: string,
): Promise<GraduationsPagePayload | null> {
  const supabase = await createClient();
  const todayYmd = toCalendarDateStringInAppTZ(new Date());

  const [{ data: st, error: stErr }, belts] = await Promise.all([
    supabase
      .from("students")
      .select(
        `
        id,
        full_name,
        kind,
        birth_date,
        academy_start_date,
        current_belt_id,
        current_degree,
        belts!students_current_belt_id_fkey ( slug, kind ),
        student_graduations (
          id,
          resulting_belt_id,
          resulting_degree,
          graduated_at,
          was_skip,
          skip_reason,
          weight_kg,
          belts!student_graduations_resulting_belt_id_fkey ( slug, kind )
        )
      `,
      )
      .eq("id", studentId)
      .maybeSingle(),
    getBeltsCatalog(),
  ]);

  if (stErr || !st) return null;

  const beltRel = relationOne(
    st.belts as
      | { slug: string; kind: "adult" | "kids" }
      | { slug: string; kind: "adult" | "kids" }[]
      | null,
  );

  const rawGradsRaw = (st.student_graduations ?? []) as {
    id: string;
    resulting_belt_id: string;
    resulting_degree: number;
    graduated_at: string;
    was_skip: boolean;
    skip_reason: string | null;
    weight_kg: number | null;
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

  const graduations: GraduationHistoryRow[] = rawGrads
    .map((g) => ({
      id: g.id,
      resulting_belt_id: g.resulting_belt_id,
      resulting_degree: g.resulting_degree,
      graduated_at: g.graduated_at,
      was_skip: g.was_skip,
      skip_reason: g.skip_reason,
      weight_kg: g.weight_kg,
      belt: g.belts,
    }))
    .sort(
      (a, b) =>
        new Date(b.graduated_at).getTime() - new Date(a.graduated_at).getTime(),
    );

  return {
    studentId: st.id as string,
    full_name: st.full_name as string,
    kind: st.kind as "adult" | "kids",
    ageYears: calculateAge(st.birth_date as string | null, todayYmd),
    current_belt_id: st.current_belt_id as string,
    current_degree: st.current_degree as number,
    currentBelt: beltRel,
    timeAtBeltPhrase: timeAtCurrentBelt(durationFrom, todayYmd),
    timeAtDegreePhrase: timeAtCurrentDegree(durationFrom, todayYmd),
    durationBasisNote: fallbackNote,
    todayYmd,
    graduations,
    belts,
  };
}
