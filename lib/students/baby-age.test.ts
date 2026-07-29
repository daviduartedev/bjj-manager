import { describe, expect, it } from "vitest";

import { calculateAge } from "@/lib/dates/age";
import {
  BABY_MAX_AGE_YEARS,
  BABY_MIN_AGE_YEARS,
  isBabyAge,
} from "@/lib/students/baby-age";

describe("baby age rules", () => {
  it("aceita idades entre 4 e 8 anos", () => {
    expect(isBabyAge(4)).toBe(true);
    expect(isBabyAge(8)).toBe(true);
    expect(isBabyAge(6)).toBe(true);
  });

  it("rejeita idades fora da faixa Baby", () => {
    expect(isBabyAge(3)).toBe(false);
    expect(isBabyAge(9)).toBe(false);
    expect(isBabyAge(null)).toBe(false);
  });

  it("constantes cobrem 4–8 anos", () => {
    expect(BABY_MIN_AGE_YEARS).toBe(4);
    expect(BABY_MAX_AGE_YEARS).toBe(8);
  });

  it("calcula idade para nascimento Baby válido", () => {
    const age = calculateAge("2020-01-15", "2026-07-29");
    expect(age).toBe(6);
    expect(isBabyAge(age)).toBe(true);
  });
});
