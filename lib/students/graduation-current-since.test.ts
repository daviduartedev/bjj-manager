import { describe, expect, it } from "vitest";

import {
  calendarDateWhenCurrentBeltDegreeEstablished,
  currentBeltDegreeGraduationMeta,
} from "./graduation-current-since";

describe("calendarDateWhenCurrentBeltDegreeEstablished", () => {
  it("returns last chronological date where resulting pair matches current", () => {
    const belt = "b1";
    const day = calendarDateWhenCurrentBeltDegreeEstablished(
      [
        {
          resulting_belt_id: belt,
          resulting_degree: 0,
          graduated_at: "2024-01-10T12:00:00.000Z",
        },
        {
          resulting_belt_id: belt,
          resulting_degree: 1,
          graduated_at: "2024-06-15T12:00:00.000Z",
        },
        {
          resulting_belt_id: belt,
          resulting_degree: 2,
          graduated_at: "2025-03-01T12:00:00.000Z",
        },
      ],
      belt,
      2,
    );
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(day).toBeTruthy();
  });

  it("returns null when no graduation matches current pair", () => {
    expect(
      calendarDateWhenCurrentBeltDegreeEstablished(
        [
          {
            resulting_belt_id: "x",
            resulting_degree: 0,
            graduated_at: "2024-01-01T12:00:00.000Z",
          },
        ],
        "y",
        1,
      ),
    ).toBeNull();
  });

  it("currentBeltDegreeGraduationMeta inclui peso do evento", () => {
    const meta = currentBeltDegreeGraduationMeta(
      [
        {
          id: "grad-1",
          resulting_belt_id: "belt",
          resulting_degree: 1,
          graduated_at: "2025-03-15T12:00:00.000Z",
          weight_kg: 72.5,
        },
      ],
      "belt",
      1,
    );
    expect(meta?.configuredAtYmd).toBeTruthy();
    expect(meta?.weightKg).toBe(72.5);
    expect(meta?.graduationId).toBe("grad-1");
  });
});
