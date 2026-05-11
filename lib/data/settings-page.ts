import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import type { PlanKind } from "@/lib/students/plan-kind";

const SIGNATURE_BUCKET = process.env.SUPABASE_BRANDING_BUCKET ?? "branding-dev";
const SIGNATURE_SIGN_TTL_SECONDS = 60 * 60;

export type SettingsPlanRow = {
  id: string;
  kind: PlanKind;
  name: string;
  price_cents: number;
  active: boolean;
};

export type SettingsReceiverRow = {
  legal_name: string | null;
  cnpj: string | null;
  signature_path: string | null;
  signature_preview_url: string | null;
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
  | { ctx: null; plans: SettingsPlanRow[]; receiver: SettingsReceiverRow }
  | {
      ctx: NonNullable<Awaited<ReturnType<typeof getCurrentAccount>>>;
      plans: SettingsPlanRow[];
      receiver: SettingsReceiverRow;
    }
> {
  const emptyReceiver: SettingsReceiverRow = {
    legal_name: null,
    cnpj: null,
    signature_path: null,
    signature_preview_url: null,
  };
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, plans: [], receiver: emptyReceiver };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("id, kind, name, price_cents, active")
    .eq("account_id", ctx.account.id);

  if (error) throw error;

  const plans = sortPlans((data ?? []) as SettingsPlanRow[]);

  let signaturePreview: string | null = null;
  if (ctx.account.signature_url) {
    const { data: signed } = await supabase.storage
      .from(SIGNATURE_BUCKET)
      .createSignedUrl(ctx.account.signature_url, SIGNATURE_SIGN_TTL_SECONDS);
    signaturePreview = signed?.signedUrl ?? null;
  }

  const receiver: SettingsReceiverRow = {
    legal_name: ctx.account.legal_name,
    cnpj: ctx.account.cnpj,
    signature_path: ctx.account.signature_url,
    signature_preview_url: signaturePreview,
  };

  return { ctx, plans, receiver };
}
