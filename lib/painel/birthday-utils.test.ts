import { describe, expect, it } from "vitest";

import { isBirthdayThisCalendarMonth, isBirthdayToday } from "./birthday-utils";

describe("birthday-utils", () => {
  it("detects birthday today", () => {
    expect(isBirthdayToday("1990-05-01", "2026-05-01")).toBe(true);
    expect(isBirthdayToday("1990-05-01", "2026-05-02")).toBe(false);
  });

  it("detects birthday in month", () => {
    expect(isBirthdayThisCalendarMonth("2000-03-15", "2026-03-01")).toBe(true);
    expect(isBirthdayThisCalendarMonth("2000-03-15", "2026-04-01")).toBe(false);
  });

  it("handles null birth", () => {
    expect(isBirthdayToday(null, "2026-05-01")).toBe(false);
    expect(isBirthdayThisCalendarMonth(undefined, "2026-05-01")).toBe(false);
  });
});
