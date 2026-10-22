import { getCurrentAccount } from "@/lib/auth";
import type { AcademyModality } from "@/lib/modalities/catalog";
import { createClient } from "@/lib/supabase/server";
import type { PlanKind } from "@/lib/students/plan-kind";

export type BeltCatalogRow = {
  id: string;
  kind: "adult" | "kids";
  slug: string;
  ordinal: number;
};

export type PlanCatalogRow = {
  id: string;
  kind: PlanKind;
  name: string;
  active: boolean;
};

export async function getBeltsCatalog(): Promise<BeltCatalogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("belts")
    .select("id, kind, slug, ordinal")
    .order("kind", { ascending: true })
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BeltCatalogRow[];
}

/** Planos **ativos** da conta (RLS). A provisão dos três tipos é feita no layout (**BLM-2**). */
export async function getPlansCatalog(): Promise<PlanCatalogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("id, kind, name, active")
    .eq("active", true)
    .order("kind", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlanCatalogRow[];
}

export async function getStudentCatalog(): Promise<{
  belts: BeltCatalogRow[];
  plans: PlanCatalogRow[];
  modality: AcademyModality;
}> {
  const ctx = await getCurrentAccount();
  if (!ctx) throw new Error("Conta indisponível.");
  const modality = ctx.account.modality;
  const [belts, plans] = await Promise.all([
    modality === "boxing" ? Promise.resolve([]) : getBeltsCatalog(),
    getPlansCatalog(),
  ]);
  return { belts, plans, modality };
}
