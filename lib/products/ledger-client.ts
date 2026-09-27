import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * O caderno tem RLS ligado e, em produção, a policy do professor não está aplicada.
 * A sessão autenticada grava via service role e, na leitura, recebe zero linhas.
 * Este cliente só deve ser usado depois de `getCurrentAccount()`, e toda query
 * precisa filtrar `account_id` da academia da sessão.
 */
export function ledgerClient(userClient: SupabaseClient): SupabaseClient {
  return createAdminClient() ?? userClient;
}
