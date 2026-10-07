import { describe, expect, it } from "vitest";

import {
  academyStartStored,
  whiteBeltEntryYearError,
} from "@/lib/students/academy-start";

describe("academyStartStored", () => {
  it("grava o ano de entrada da faixa branca como 1 de janeiro desse ano", () => {
    expect(academyStartStored(true, "2024", "2024-06-15")).toBe("2024-01-01");
  });

  it("mantém a data de entrada completa quando a faixa não é branca", () => {
    expect(academyStartStored(false, "2024", "2024-06-15")).toBe("2024-06-15");
  });
});

describe("whiteBeltEntryYearError", () => {
  it("rejeita ano posterior ao ano civil actual", () => {
    expect(whiteBeltEntryYearError("2027", "2026-10-03")).toBe(
      "O ano de entrada não pode ser no futuro.",
    );
  });

  it("rejeita ano inválido", () => {
    expect(whiteBeltEntryYearError("20", "2026-10-03")).toBe(
      "Informe o ano de entrada.",
    );
    expect(whiteBeltEntryYearError("abcd", "2026-10-03")).toBe(
      "Informe o ano de entrada.",
    );
  });

  it("aceita o ano civil actual", () => {
    expect(whiteBeltEntryYearError("2026", "2026-10-03")).toBeNull();
  });
});
