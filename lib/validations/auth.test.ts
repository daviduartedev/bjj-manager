import { describe, expect, it } from "vitest";

import { loginSchema } from "./auth";

describe("loginSchema", () => {
  it("normaliza e-mail válido antes de autenticar", () => {
    expect(
      loginSchema.parse({ email: "  Ana@Academia.com  ", password: "senha" }),
    ).toEqual({ email: "ana@academia.com", password: "senha" });
  });

  it("rejeita e-mail com formato inválido", () => {
    expect(loginSchema.safeParse({ email: "ana-at-academia", password: "senha" }).success).toBe(false);
  });
});
