/**
 * Reforço de cookies de sessão (Supabase SSR): `Secure` em produção; `SameSite=lax` por defeito.
 */
export function mergeSessionCookieOptions(
  options?: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...(options ?? {}) };
  if (merged.sameSite === undefined) {
    merged.sameSite = "lax";
  }
  if (process.env.NODE_ENV === "production") {
    merged.secure = true;
  }
  return merged;
}
