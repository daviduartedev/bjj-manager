import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import type { PlanKind } from "@/lib/students/plan-kind";

const BRANDING_SIGN_TTL_SECONDS = 60 * 60;

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
  logo_path: string | null;
  logo_preview_url: string | null;
};

const PLAN_KIND_ORDER: Record<PlanKind, number> = {
  baby: 0,
  kids_1: 1,
  kids_2: 2,
  adult: 3,
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
    logo_path: null,
    logo_preview_url: null,
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
      .from(BRANDING_BUCKET)
      .createSignedUrl(ctx.account.signature_url, BRANDING_SIGN_TTL_SECONDS);
    signaturePreview = signed?.signedUrl ?? null;
  }

  let logoPreview: string | null = null;
  if (ctx.account.logo_url) {
    const { data: signed } = await supabase.storage
      .from(BRANDING_BUCKET)
      .createSignedUrl(ctx.account.logo_url, BRANDING_SIGN_TTL_SECONDS);
    logoPreview = signed?.signedUrl ?? null;
  }

  const receiver: SettingsReceiverRow = {
    legal_name: ctx.account.legal_name,
    cnpj: ctx.account.cnpj,
    signature_path: ctx.account.signature_url,
    signature_preview_url: signaturePreview,
    logo_path: ctx.account.logo_url,
    logo_preview_url: logoPreview,
  };

  return { ctx, plans, receiver };
}
