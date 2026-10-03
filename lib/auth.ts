import type { User } from "@supabase/supabase-js";

import type { AuthRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type AccountRow = {
  id: string;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  signature_url: string | null;
  logo_url: string | null;
  readiness_kids_degree_months: number | null;
  readiness_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  user_id: string;
  account_id: string;
  display_name: string;
  phone: string | null;
  role: AuthRole;
  painel_hidden_blocks: string[];
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
  const fullSelect = `
      id,
      user_id,
      account_id,
      display_name,
      phone,
      role,
      painel_hidden_blocks,
      created_at,
      updated_at,
      accounts (
        id,
        name,
        legal_name,
        cnpj,
        signature_url,
        logo_url,
        readiness_kids_degree_months,
        readiness_confirmed_at,
        created_at,
        updated_at
      )
    `;

  const legacySelect = `
      id,
      user_id,
      account_id,
      display_name,
      phone,
      role,
      created_at,
      updated_at,
      accounts (
        id,
        name,
        legal_name,
        cnpj,
        signature_url,
        logo_url,
        created_at,
        updated_at
      )
    `;

  let { data: row, error } = await supabase
    .from("profiles")
    .select(fullSelect)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    const retry = await supabase
      .from("profiles")
      .select(legacySelect)
      .eq("user_id", user.id)
      .maybeSingle();
    row = retry.data as typeof row;
    error = retry.error;
  }

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
    role: (profileRow.role === "student" ? "student" : "professor") as AuthRole,
    painel_hidden_blocks: Array.isArray(profileRow.painel_hidden_blocks)
      ? profileRow.painel_hidden_blocks
      : [],
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
  };

  const account: AccountRow = {
    id: accountRow.id,
    name: accountRow.name,
    legal_name: accountRow.legal_name ?? null,
    cnpj: accountRow.cnpj ?? null,
    signature_url: accountRow.signature_url ?? null,
    logo_url: accountRow.logo_url ?? null,
    readiness_kids_degree_months:
      typeof accountRow.readiness_kids_degree_months === "number"
        ? accountRow.readiness_kids_degree_months
        : null,
    readiness_confirmed_at: accountRow.readiness_confirmed_at ?? null,
    created_at: accountRow.created_at,
    updated_at: accountRow.updated_at,
  };

  return { user, profile, account };
}
