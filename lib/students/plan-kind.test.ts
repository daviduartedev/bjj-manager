import { describe, expect, it } from "vitest";

import { planKindMatchesStudentKind } from "@/lib/students/plan-kind";

describe("planKindMatchesStudentKind (STU-4)", () => {
  it("adult só aceita plan_kind adult", () => {
    expect(planKindMatchesStudentKind("adult", "adult")).toBe(true);
    expect(planKindMatchesStudentKind("kids_1", "adult")).toBe(false);
    expect(planKindMatchesStudentKind("kids_2", "adult")).toBe(false);
  });

  it("kids aceita kids_1 e kids_2", () => {
    expect(planKindMatchesStudentKind("kids_1", "kids")).toBe(true);
    expect(planKindMatchesStudentKind("kids_2", "kids")).toBe(true);
    expect(planKindMatchesStudentKind("adult", "kids")).toBe(false);
  });
});
