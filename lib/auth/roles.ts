import type { SupabaseClient } from "@supabase/supabase-js";

/** Papéis de aplicação (**AUTH-8**, **SPT-2.2**). */
export type AuthRole = "professor" | "student";

const DEFAULT_ROLE: AuthRole = "professor";

/**
 * Resolve o papel do utilizador autenticado a partir de `profiles.role`.
 * Fallback `professor` quando a coluna ainda não existe (cycle de schema pendente).
 */
export async function resolveAuthRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return DEFAULT_ROLE;
  }

  const role = (data as { role?: string | null } | null)?.role;
  if (role === "student") return "student";
  return DEFAULT_ROLE;
}

export function isStudentRole(role: AuthRole): boolean {
  return role === "student";
}

export function postLoginPathForRole(role: AuthRole): "/portal" | "/painel" {
  return isStudentRole(role) ? "/portal" : "/painel";
}
