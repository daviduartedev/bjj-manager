import type { SupabaseClient } from "@supabase/supabase-js";

import { latestGraduationEvent } from "./belt-order";
import type { GraduationEventInput } from "./types";

export async function syncStudentCurrentFromEvents(
  supabase: SupabaseClient,
  studentId: string,
  events: GraduationEventInput[],
): Promise<void> {
  const latest = latestGraduationEvent(events);
  if (!latest) return;

  const { error } = await supabase
    .from("students")
    .update({
      current_belt_id: latest.resulting_belt_id,
      current_degree: latest.resulting_degree,
    })
    .eq("id", studentId);

  if (error) throw error;
}
