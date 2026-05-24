import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service role — **apenas** server-side (AUTH-7, SPEC-11.2).
 * Usado em provisionamento de portal quando RLS não permite INSERT em `profiles`.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return null;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (error) return null;

  const found = data.users.find((u) => u.email?.trim().toLowerCase() === normalized);
  return found?.id ?? null;
}
