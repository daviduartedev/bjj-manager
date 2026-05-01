import { describe, expect, it } from "vitest";

import { calculateAge } from "./age";
import { formatDateBR, formatRelativeBR } from "./format-br";
import { humanizeDuration } from "./humanize-duration";
import { parseCalendarDate, toCalendarDateStringInAppTZ } from "./parse-calendar-date";
import {
  timeAtCurrentBelt,
  timeSinceJoined,
} from "./duration-domain";

describe("parseCalendarDate", () => {
  it("preserva dia civil em YYYY-MM-DD (sem drift UTC)", () => {
    const z = parseCalendarDate("2000-05-15");
    expect(z).not.toBeNull();
    expect(z!.getFullYear()).toBe(2000);
    expect(z!.getMonth()).toBe(4);
    expect(z!.getDate()).toBe(15);
  });

  it("devolve null para entrada inválida ou vazia", () => {
    expect(parseCalendarDate(null)).toBeNull();
    expect(parseCalendarDate("")).toBeNull();
    expect(parseCalendarDate("not-a-date")).toBeNull();
    expect(parseCalendarDate("2024-13-01")).toBeNull();
  });
});

describe("calculateAge", () => {
  it("conta anos completos no aniversário civil", () => {
    expect(calculateAge("2000-05-15", "2025-05-14")).toBe(24);
    expect(calculateAge("2000-05-15", "2025-05-15")).toBe(25);
  });

  it("devolve null sem data ou data futura", () => {
    expect(calculateAge(null, "2025-01-01")).toBeNull();
    expect(calculateAge("2030-01-01", "2025-01-01")).toBeNull();
  });
});

describe("humanizeDuration", () => {
  it("mesmo dia civil → menos de 1 dia", () => {
    expect(humanizeDuration({ from: "2025-06-01", to: "2025-06-01" })).toBe(
      "menos de 1 dia",
    );
  });

  it("< 7 dias → só dias", () => {
    expect(humanizeDuration({ from: "2025-06-01", to: "2025-06-03" })).toBe(
      "2 dias",
    );
  });

  it("≥ 7 dias e < 1 mês civil → semanas e dias", () => {
    expect(humanizeDuration({ from: "2025-06-01", to: "2025-06-11" })).toBe(
      "1 semana e 3 dias",
    );
  });

  it("≥ 1 mês civil → anos, meses e dias remanescentes", () => {
    expect(humanizeDuration({ from: "2024-01-10", to: "2025-03-15" })).toBe(
      "1 ano e 2 meses e 5 dias",
    );
  });

  it("to antes de from → null", () => {
    expect(humanizeDuration({ from: "2025-06-10", to: "2025-06-01" })).toBeNull();
  });
});

describe("timeSinceJoined", () => {
  it("ausente → null", () => {
    expect(timeSinceJoined(null, "2025-01-01")).toBeNull();
    expect(timeSinceJoined(undefined, "2025-01-01")).toBeNull();
  });
});

describe("timeAtCurrentBelt", () => {
  it("delega em humanizeDuration", () => {
    expect(timeAtCurrentBelt("2025-01-01", "2025-01-08")).toBe("1 semana");
  });
});

describe("formatDateBR", () => {
  it('formato "12 abr 2024"', () => {
    expect(formatDateBR("2024-04-12")).toBe("12 abr 2024");
  });

  it("inválido → null", () => {
    expect(formatDateBR(null)).toBeNull();
  });
});

describe("formatRelativeBR", () => {
  it("mesmo dia → hoje", () => {
    expect(formatRelativeBR("2025-03-01", "2025-03-01")).toBe("hoje");
  });

  it("passado recente (mesmo mês civil)", () => {
    expect(formatRelativeBR("2025-02-21", "2025-02-25")).toBe("há 4 dias");
  });

  it("cruzamento de mês civil pode dar há N meses", () => {
    expect(formatRelativeBR("2025-02-25", "2025-03-01")).toBe("há 1 mês");
  });

  it("futuro → null", () => {
    expect(formatRelativeBR("2026-01-01", "2025-01-01")).toBeNull();
  });
});

describe("toCalendarDateStringInAppTZ", () => {
  it("produz YYYY-MM-DD para instante em SP", () => {
    const d = new Date(Date.UTC(2025, 5, 15, 3, 0, 0));
    const s = toCalendarDateStringInAppTZ(d);
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
