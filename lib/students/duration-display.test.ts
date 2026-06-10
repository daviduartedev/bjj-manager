import { describe, expect, it } from "vitest";

import { studentGraduationDurationLine } from "@/lib/students/duration-display";

describe("studentGraduationDurationLine", () => {
  it("conta desde a graduação que estabeleceu o grau actual", () => {
    const line = studentGraduationDurationLine(
      [
        {
          resulting_belt_id: "belt-a",
          resulting_degree: 0,
          graduated_at: "2024-01-01T12:00:00Z",
        },
        {
          resulting_belt_id: "belt-a",
          resulting_degree: 2,
          graduated_at: "2025-03-15T12:00:00Z",
        },
      ],
      "belt-a",
      2,
      "2020-01-01",
      "2026-06-01",
    );
    expect(line).toBeTruthy();
    expect(line).not.toMatch(/aprox\./i);
    expect(line).toMatch(/ano|mês|mes/i);
  });

  it("não usa entrada na academia quando não há graduação correspondente", () => {
    const line = studentGraduationDurationLine(
      [],
      "belt-a",
      0,
      "2021-06-01",
      "2026-06-01",
    );
    expect(line).toBeNull();
  });

  it("coerce grau numérico na comparação com histórico", () => {
    const line = studentGraduationDurationLine(
      [
        {
          resulting_belt_id: "belt-a",
          resulting_degree: 2 as unknown as number,
          graduated_at: "2025-03-15T12:00:00Z",
        },
      ],
      "belt-a",
      2,
      "2020-01-01",
      "2026-06-01",
    );
    expect(line).toBeTruthy();
  });
});
