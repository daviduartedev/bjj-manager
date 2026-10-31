import { describe, expect, it, vi } from "vitest";

import {
  academySignupCallbackUrl,
  submitAcademyRegistration,
} from "./register-academy";

const WAITING =
  "Abra o link de confirmação que enviamos, neste navegador, para concluir a adesão ao Casca.";

const validInput = {
  email: "ana@academia.com",
  password: "luta-longa-no-tatame",
  academyName: "Academia Casca",
  displayName: "Ana Souza",
  modality: "jiu_jitsu",
};

describe("academySignupCallbackUrl", () => {
  it("monta o callback com a URL pública do servidor", () => {
    expect(
      academySignupCallbackUrl({ NEXT_PUBLIC_APP_URL: "https://app.casca.test/" }),
    ).toBe("https://app.casca.test/auth/callback");
  });

  it("usa a base do convite quando a URL pública falta, sem o navegador escolher", () => {
    expect(academySignupCallbackUrl({ NEXT_PUBLIC_APP_URL: "  " })).toBe(
      "http://localhost:3000/auth/callback",
    );
  });
});

describe("submitAcademyRegistration", () => {
  it("preserva o plano escolhido na intencao confiavel de cadastro", async () => {
    const intents: unknown[] = [];
    const result = await submitAcademyRegistration({ ...validInput, subscriptionPlanId: "academia_100" }, {
      appUrl: "https://app.casca.test",
      signUp: vi.fn().mockResolvedValue({ user: { id: "plan-user", identities: [{ id: "identity" }] }, error: null }),
      recordIntent: async intent => { intents.push(intent); return { ok: true }; },
    });

    expect(result.ok).toBe(true);
    expect(intents).toEqual([{
      userId: "plan-user", academyName: "Academia Casca", displayName: "Ana Souza", modality: "jiu_jitsu", subscriptionPlanId: "academia_100",
    }]);
  });

  it("recusa plano desconhecido, plano legado e preco enviado pelo navegador antes de criar conta", async () => {
    const signUp = vi.fn();
    const recordIntent = vi.fn();
    for (const payload of [
      { ...validInput, subscriptionPlanId: "gratuito" },
      { ...validInput, subscriptionPlanId: "essencial" },
      { ...validInput, subscriptionPlanId: "inicial", priceCents: 1 },
    ]) {
      expect((await submitAcademyRegistration(payload, { appUrl: "https://app.casca.test", signUp, recordIntent })).ok).toBe(false);
    }
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("preserva a modalidade explícita na intenção confiável sem colocá-la no metadata do Auth", async () => {
    const signUp = vi.fn().mockResolvedValue({
      user: { id: "jiu-jitsu-user", identities: [{ id: "identity" }] }, error: null,
    });
    const intents: unknown[] = [];
    const result = await submitAcademyRegistration({ ...validInput, modality: "jiu_jitsu" }, {
      appUrl: "https://app.casca.test", signUp,
      recordIntent: async (intent) => { intents.push(intent); return { ok: true }; },
    });
    expect(result).toEqual({ ok: true, message: WAITING });
    expect(intents).toEqual([{
      userId: "jiu-jitsu-user", academyName: "Academia Casca", displayName: "Ana Souza", modality: "jiu_jitsu", subscriptionPlanId: "inicial",
    }]);
    expect(signUp.mock.calls[0]?.[0]).not.toHaveProperty("modality");
  });

  it("recusa e-mail inválido antes de chamar o Supabase", async () => {
    const signUp = vi.fn();
    const recordIntent = vi.fn();

    const result = await submitAcademyRegistration(
      { ...validInput, email: "nao-e-email" },
      { appUrl: "https://app.casca.test", signUp, recordIntent },
    );

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { email: ["Digite um e-mail válido."] },
    });
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("recusa modalidade desconhecida antes de criar um usuário e grava as quatro liberadas", async () => {
    const signUp = vi.fn().mockResolvedValue({
      user: { id: "sport-user", identities: [{ id: "identity" }] }, error: null,
    });
    const recordIntent = vi.fn().mockResolvedValue({ ok: true });
    for (const modality of ["admin", null, "karate"]) {
      const result = await submitAcademyRegistration({ ...validInput, modality }, {
        appUrl: "https://app.casca.test", signUp, recordIntent,
      });
      expect(result.ok).toBe(false);
    }
    expect(signUp).not.toHaveBeenCalled();
    for (const modality of ["jiu_jitsu", "boxing", "judo", "muay_thai"] as const) {
      const intents: unknown[] = [];
      const created = await submitAcademyRegistration({ ...validInput, modality }, {
        appUrl: "https://app.casca.test",
        signUp: vi.fn().mockResolvedValue({ user: { id: modality, identities: [{ id: "identity" }] }, error: null }),
        recordIntent: async (intent) => { intents.push(intent); return { ok: true }; },
      });
      expect(created.ok).toBe(true);
      expect(intents).toEqual([{
        userId: modality, academyName: validInput.academyName, displayName: validInput.displayName, modality, subscriptionPlanId: "inicial",
      }]);
    }
  });

  it("recusa público infantil nas modalidades de adulto antes de criar um usuário", async () => {
    const signUp = vi.fn();
    const result = await submitAcademyRegistration({
      ...validInput,
      modality: "muay_thai",
      onboarding: {
        city: "Campinas", cityId: "3509502", state: "SP", stage: "operating", studentRange: "1-30",
        audiences: ["kids", "adult"], priorities: ["students"],
      },
    }, { appUrl: "https://app.casca.test", signUp, recordIntent: vi.fn() });
    expect(result).toEqual({
      ok: false,
      fieldErrors: { "onboarding.audiences": ["Esta modalidade atende adultos de 18 anos ou mais."] },
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it("envia o perfil descritivo ao cadastro sem alterar a intenção de autorização", async () => {
    const onboarding = {
      city: "  Campinas  ", cityId: "3509502", state: "SP", stage: "operating", studentRange: "31-100",
      audiences: ["kids", "adult"], priorities: ["students", "billing"],
    };
    const signUp = vi.fn().mockResolvedValue({ user: { id: "new-user", identities: [{ id: "identity" }] }, error: null });
    const recordIntent = vi.fn().mockResolvedValue({ ok: true });
    const result = await submitAcademyRegistration({ ...validInput, onboarding }, {
      appUrl: "https://app.casca.test", signUp, recordIntent,
      validateMunicipality: vi.fn().mockResolvedValue(true),
    });
    expect(result.ok).toBe(true);
    expect(signUp).toHaveBeenCalledWith({
      email: validInput.email, password: validInput.password,
      emailRedirectTo: "https://app.casca.test/auth/callback",
      onboarding: { ...onboarding, city: "Campinas" },
    });
    expect(recordIntent).toHaveBeenCalledWith({ userId: "new-user", academyName: validInput.academyName, displayName: validInput.displayName, modality: "jiu_jitsu", subscriptionPlanId: "inicial" });
  });

  it("rejects a city selection that does not exist in the selected state before creating an account", async () => {
    const signUp = vi.fn();
    const recordIntent = vi.fn();
    const result = await submitAcademyRegistration({
      ...validInput,
      onboarding: {
        city: "Campinas", cityId: "3509502", state: "SP", stage: "operating",
        studentRange: "31-100", audiences: ["adult"], priorities: ["students"],
      },
    }, {
      appUrl: "https://app.casca.test",
      signUp,
      recordIntent,
      validateMunicipality: vi.fn().mockResolvedValue(false),
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: { "onboarding.city": ["Selecione uma cidade válida para o estado informado."] },
    });
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

  it("recusa perfil inválido e campos de privilégio antes de chamar o Auth", async () => {
    const onboarding = {
      city: "Campinas", cityId: "3509502", state: "SP", stage: "operating", studentRange: "31-100",
      audiences: ["adult"], priorities: ["billing"],
    };
    const signUp = vi.fn();
    const recordIntent = vi.fn();
    for (const invalid of [
      { ...onboarding, state: "ZZ" },
      { ...onboarding, audiences: [] },
      { ...onboarding, priorities: ["admin"] },
      { ...onboarding, role: "professor" },
    ]) {
      const result = await submitAcademyRegistration({ ...validInput, onboarding: invalid }, {
        appUrl: "https://app.casca.test", signUp, recordIntent,
      });
      expect(result.ok).toBe(false);
    }
    expect(signUp).not.toHaveBeenCalled();
    expect(recordIntent).not.toHaveBeenCalled();
  });

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
      password: "luta-longa-no-tatame",
      emailRedirectTo: "https://app.casca.test/auth/callback",
    });
    expect(createdRecord).toHaveBeenCalledOnce();
    expect(createdRecord).toHaveBeenCalledWith({
      userId: "user-created",
      academyName: "Academia Casca",
      displayName: "Ana Souza",
      modality: "jiu_jitsu",
      subscriptionPlanId: "inicial",
    });
    expect(duplicateRecord).not.toHaveBeenCalled();
    expect(alreadyRegisteredRecord).not.toHaveBeenCalled();
  });

  it("cadastra com a base local do servidor quando a URL pública falta", async () => {
    const signUp = vi.fn().mockResolvedValue({
      user: { id: "user-created", identities: [{ id: "identity-1" }] },
      error: null,
    });
    const recordIntent = vi.fn().mockResolvedValue({ ok: true });

    const result = await submitAcademyRegistration(validInput, {
      appUrl: "   ",
      signUp,
      recordIntent,
    });

    expect(result).toEqual({ ok: true, message: WAITING });
    expect(signUp).toHaveBeenCalledWith({
      email: "ana@academia.com",
      password: "luta-longa-no-tatame",
      emailRedirectTo: "http://localhost:3000/auth/callback",
    });
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

  it("explica o limite de envio sem gravar intenção", async () => {
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
      message: "O envio de confirmações atingiu o limite temporário. Aguarde alguns minutos e tente novamente.",
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
