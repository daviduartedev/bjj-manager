import { describe, expect, it, vi } from "vitest";

import {
  academySignupCallbackUrl,
  submitAcademyRegistration,
} from "./register-academy";

const WAITING =
  "Abra o link de confirmação que enviamos, neste navegador, para entrar no painel.";

const validInput = {
  email: "ana@academia.com",
  password: "senha-segura",
  academyName: "Academia Casca",
  displayName: "Ana Souza",
};

describe("academySignupCallbackUrl", () => {
  it("monta o callback só com APP_URL", () => {
    expect(academySignupCallbackUrl({ APP_URL: "https://app.casca.test/" })).toBe(
      "https://app.casca.test/auth/callback",
    );
  });

  it("não usa o URL público quando APP_URL falta", () => {
    const env = {
      APP_URL: "  ",
      NEXT_PUBLIC_APP_URL: "https://evil.example",
    };
    expect(academySignupCallbackUrl(env)).toBeNull();
  });
});

describe("submitAcademyRegistration", () => {
  it("devolve a mesma frase de espera para cadastro novo e e-mail que já existe, e só grava a intenção do utilizador criado", async () => {
    const createdRecord = vi.fn().mockResolvedValue({ ok: true });
    const createdSignUp = vi.fn().mockResolvedValue({
      user: { id: "user-created", identities: [{ id: "identity-1" }] },
      error: null,
    });

    const created = await submitAcademyRegistration(validInput, {
      appUrl: "https://app.casca.test",
      signUp: createdSignUp,
      recordIntent: createdRecord,
    });

    const duplicateRecord = vi.fn().mockResolvedValue({ ok: true });
    const duplicateSignUp = vi.fn().mockResolvedValue({
      user: { id: "user-existing", identities: [] },
      error: null,
    });
    const duplicate = await submitAcademyRegistration(validInput, {
      appUrl: "https://app.casca.test",
      signUp: duplicateSignUp,
      recordIntent: duplicateRecord,
    });

    const alreadyRegisteredRecord = vi.fn();
    const alreadyRegistered = await submitAcademyRegistration(validInput, {
      appUrl: "https://app.casca.test",
      signUp: vi.fn().mockResolvedValue({
        user: null,
        error: { message: "User already registered", code: "user_already_exists" },
      }),
      recordIntent: alreadyRegisteredRecord,
    });

    expect(created).toEqual({ ok: true, message: WAITING });
    expect(duplicate).toEqual({ ok: true, message: WAITING });
    expect(alreadyRegistered).toEqual({ ok: true, message: WAITING });

    expect(createdSignUp).toHaveBeenCalledWith({
      email: "ana@academia.com",
      password: "senha-segura",
      emailRedirectTo: "https://app.casca.test/auth/callback",
    });
    expect(createdRecord).toHaveBeenCalledOnce();
    expect(createdRecord).toHaveBeenCalledWith({
      userId: "user-created",
      academyName: "Academia Casca",
      displayName: "Ana Souza",
    });
    expect(duplicateRecord).not.toHaveBeenCalled();
    expect(alreadyRegisteredRecord).not.toHaveBeenCalled();
  });

  it("não chama o cadastro quando APP_URL não está definido", async () => {
    const signUp = vi.fn();
    const recordIntent = vi.fn();

    const result = await submitAcademyRegistration(validInput, {
      appUrl: "   ",
      signUp,
      recordIntent,
    });

    expect(result).toEqual({
      ok: false,
      message: "Não foi possível concluir o cadastro. Tente novamente.",
    });
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("não grava intenção quando a senha é curta e não chama o cadastro", async () => {
    const signUp = vi.fn();
    const recordIntent = vi.fn();

    const result = await submitAcademyRegistration(
      { ...validInput, password: "curta" },
      { appUrl: "https://app.casca.test", signUp, recordIntent },
    );

    expect(result.ok).toBe(false);
    if (result.ok || !("fieldErrors" in result)) return;
    expect(result.fieldErrors?.password?.[0]).toBe(
      "A senha precisa ter pelo menos 8 caracteres.",
    );
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("não grava intenção se o registo falha por outro motivo", async () => {
    const recordIntent = vi.fn();
    const result = await submitAcademyRegistration(validInput, {
      appUrl: "https://app.casca.test",
      signUp: vi.fn().mockResolvedValue({
        user: null,
        error: { message: "email rate limit exceeded", code: "over_email_send_rate_limit" },
      }),
      recordIntent,
    });

    expect(result).toEqual({
      ok: false,
      message: "Não foi possível concluir o cadastro. Tente novamente.",
    });
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("não trata falha ao gravar a intenção como e-mail enviado", async () => {
    const result = await submitAcademyRegistration(validInput, {
      appUrl: "https://app.casca.test",
      signUp: vi.fn().mockResolvedValue({
        user: { id: "user-created", identities: [{ id: "identity-1" }] },
        error: null,
      }),
      recordIntent: vi.fn().mockResolvedValue({ ok: false }),
    });

    expect(result).toEqual({
      ok: false,
      message: "Não foi possível concluir o cadastro. Tente novamente.",
    });
  });
});
