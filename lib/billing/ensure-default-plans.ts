import type { createClient } from "@/lib/supabase/server";

import { DEFAULT_PLAN_ROWS } from "./constants";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Garante os três `plan_kind` por conta (**BLM-2**). Idempotente: ignora violação de unicidade (23505).
 */
export async function ensureDefaultPlansForAccount(
  supabase: SupabaseServer,
  accountId: string,
): Promise<void> {
  for (const row of DEFAULT_PLAN_ROWS) {
    const { error } = await supabase.from("plans").insert({
      account_id: accountId,
      kind: row.kind,
      name: row.name,
      price_cents: row.price_cents,
      active: true,
    });
    if (error?.code === "23505") continue;
    if (error) throw error;
  }
}
