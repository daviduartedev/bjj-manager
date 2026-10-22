import { describe, expect, it, vi } from "vitest";

import { resendAcademyConfirmation } from "./resend-academy-confirmation";

const GENERIC = "Se houver um cadastro pendente, enviamos outro link de confirmação.";

describe("resendAcademyConfirmation", () => {
  it("responde a mesma frase quando o reenvio funciona, a conta não existe ou o e-mail já foi confirmado", async () => {
    const sent = await resendAcademyConfirmation(
      { email: "ana@academia.com" },
      {
        appUrl: "https://app.casca.test",
        resendSignup: vi.fn().mockResolvedValue(undefined),
      },
    );

    const missing = await resendAcademyConfirmation(
      { email: "outro@academia.com" },
      {
        appUrl: "https://app.casca.test",
        resendSignup: vi.fn().mockRejectedValue(new Error("User not found")),
      },
    );

    const confirmed = await resendAcademyConfirmation(
      { email: "ana@academia.com" },
      {
        appUrl: "https://app.casca.test",
        resendSignup: vi.fn().mockRejectedValue(new Error("Email address already confirmed")),
      },
    );

    expect(sent).toEqual({ ok: true, message: GENERIC });
    expect(missing).toEqual({ ok: true, message: GENERIC });
    expect(confirmed).toEqual({ ok: true, message: GENERIC });
  });

  it("reenvia a confirmação para o callback do servidor e ignora um redirect do navegador", async () => {
    const resendSignup = vi.fn().mockResolvedValue(undefined);

    const result = await resendAcademyConfirmation(
      {
        email: "Ana@Academia.com",
        emailRedirectTo: "https://evil.example/auth/callback",
      },
      { appUrl: "https://app.casca.test/", resendSignup },
    );

    expect(result).toEqual({ ok: true, message: GENERIC });
    expect(resendSignup).toHaveBeenCalledWith({
      type: "signup",
      email: "ana@academia.com",
      emailRedirectTo: "https://app.casca.test/auth/callback",
    });
  });

  it("não chama o reenvio quando o e-mail é inválido", async () => {
    const resendSignup = vi.fn();

    const result = await resendAcademyConfirmation(
      { email: "nao-e-email" },
      { appUrl: "https://app.casca.test", resendSignup },
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { email: ["Digite um e-mail válido."] },
    });
    expect(resendSignup).not.toHaveBeenCalled();
  });
});
