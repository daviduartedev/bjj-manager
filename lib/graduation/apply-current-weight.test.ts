import { describe, expect, it } from "vitest";

import { pickGraduationIdForWeight } from "@/lib/graduation/apply-current-weight";

const BLUE = "11111111-1111-4111-8111-111111111111";
const PURPLE = "22222222-2222-4222-8222-222222222222";

describe("pickGraduationIdForWeight", () => {
  it("usa a graduação do par faixa e grau actual", () => {
    const id = pickGraduationIdForWeight(
      [
        {
          id: "white",
          resulting_belt_id: BLUE,
          resulting_degree: 0,
          graduated_at: "2024-01-01T12:00:00.000Z",
        },
        {
          id: "blue-1",
          resulting_belt_id: BLUE,
          resulting_degree: 1,
          graduated_at: "2025-06-01T12:00:00.000Z",
        },
      ],
      BLUE,
      1,
    );
    expect(id).toBe("blue-1");
  });

  it("actualiza a última graduação quando o par exacto não está no histórico", () => {
    const id = pickGraduationIdForWeight(
      [
        {
          id: "older",
          resulting_belt_id: BLUE,
          resulting_degree: 0,
          graduated_at: "2024-01-01T12:00:00.000Z",
        },
        {
          id: "latest",
          resulting_belt_id: PURPLE,
          resulting_degree: 2,
          graduated_at: "2025-06-01T12:00:00.000Z",
        },
      ],
      BLUE,
      1,
    );
    expect(id).toBe("latest");
  });

  it("aceita uuid com caixa diferente e grau numérico em string", () => {
    const id = pickGraduationIdForWeight(
      [
        {
          id: "blue-1",
          resulting_belt_id: BLUE.toUpperCase(),
          resulting_degree: "1" as unknown as number,
          graduated_at: "2025-06-01T12:00:00.000Z",
        },
      ],
      BLUE,
      1,
    );
    expect(id).toBe("blue-1");
  });

  it("devolve null quando o aluno ainda não tem graduação", () => {
    expect(pickGraduationIdForWeight([], BLUE, 1)).toBeNull();
  });
});
