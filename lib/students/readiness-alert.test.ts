import { describe, expect, it } from "vitest";

import { criterionFromAccount, meetsReadinessAlert } from "./readiness-alert";

const confirmedFour = { confirmed: true as const, kidsDegreeMonths: 4 as const };
const unconfirmed = { confirmed: false as const };

describe("meetsReadinessAlert", () => {
  it("kids 4 months alerts on faixa at 16 calendar months", () => {
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "yellow",
        beltKind: "kids",
        studentKind: "kids",
        beltStartYmd: "2024-01-01",
        degreeStartYmd: "2025-02-01",
        todayYmd: "2025-05-01",
      }),
    ).toBe(true);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "yellow",
        beltKind: "kids",
        studentKind: "kids",
        beltStartYmd: "2024-01-01",
        degreeStartYmd: "2025-02-01",
        todayYmd: "2025-04-30",
      }),
    ).toBe(false);
  });

  it("adult blue alerts on faixa at 2 calendar years", () => {
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2022-03-15",
        degreeStartYmd: "2024-02-01",
        todayYmd: "2024-03-15",
      }),
    ).toBe(true);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2022-03-15",
        degreeStartYmd: "2024-02-01",
        todayYmd: "2024-03-14",
      }),
    ).toBe(false);
  });

  it("adult white has no faixa alert and grau at 4 calendar months", () => {
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "white",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2020-01-01",
        degreeStartYmd: "2025-01-01",
        todayYmd: "2025-04-30",
      }),
    ).toBe(false);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "white",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2020-01-01",
        degreeStartYmd: "2025-01-01",
        todayYmd: "2025-05-01",
      }),
    ).toBe(true);
  });

  it("black never enters the alert", () => {
    const longTenure = {
      beltKind: "adult" as const,
      studentKind: "adult" as const,
      beltStartYmd: "2010-01-01",
      degreeStartYmd: "2010-01-01",
      todayYmd: "2026-01-01",
    };
    expect(
      meetsReadinessAlert({
        criterion: unconfirmed,
        beltSlug: "black",
        ...longTenure,
      }),
    ).toBe(false);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "black",
        ...longTenure,
      }),
    ).toBe(false);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "coral",
        ...longTenure,
      }),
    ).toBe(false);
  });

  it("unconfirmed fallback is 4 months on grau or 12 months on faixa", () => {
    expect(
      meetsReadinessAlert({
        criterion: unconfirmed,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2024-01-01",
        degreeStartYmd: "2024-01-01",
        todayYmd: "2024-05-01",
      }),
    ).toBe(true);
    expect(
      meetsReadinessAlert({
        criterion: unconfirmed,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2023-01-01",
        degreeStartYmd: "2023-10-01",
        todayYmd: "2024-01-01",
      }),
    ).toBe(true);
    expect(
      meetsReadinessAlert({
        criterion: unconfirmed,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2024-01-01",
        degreeStartYmd: "2024-01-01",
        todayYmd: "2024-04-30",
      }),
    ).toBe(false);
  });

  it("treats baby on kids belts like kids cadence", () => {
    expect(
      meetsReadinessAlert({
        criterion: { confirmed: true, kidsDegreeMonths: 1 },
        beltSlug: "white_kids",
        beltKind: "kids",
        studentKind: "baby",
        beltStartYmd: "2025-01-01",
        degreeStartYmd: "2025-01-01",
        todayYmd: "2025-02-01",
      }),
    ).toBe(true);
  });

  it("adult blue grau uses a quarter of the 2-year interval in days", () => {
    // 2023-01-01 + 2 years = 2025-01-01 → 731 days (2024 leap); 731/4 = 182.75
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2023-01-01",
        degreeStartYmd: "2023-01-01",
        todayYmd: "2023-07-02",
      }),
    ).toBe(false);
    expect(
      meetsReadinessAlert({
        criterion: confirmedFour,
        beltSlug: "blue",
        beltKind: "adult",
        studentKind: "adult",
        beltStartYmd: "2023-01-01",
        degreeStartYmd: "2023-01-01",
        todayYmd: "2023-07-03",
      }),
    ).toBe(true);
  });
});

describe("criterionFromAccount", () => {
  it("is unconfirmed until confirmed_at is set", () => {
    expect(
      criterionFromAccount({
        readiness_confirmed_at: null,
        readiness_kids_degree_months: 4,
      }),
    ).toEqual({ confirmed: false });
  });

  it("reads kids cadence after confirm", () => {
    expect(
      criterionFromAccount({
        readiness_confirmed_at: "2026-10-03T12:00:00.000Z",
        readiness_kids_degree_months: 3,
      }),
    ).toEqual({ confirmed: true, kidsDegreeMonths: 3 });
  });
});
