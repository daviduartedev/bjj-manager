import { describe, expect, it } from "vitest";

import {
  validateStep,
  validateTimeline,
} from "@/lib/graduation/belt-order";
import type { BeltRef } from "@/lib/graduation/types";

const catalog = new Map<string, BeltRef>([
  ["b-white", { id: "b-white", kind: "adult", slug: "white", ordinal: 1 }],
  ["b-blue", { id: "b-blue", kind: "adult", slug: "blue", ordinal: 2 }],
  ["b-purple", { id: "b-purple", kind: "adult", slug: "purple", ordinal: 3 }],
]);

describe("validateStep", () => {
  it("permite +1 grau na mesma faixa", () => {
    const err = validateStep(
      { belt: catalog.get("b-blue")!, degree: 1 },
      { belt: catalog.get("b-blue")!, degree: 2 },
      false,
      null,
    );
    expect(err).toBeNull();
  });

  it("rejeita salto de grau na mesma faixa", () => {
    const err = validateStep(
      { belt: catalog.get("b-blue")!, degree: 1 },
      { belt: catalog.get("b-blue")!, degree: 3 },
      false,
      null,
    );
    expect(err).toMatch(/um grau/i);
  });

  it("exige justificativa em pulo de faixa", () => {
    const err = validateStep(
      { belt: catalog.get("b-white")!, degree: 4 },
      { belt: catalog.get("b-purple")!, degree: 0 },
      false,
      null,
    );
    expect(err).toMatch(/justificativa|pulo/i);
  });
});

describe("validateTimeline", () => {
  it("aceita cadeia válida", () => {
    const err = validateTimeline(
      [
        {
          resulting_belt_id: "b-white",
          resulting_degree: 4,
          graduated_at: "2024-01-01T12:00:00.000Z",
          was_skip: false,
          skip_reason: null,
        },
        {
          resulting_belt_id: "b-blue",
          resulting_degree: 0,
          graduated_at: "2025-06-01T12:00:00.000Z",
          was_skip: false,
          skip_reason: null,
        },
      ],
      catalog,
    );
    expect(err).toBeNull();
  });
});
