import { describe, expect, it } from "vitest";

import { calculateAge } from "@/lib/dates/age";
import {
  BABY_MAX_AGE_YEARS,
  BABY_MIN_AGE_YEARS,
  isBabyAge,
} from "@/lib/students/baby-age";

describe("baby age rules", () => {
  it("aceita idades entre 3 e 5 anos", () => {
    expect(isBabyAge(3)).toBe(true);
    expect(isBabyAge(5)).toBe(true);
    expect(isBabyAge(4)).toBe(true);
  });

  it("rejeita idades fora da faixa Baby", () => {
    expect(isBabyAge(2)).toBe(false);
    expect(isBabyAge(6)).toBe(false);
    expect(isBabyAge(null)).toBe(false);
  });

  it("constantes cobrem 3–5 anos", () => {
    expect(BABY_MIN_AGE_YEARS).toBe(3);
    expect(BABY_MAX_AGE_YEARS).toBe(5);
  });

  it("calcula idade para nascimento Baby válido", () => {
    const age = calculateAge("2022-06-01", "2026-07-29");
    expect(age).toBe(4);
    expect(isBabyAge(age)).toBe(true);
  });
});
