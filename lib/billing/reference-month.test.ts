import { describe, expect, it } from "vitest";

import {
  billingComparisonDateIso,
  compareIsoDateStrings,
  dueDateInReferenceMonth,
  normalizeReferenceMonth,
} from "./reference-month";

describe("normalizeReferenceMonth", () => {
  it("normaliza para o dia 1 do mesmo mês", () => {
    expect(normalizeReferenceMonth("2025-03-15")).toBe("2025-03-01");
    expect(normalizeReferenceMonth("2025-03-01")).toBe("2025-03-01");
  });

  it("devolve null para entrada inválida", () => {
    expect(normalizeReferenceMonth("")).toBeNull();
    expect(normalizeReferenceMonth("not-a-date")).toBeNull();
  });
});

describe("dueDateInReferenceMonth", () => {
  it("usa due_day quando cabe no mês", () => {
    expect(dueDateInReferenceMonth("2025-03-01", 10)).toBe("2025-03-10");
  });

  it("limita ao último dia em meses curtos (BR-2.3)", () => {
    expect(dueDateInReferenceMonth("2025-02-01", 30)).toBe("2025-02-28");
    expect(dueDateInReferenceMonth("2024-02-01", 30)).toBe("2024-02-29");
    expect(dueDateInReferenceMonth("2025-04-01", 31)).toBe("2025-04-30");
  });
});

describe("compareIsoDateStrings", () => {
  it("ordena datas ISO", () => {
    expect(compareIsoDateStrings("2025-01-01", "2025-01-02")).toBe(-1);
    expect(compareIsoDateStrings("2025-01-02", "2025-01-02")).toBe(0);
    expect(compareIsoDateStrings("2025-01-03", "2025-01-02")).toBe(1);
  });
});

describe("billingComparisonDateIso", () => {
  it("usa último dia civil do mês de referência quando esse mês já passou", () => {
    expect(billingComparisonDateIso("2025-01-01", "2025-05-15")).toBe("2025-01-31");
  });

  it("mantém hoje quando o mês de referência é o mês civil actual", () => {
    expect(billingComparisonDateIso("2025-05-01", "2025-05-15")).toBe("2025-05-15");
  });
});
