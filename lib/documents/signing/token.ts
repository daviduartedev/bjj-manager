import { createHash, randomBytes } from "node:crypto";

import { resolvePublicAppOrigin } from "@/lib/app-url";

export const DOC_SIGNING_TTL_SECONDS = Number.parseInt(
  process.env.DOC_SIGNING_TTL_SECONDS ?? "604800",
  10,
);

export function generateSigningToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashSigningToken(token) };
}

export function hashSigningToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function buildSigningPageUrl(token: string): string {
  const base = resolvePublicAppOrigin();
  return `${base}/assinatura/${encodeURIComponent(token)}`;
}

export function isSigningTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}
