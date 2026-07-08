function stripTrailingSlash(u: string): string {
  return u.trim().replace(/\/$/, "");
}

function toHttpsOrigin(hostOrUrl: string): string {
  const host = hostOrUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}`;
}

/**
 * Origem pública para links partilhados (WhatsApp, assinatura).
 * Em produção na Vercel, prioriza o URL estável do deployment em vez de
 * `NEXT_PUBLIC_APP_URL` desactualizado (causa DEPLOYMENT_NOT_FOUND no edge).
 */
export function resolvePublicAppOrigin(): string {
  const canonical =
    process.env.APP_URL?.trim() || process.env.CANONICAL_APP_URL?.trim();
  if (canonical) return stripTrailingSlash(canonical);

  if (process.env.VERCEL_ENV === "production") {
    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (prod) return toHttpsOrigin(prod);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return toHttpsOrigin(vercel);

  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (pub) return stripTrailingSlash(pub);

  return "http://localhost:3000";
}
