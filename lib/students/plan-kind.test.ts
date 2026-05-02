import { describe, expect, it } from "vitest";

import {
  pickDefaultPlanForStudentKind,
  planKindMatchesStudentKind,
} from "@/lib/students/plan-kind";

describe("planKindMatchesStudentKind (STU-4)", () => {
  it("adult só aceita plan_kind adult", () => {
    expect(planKindMatchesStudentKind("adult", "adult")).toBe(true);
    expect(planKindMatchesStudentKind("kids_1", "adult")).toBe(false);
    expect(planKindMatchesStudentKind("kids_2", "adult")).toBe(false);
  });

  it("kids aceita kids_1, kids_2 e adult (juvenil na mesa de adulto)", () => {
    expect(planKindMatchesStudentKind("kids_1", "kids")).toBe(true);
    expect(planKindMatchesStudentKind("kids_2", "kids")).toBe(true);
    expect(planKindMatchesStudentKind("adult", "kids")).toBe(true);
  });
});

describe("pickDefaultPlanForStudentKind", () => {
  const plans = [
    { id: "a", kind: "adult" as const },
    { id: "k1", kind: "kids_1" as const },
    { id: "k2", kind: "kids_2" as const },
  ];

  it("kids prefere Kids 1", () => {
    expect(pickDefaultPlanForStudentKind(plans, "kids")?.kind).toBe("kids_1");
  });

  it("adult usa Adulto", () => {
    expect(pickDefaultPlanForStudentKind(plans, "adult")?.kind).toBe("adult");
  });
});
