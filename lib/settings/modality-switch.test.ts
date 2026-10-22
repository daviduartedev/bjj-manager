import { describe, expect, it } from "vitest";

import { cancelSwitch, modalitySwitchEffects, selectSwitchTarget } from "./modality-switch";

describe("confirmação da troca de modalidade", () => {
  it("cancelar descarta o destino e não aplica a troca", () => {
    expect(selectSwitchTarget("judo")).toEqual({ target: "judo" });
    expect(cancelSwitch()).toEqual({ target: null });
  });

  it.each([
    ["boxing", "só adulto", "Não há faixa"],
    ["judo", "só adulto", "catálogo CBJ"],
    ["muay_thai", "só adulto", "19 khan da CBMTT"],
    ["jiu_jitsu", "Kids e Baby", "faixa e grau"],
  ] as const)("explica os efeitos de %s sem criar aluno nem mensalidade", (target, audience, graduation) => {
    const effects = modalitySwitchEffects("boxing", target).join(" ");
    expect(effects).toContain(audience);
    expect(effects).toContain(graduation);
    expect(effects).toContain("Nomes e preços dos planos comerciais permanecem");
    expect(effects).toContain("Nenhum aluno nem mensalidade é criado");
    expect(effects).toContain("Cancelar mantém a modalidade atual");
  });
});
