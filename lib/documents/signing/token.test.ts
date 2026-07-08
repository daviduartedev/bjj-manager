import { describe, expect, it } from "vitest";

import {
  buildSigningPageUrl,
  generateSigningToken,
  hashSigningToken,
  isSigningTokenExpired,
} from "./token";

describe("signing token", () => {
  it("gera token e hash determinístico", () => {
    const { token, hash } = generateSigningToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hash).toBe(hashSigningToken(token));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("monta URL pública de assinatura", () => {
    const url = buildSigningPageUrl("abc123");
    expect(url).toContain("/assinatura/abc123");
  });

  it("detecta token expirado", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isSigningTokenExpired(past)).toBe(true);
    expect(isSigningTokenExpired(future)).toBe(false);
    expect(isSigningTokenExpired(null)).toBe(true);
  });
});
