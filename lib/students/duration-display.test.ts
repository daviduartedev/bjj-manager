import { describe, expect, it } from "vitest";

import { studentGraduationDurationLine } from "@/lib/students/duration-display";

describe("studentGraduationDurationLine", () => {
  it("mostra só tempo no grau actual, sem tempo na faixa", () => {
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
    expect(line).not.toMatch(/Na faixa/i);
    expect(line).not.toMatch(/No grau:/i);
    expect(line).toMatch(/2025-03|mar|mês|ano/i);
  });

  it("marca aproximado quando usa data de entrada na academia", () => {
    const line = studentGraduationDurationLine(
      [],
      "belt-a",
      0,
      "2021-06-01",
      "2026-06-01",
    );
    expect(line).toMatch(/aprox\./i);
    expect(line).not.toMatch(/Na faixa/i);
  });
});
