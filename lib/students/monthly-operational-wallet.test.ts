import { describe, expect, it } from "vitest";

import { isStudentInMonthlyOperationalWallet } from "@/lib/students/monthly-operational-wallet";

describe("isStudentInMonthlyOperationalWallet", () => {
  it("aceita apenas active sem arquivo/remoção", () => {
    expect(
      isStudentInMonthlyOperationalWallet({
        status: "active",
        archived_at: null,
        removed_at: null,
      }),
    ).toBe(true);
  });

  it("recusa archived_at", () => {
    expect(
      isStudentInMonthlyOperationalWallet({
        status: "active",
        archived_at: "2026-05-01T00:00:00.000Z",
        removed_at: null,
      }),
    ).toBe(false);
  });

  it("recusa removed_at", () => {
    expect(
      isStudentInMonthlyOperationalWallet({
        status: "active",
        archived_at: null,
        removed_at: "2026-05-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("recusa is_exempt", () => {
    expect(
      isStudentInMonthlyOperationalWallet({
        status: "active",
        is_exempt: true,
        archived_at: null,
        removed_at: null,
      }),
    ).toBe(false);
  });

  it("recusa inactive mesmo sem arquivo/remoção", () => {
    expect(
      isStudentInMonthlyOperationalWallet({
        status: "inactive",
        archived_at: null,
        removed_at: null,
      }),
    ).toBe(false);
  });

  it("recusa entrada nula", () => {
    expect(isStudentInMonthlyOperationalWallet(null)).toBe(false);
  });
});
