import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import type { PlanKind } from "@/lib/students/plan-kind";

export type SettingsPlanRow = {
  id: string;
  kind: PlanKind;
  name: string;
  price_cents: number;
  active: boolean;
};

const PLAN_KIND_ORDER: Record<PlanKind, number> = {
  kids_1: 0,
  kids_2: 1,
  adult: 2,
};

function sortPlans(rows: SettingsPlanRow[]): SettingsPlanRow[] {
  return [...rows].sort(
    (a, b) => PLAN_KIND_ORDER[a.kind] - PLAN_KIND_ORDER[b.kind],
  );
}

export async function loadSettingsPageData(): Promise<
  | { ctx: null; plans: SettingsPlanRow[] }
  | { ctx: NonNullable<Awaited<ReturnType<typeof getCurrentAccount>>>; plans: SettingsPlanRow[] }
> {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, plans: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("id, kind, name, price_cents, active")
    .eq("account_id", ctx.account.id);

  if (error) throw error;

  const plans = sortPlans((data ?? []) as SettingsPlanRow[]);
  return { ctx, plans };
}
