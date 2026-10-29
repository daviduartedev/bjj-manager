import { getCurrentAccount, getCurrentUser } from "@/lib/auth";
import { ensureDefaultPlansForAccount } from "@/lib/billing/ensure-default-plans";
import { createClient } from "@/lib/supabase/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubscriptionAccessBanner } from "@/components/layout/subscription-access-banner";
import { getAcademyAccess } from "@/lib/subscriptions/guards";
import type { SubscriptionAccess } from "@/lib/subscriptions/access";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const ctx = await getCurrentAccount();
  let access: SubscriptionAccess | null = null;
  let activeStudentCount: number | null = null;
  let trialEndsAt: string | null = null;

  if (ctx) {
    const supabase = await createClient();
    try {
      const state = await getAcademyAccess(supabase, ctx.account.id);
      access = state.access;
      trialEndsAt = state.subscription?.trial_ends_at ?? null;
      // Uma consulta em modo leitura nao pode depender de inserir os planos padrao.
      if (access.canWrite) await ensureDefaultPlansForAccount(supabase, ctx.account.id);
      if (access.activeStudentLimit !== null) {
        const counted = await supabase.from("students").select("id", { count: "exact", head: true })
          .eq("account_id", ctx.account.id).eq("status", "active").is("archived_at", null).is("removed_at", null);
        activeStudentCount = counted.error ? null : counted.count;
      }
    } catch {
      // Falha no controle comercial preserva consulta; as escritas continuam protegidas no servidor/banco.
      access = null;
    }
  }

  const academyName = ctx?.account.name ?? null;
  const userLabel = ctx?.profile.display_name ?? user?.email ?? "Professor";

  return <DashboardShell academyName={academyName} userLabel={userLabel}>
    {ctx ? <SubscriptionAccessBanner access={access} activeStudentCount={activeStudentCount} trialEndsAt={trialEndsAt} /> : null}
    {children}
  </DashboardShell>;
}
