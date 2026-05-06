import { describe, expect, it } from "vitest";

import {
  isOrangeFamilyKidsBeltSlug,
  pickDefaultPlanForStudentContext,
  pickDefaultPlanForStudentKind,
  planKindMatchesStudentContext,
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

describe("isOrangeFamilyKidsBeltSlug", () => {
  it.each(["orange_white", "orange", "orange_black"])(
    "aceita %s como familia laranja",
    (slug) => {
      expect(isOrangeFamilyKidsBeltSlug(slug)).toBe(true);
    },
  );

  it.each(["white", "yellow", "green", "blue"])(
    "rejeita %s como familia laranja",
    (slug) => {
      expect(isOrangeFamilyKidsBeltSlug(slug)).toBe(false);
    },
  );
});

describe("planKindMatchesStudentContext", () => {
  it("permite adulto no plano Adulto", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "adult",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(true);
  });

  it("bloqueia adulto em Kids 1 e Kids 2", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_1",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(false);
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_2",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(false);
  });

  it("permite kids em Kids 1 e Kids 2", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_1",
        studentKind: "kids",
        beltSlug: "yellow",
      }),
    ).toBe(true);
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_2",
        studentKind: "kids",
        beltSlug: "yellow",
      }),
    ).toBe(true);
  });

  it.each(["orange_white", "orange", "orange_black"])(
    "permite kids %s no Adulto",
    (beltSlug) => {
      expect(
        planKindMatchesStudentContext({
          planKind: "adult",
          studentKind: "kids",
          beltSlug,
        }),
      ).toBe(true);
    },
  );

  it.each(["white", "gray", "yellow", "green"])(
    "bloqueia kids %s no Adulto",
    (beltSlug) => {
      expect(
        planKindMatchesStudentContext({
          planKind: "adult",
          studentKind: "kids",
          beltSlug,
        }),
      ).toBe(false);
    },
  );
});

describe("pickDefaultPlanForStudentContext", () => {
  const plans = [
    { id: "a", kind: "adult" as const },
    { id: "k1", kind: "kids_1" as const },
    { id: "k2", kind: "kids_2" as const },
  ];

  it("kids fora da laranja prefere Kids 1", () => {
    expect(
      pickDefaultPlanForStudentContext(plans, "kids", "yellow")?.kind,
    ).toBe("kids_1");
  });

  it("kids laranja prefere Kids 1", () => {
    expect(
      pickDefaultPlanForStudentContext(plans, "kids", "orange")?.kind,
    ).toBe("kids_1");
  });
});
