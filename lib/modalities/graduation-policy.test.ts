import { describe, expect, it } from "vitest";

import { getGraduationPolicy } from "./graduation-policy";

describe("política de graduação por modalidade", () => {
  it("preserva a regra de Jiu-Jitsu ao adaptar a transição de graus existente", () => {
    const policy = getGraduationPolicy("jiu_jitsu");
    if (policy.mode !== "jiu_jitsu") throw new Error("Jiu-Jitsu deve manter seu adaptador");
    const belt = { id: "existing-blue-belt", kind: "adult" as const, slug: "blue", ordinal: 2 };
    expect(policy.validateStep({ belt, degree: 1 }, { belt, degree: 2 }, false, null)).toBeNull();
    expect(policy.validateStep({ belt, degree: 1 }, { belt, degree: 3 }, false, null))
      .toBe("Na mesma faixa só é válido avançar exactamente um grau.");
  });

  it("Boxe não fornece operação de graduação e catálogos referenciados não usam listras de JJ", () => {
    expect(getGraduationPolicy("boxing")).toEqual({ mode: "none", modality: "boxing" });
    expect(getGraduationPolicy("judo")).toMatchObject({
      mode: "referenced", modality: "judo", referenceId: "cbj-2023",
    });
    expect(getGraduationPolicy("muay_thai")).toMatchObject({
      mode: "referenced", modality: "muay_thai", referenceId: "cbmtt-19-khan",
    });
  });
});
