/**
 * Padrões críticos **SECE2E-6** (evoluir com falsos positivos documentados).
 */
const LEAK_REGEXES: RegExp[] = [
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /SUPABASE_JWT_SECRET/i,
  /\bDATABASE_URL\b/i,
  /postgres(?:ql)?:\/\//i,
  /\bservice_role\b/i,
  /\brefresh_token\b\s*[:=]/i,
  /\baccess_token\b\s*[:=]\s*["']?eyJ/i,
  /PrismaClientKnownRequestError/i,
  /\bPostgrestError\b/i,
  /internal server error.*supabase/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /\batob\s*\(\s*["']eyJ/i,
];

export function assertNoSensitiveLeaks(text: string): void {
  const haystack = text.slice(0, 500_000);
  for (const re of LEAK_REGEXES) {
    if (re.test(haystack)) {
      throw new Error(`Possível vazamento sensível (padrão ${re}).`);
    }
  }
}

/** Use apenas em respostas JSON/pequenas — HTML do Next em dev tem muitos `eyJ` em bundles. */
export function assertNoJwtShapeInBody(text: string): void {
  const JWT_LIKE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;
  if (JWT_LIKE.test(text)) {
    throw new Error("Possível JWT completo no corpo.");
  }
}
