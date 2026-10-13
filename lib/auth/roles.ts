import type { SupabaseClient } from "@supabase/supabase-js";

/** Papéis de aplicação (**AUTH-8**, **SPT-2.2**). */
export type AuthRole = "professor" | "student";

/**
 * Resolve o papel do utilizador autenticado a partir de `profiles.role`.
 * Sem perfil, papel ilegível, nulo ou desconhecido: nenhum papel.
 */
export async function resolveAuthRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;

  const role = (data as { role?: string | null } | null)?.role;
  if (role === "student" || role === "professor") return role;
  return null;
}

export function isStudentRole(role: AuthRole | null): role is "student" {
  return role === "student";
}

export function postLoginPathForRole(role: AuthRole): "/portal" | "/painel" {
  return isStudentRole(role) ? "/portal" : "/painel";
}
