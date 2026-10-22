import { describe, expect, it } from "vitest";
import { assessJudoPromotion, assessReferencedPromotion } from "./referenced-promotion";

describe("promoção Muay Thai pela referência CBMTT 19 khan", () => {
  it("distingue cada avanço dourado sem inventar idade ou carência", () => {
    for (const [fromCode, toCode] of [["khan-16", "khan-17"], ["khan-17", "khan-18"], ["khan-18", "khan-19"]]) {
      const result = assessReferencedPromotion({ modality: "muay_thai", fromCode, fromDate: null, toCode, birthDate: "2008-01-01", date: "2026-01-01" });
      expect(result.wasSkip).toBe(false);
      expect(result.exceptions).toEqual([]);
      expect(result.guidance.join(" ")).toContain("não informa edição, idades ou carências");
      expect(result.guidance.join(" ")).toContain("sem exame, SNG, homologação ou certificação CBMTT/IFMA");
    }
  });
  it("identifica salto de khan e mantém orientação CBJ exclusivamente no Judô", () => {
    const input = { fromCode: "khan-15", fromDate: "2026-01-01", toCode: "khan-19", birthDate: "2008-01-01", date: "2026-01-02" };
    const result = assessReferencedPromotion({ ...input, modality: "muay_thai" });
    expect(result.wasSkip).toBe(true);
    expect(result.exceptions).toEqual([]);
    expect(result.guidance.join(" ")).not.toMatch(/CBJ|interstício|idade mínima/);
    expect(assessReferencedPromotion({ ...input, modality: "judo", fromCode: "dan-1", toCode: "dan-2" }).exceptions).toEqual(["Idade abaixo da orientação padrão CBJ.", "Interstício abaixo da orientação padrão CBJ."]);
  });
});

describe("orientação pública de promoção Judô CBJ 2023", () => {
  it("dispensa carência básica adulta e identifica salto como rastreabilidade Casca", () => {
    const result = assessJudoPromotion({ fromCode: "beginner", fromDate: null, toCode: "kyu-8", birthDate: "2000-01-01", date: "2026-10-22" });
    expect(result.wasSkip).toBe(true);
    expect(result.exceptions).toEqual([]);
    expect(result.guidance.join(" ")).toContain("§5");
  });
  it("informa carência indeterminável no primeiro dan sem inferir matrícula", () => {
    const result = assessJudoPromotion({ fromCode: "kyu-1", fromDate: null, toCode: "dan-1", birthDate: "2000-01-01", date: "2026-10-22" });
    expect(result.wasSkip).toBe(false);
    expect(result.exceptions).toEqual([]);
    expect(result.guidance.join(" ")).toContain("Carência indeterminável");
    expect(result.guidance.join(" ")).toContain("tabela 3");
  });
  it("identifica exceções padrão sem impedir registro justificado e usa ano para idade do segundo dan", () => {
    const result = assessJudoPromotion({ fromCode: "dan-1", fromDate: "2026-01-01", toCode: "dan-2", birthDate: "2008-01-01", date: "2026-10-22" });
    expect(result.exceptions).toEqual(["Idade abaixo da orientação padrão CBJ.", "Interstício abaixo da orientação padrão CBJ."]);
    expect(result.guidance.join(" ")).toContain("§§7–9");
    expect(assessJudoPromotion({ fromCode: "dan-1", fromDate: "2020-01-01", toCode: "dan-2", birthDate: "2006-12-31", date: "2026-01-01" }).exceptions).toEqual([]);
  });
  it("aplica a redução documentada do primeiro dan acima de vinte e preserva a orientação intermediária", () => {
    expect(assessJudoPromotion({ fromCode: "kyu-1", fromDate: "2025-01-01", toCode: "dan-1", birthDate: "2000-01-01", date: "2026-01-01" }).exceptions).toEqual([]);
    expect(assessJudoPromotion({ fromCode: "kyu-1", fromDate: "2025-01-01", toCode: "dan-1", birthDate: "2006-01-01", date: "2026-01-01" }).exceptions).toEqual(["Interstício abaixo da orientação padrão CBJ."]);
    const result=assessJudoPromotion({ fromCode: "kyu-5", fromDate: "2026-01-01", toCode: "kyu-4", birthDate: "2000-01-01", date: "2026-10-22" });
    expect(result.exceptions).toEqual(["Interstício abaixo da orientação padrão CBJ."]);
    expect(result.guidance.join(" ")).toContain("tabela 2");
  });
  it("usa a linha básica documentada quando a graduação concedida é anterior aos dezessete anos", () => {
    const result = assessJudoPromotion({ fromCode: "beginner", fromDate: null, toCode: "kyu-11", birthDate: "2000-01-01", date: "2002-01-01" });
    expect(result.exceptions).toEqual(["Idade abaixo da orientação padrão CBJ."]);
    expect(result.guidance.join(" ")).toContain("tabela 1");
    expect(result.guidance.join(" ")).toContain("3 meses");
  });
});
