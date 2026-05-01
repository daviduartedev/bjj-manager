import { getCurrentAccount, getCurrentUser } from "@/lib/auth";
import { ensureDefaultPlansForAccount } from "@/lib/billing/ensure-default-plans";
import { createClient } from "@/lib/supabase/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const ctx = await getCurrentAccount();

  if (ctx) {
    const supabase = await createClient();
    await ensureDefaultPlansForAccount(supabase, ctx.account.id);
  }

  const academyName = ctx?.account.name ?? null;
  const userLabel = ctx?.profile.display_name ?? user?.email ?? "Professor";

  return <DashboardShell academyName={academyName} userLabel={userLabel}>{children}</DashboardShell>;
}
