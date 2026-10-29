import { describe, expect, it } from "vitest";

import { verifySubscriptionWebhook } from "./webhook";

// Vetor fixo para {} com a chave pública da documentação oficial AbacatePay.
const vector = { rawBody: "{}", suppliedSecret: "private-test-only", expectedSecret: "private-test-only", signature: "GevDbnnfkdqn9LrDU2QzlgY0OG24MXRRyHPP9MAj9C8=" };

describe("autenticação do webhook comercial", () => {
  it("aceita apenas o corpo original com segredo privado e assinatura válidos", () => {
    expect(verifySubscriptionWebhook(vector)).toBe(true);
    expect(verifySubscriptionWebhook({ ...vector, rawBody: "{ }" })).toBe(false);
    expect(verifySubscriptionWebhook({ ...vector, suppliedSecret: "wrong-secret" })).toBe(false);
  });

  it("recusa requisição sem configuração ou assinatura, mesmo com segredo informado", () => {
    expect(verifySubscriptionWebhook({ ...vector, expectedSecret: undefined })).toBe(false);
    expect(verifySubscriptionWebhook({ ...vector, signature: null })).toBe(false);
    expect(verifySubscriptionWebhook({ ...vector, signature: "short" })).toBe(false);
  });
});
