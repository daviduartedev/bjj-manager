import { describe, expect, it } from "vitest";

import { academyOnboardingSchema, academyRegistrationSchema, registrationAudienceIssue } from "./academy-registration";

const valid = {
  email: "ana@academia.com",
  password: "luta-longa-no-tatame",
  academyName: "Academia Casca",
  displayName: "Ana Souza",
  modality: "jiu_jitsu",
};

describe("academyRegistrationSchema", () => {
  it("aceita frase-senha longa sem exigir combinação artificial de caracteres", () => {
    const parsed = academyRegistrationSchema.safeParse({
      email: "  Ana@Academia.com ",
      password: "frase-senha-com-mais-de-quinze",
      academyName: "  Casca  ",
      displayName: "  Ana  ",
      modality: "jiu_jitsu",
      subscriptionPlanId: "essencial",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).toEqual({
      email: "ana@academia.com",
      password: "frase-senha-com-mais-de-quinze",
      academyName: "Casca",
      displayName: "Ana",
      modality: "jiu_jitsu",
      subscriptionPlanId: "essencial",
    });
  });

  it("recusa e-mail inválido", () => {
    const parsed = academyRegistrationSchema.safeParse({
      ...valid,
      email: "nao-e-email",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.flatten().fieldErrors.email?.[0]).toBe("Digite um e-mail válido.");
  });

  it("recusa senha com menos de 15 caracteres", () => {
    const parsed = academyRegistrationSchema.safeParse({
      ...valid,
      password: "curta-14-chars",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.flatten().fieldErrors.password?.[0]).toBe(
      "A senha precisa ter pelo menos 15 caracteres.",
    );
  });

  it("aceita 15 caracteres sem exigir classes artificiais e suporta Unicode dentro do limite do Auth", () => {
    expect(academyRegistrationSchema.safeParse({
      ...valid,
      password: "a".repeat(15),
    }).success).toBe(true);
    expect(academyRegistrationSchema.safeParse({
      ...valid,
      password: "😀".repeat(15),
    }).success).toBe(true);
  });

  it("rejeita senhas que excedem o limite de bytes do Supabase Auth", () => {
    const parsed = academyRegistrationSchema.safeParse({
      ...valid,
      password: "😀".repeat(19),
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.flatten().fieldErrors.password?.[0]).toBe(
      "A senha excede o limite aceito pelo provedor de autenticação.",
    );
  });

  it("recusa nome da academia e nome da pessoa fora de 2 a 80 caracteres", () => {
    const tooShort = academyRegistrationSchema.safeParse({
      ...valid,
      academyName: " A ",
      displayName: " ",
    });
    const tooLong = academyRegistrationSchema.safeParse({
      ...valid,
      academyName: "A".repeat(81),
      displayName: "B".repeat(81),
    });

    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
    if (tooShort.success || tooLong.success) return;
    expect(tooShort.error.flatten().fieldErrors.academyName?.[0]).toBe(
      "O nome da academia precisa ter entre 2 e 80 caracteres.",
    );
    expect(tooShort.error.flatten().fieldErrors.displayName?.[0]).toBe(
      "O seu nome precisa ter entre 2 e 80 caracteres.",
    );
    expect(tooLong.error.flatten().fieldErrors.academyName?.[0]).toBe(
      "O nome da academia precisa ter entre 2 e 80 caracteres.",
    );
  });

  it("aceita nomes com exatamente 2 e 80 caracteres", () => {
    const parsed = academyRegistrationSchema.safeParse({
      ...valid,
      academyName: "Ab",
      displayName: "C".repeat(80),
    });

    expect(parsed.success).toBe(true);
  });

  it("exige uma das quatro modalidades e recusa público infantil fora do Jiu-Jitsu", () => {
    expect(academyRegistrationSchema.safeParse(valid).success).toBe(true);
    for (const modality of ["boxing", "judo", "muay_thai"] as const) {
      expect(academyRegistrationSchema.safeParse({ ...valid, modality }).success).toBe(true);
    }
    expect(academyRegistrationSchema.safeParse({ ...valid, modality: undefined }).success).toBe(false);
    expect(academyRegistrationSchema.safeParse({ ...valid, modality: "karate" }).success).toBe(false);
    const onboarding = {
      city: "Campinas", cityId: "3509502", state: "SP", stage: "operating", studentRange: "1-30",
      audiences: ["kids"], priorities: ["students"],
    };
    expect(academyRegistrationSchema.safeParse({ ...valid, modality: "jiu_jitsu", onboarding }).success).toBe(true);
    const boxing = academyRegistrationSchema.safeParse({ ...valid, modality: "boxing", onboarding });
    expect(boxing.success).toBe(true);
    if (!boxing.success) return;
    expect(registrationAudienceIssue(boxing.data)).toBe("Esta modalidade atende adultos de 18 anos ou mais.");
    expect(registrationAudienceIssue({ ...boxing.data, onboarding: { ...onboarding, audiences: ["adult"] } })).toBeNull();
  });

  it("recusa papel, user id e redirect vindos do cliente", () => {
    expect(
      academyRegistrationSchema.safeParse({
        ...valid,
        role: "professor",
      }).success,
    ).toBe(false);
    expect(
      academyRegistrationSchema.safeParse({
        ...valid,
        user_id: "6f1e0c3a-9b7d-4e2a-8c11-0a9b8c7d6e5f",
      }).success,
    ).toBe(false);
    expect(
      academyRegistrationSchema.safeParse({
        ...valid,
        emailRedirectTo: "https://evil.example/auth/callback",
      }).success,
    ).toBe(false);
  });
});

describe("academyOnboardingSchema", () => {
  const validOnboarding = {
    city: "Campinas",
    cityId: "3509502",
    state: "SP",
    stage: "operating",
    studentRange: "31-100",
    audiences: ["adult"],
    priorities: ["students"],
  };

  it("rejects a municipality code from a different state", () => {
    const parsed = academyOnboardingSchema.safeParse({ ...validOnboarding, state: "RJ" });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.message).toBe("A cidade selecionada não pertence ao estado informado.");
  });
});
