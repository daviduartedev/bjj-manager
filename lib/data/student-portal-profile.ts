import { getCurrentAccount } from "@/lib/auth";
import type { AcademyModality } from "@/lib/modalities/catalog";
import type { ReferencedGraduationFields } from "@/lib/modalities/referenced-ranks";
import { createClient } from "@/lib/supabase/server";

export type OwnStudentPortalProfile = ReferencedGraduationFields & {
  id: string;
  full_name: string;
  kind: "adult" | "kids" | "baby";
  birth_date: string | null;
  academy_start_date: string | null;
  phone: string | null;
  email: string | null;
  weight_kg: number | null;
  current_degree: number | null;
  currentBelt: { slug: string; kind: "adult" | "kids" } | null;
  modality: AcademyModality;
  academyName: string;
};

/** Sem parâmetro de aluno: a ficha é resolvida exclusivamente pela sessão. */
export async function getOwnStudentPortalProfile(): Promise<OwnStudentPortalProfile | null> {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "student") return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("students")
    .select(`id,full_name,kind,birth_date,academy_start_date,phone,email,weight_kg,
      current_degree,graduation_reference_id,current_rank_code,current_rank_date,
      belts!students_current_belt_id_fkey(slug,kind)`)
    .eq("user_id", ctx.user.id).eq("account_id", ctx.profile.account_id)
    .is("archived_at", null).is("removed_at", null).maybeSingle();
  if (error) throw new Error("Não foi possível carregar sua ficha. Tente novamente.");
  if (!data) return null;
  const { belts, ...fields } = data;
  const currentBelt = Array.isArray(belts) ? belts[0] ?? null : belts;
  return { ...fields, currentBelt, modality: ctx.account.modality, academyName: ctx.account.name } as OwnStudentPortalProfile;
}
