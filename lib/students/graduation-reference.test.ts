import { describe, expect, it } from "vitest";

import {
  meetsGraduationAttentionThreshold,
  resolveBeltStart,
  resolveDegreeStart,
  sortGraduationsDesc,
} from "./graduation-reference";

describe("graduation-reference", () => {
  it("sorts graduations by date descending", () => {
    const g = sortGraduationsDesc([
      {
        resulting_belt_id: "b1",
        resulting_degree: 0,
        graduated_at: "2024-01-10T12:00:00Z",
      },
      {
        resulting_belt_id: "b2",
        resulting_degree: 0,
        graduated_at: "2025-06-01T12:00:00Z",
      },
    ]);
    expect(g[0]?.graduated_at).toContain("2025-06");
  });

  it("resolveDegreeStart picks latest matching belt+degree", () => {
    const grads = [
      {
        resulting_belt_id: "belt-a",
        resulting_degree: 1,
        graduated_at: "2024-01-01T12:00:00Z",
      },
      {
        resulting_belt_id: "belt-a",
        resulting_degree: 2,
        graduated_at: "2025-03-15T12:00:00Z",
      },
    ];
    const r = resolveDegreeStart(grads, "belt-a", 2, "2020-01-01");
    expect(r.approximate).toBe(false);
    expect(r.startYmd).toBe("2025-03-15");
  });

  it("resolveDegreeStart falls back to academy start", () => {
    const r = resolveDegreeStart([], "belt-a", 0, "2021-06-01");
    expect(r.approximate).toBe(true);
    expect(r.startYmd).toBe("2021-06-01");
  });

  it("resolveBeltStart falls back to academy when no matching belt in history", () => {
    const r = resolveBeltStart(
      [
        {
          resulting_belt_id: "other",
          resulting_degree: 0,
          graduated_at: "2023-01-01T12:00:00Z",
        },
      ],
      "belt-x",
      "2022-05-01",
    );
    expect(r.startYmd).toBe("2022-05-01");
    expect(r.approximate).toBe(true);
  });

  it("meetsGraduationAttentionThreshold at 120 days on degree", () => {
    expect(
      meetsGraduationAttentionThreshold("2025-01-01", "2025-01-01", "2025-08-01"),
    ).toBe(true);
  });

  it("meetsGraduationAttentionThreshold at 365 days on belt", () => {
    expect(meetsGraduationAttentionThreshold("2024-01-01", null, "2025-01-05")).toBe(true);
  });

  it("does not alert below thresholds", () => {
    expect(
      meetsGraduationAttentionThreshold("2025-05-01", "2025-05-01", "2025-06-01"),
    ).toBe(false);
  });
});
