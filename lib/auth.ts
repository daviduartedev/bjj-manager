import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type AccountRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  user_id: string;
  account_id: string;
  display_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthContext = {
  user: User;
  profile: ProfileRow;
  account: AccountRow;
};

/**
 * Utilizador autenticado na sessão atual (JWT/cookies), sem garantir linha em `profiles`.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Utilizador + perfil + conta da academia, respeitando RLS (AUTH-6.1).
 */
export async function getCurrentAccount(): Promise<AuthContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      user_id,
      account_id,
      display_name,
      phone,
      created_at,
      updated_at,
      accounts (
        id,
        name,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !row) return null;

  type ProfileWithAccount = ProfileRow & {
    accounts: AccountRow | AccountRow[] | null;
  };

  const profileRow = row as ProfileWithAccount;
  const nested = profileRow.accounts;
  const accountRow = Array.isArray(nested) ? nested[0] : nested;
  if (!accountRow) return null;

  const profile: ProfileRow = {
    id: profileRow.id,
    user_id: profileRow.user_id,
    account_id: profileRow.account_id,
    display_name: profileRow.display_name,
    phone: profileRow.phone ?? null,
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
  };

  return { user, profile, account: accountRow };
}
