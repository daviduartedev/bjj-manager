import { describe, expect, it } from "vitest";

import {
  isBirthdayThisCalendarMonth,
  isBirthdayToday,
  listBirthdaysThisCalendarMonth,
} from "./birthday-utils";

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

describe("listBirthdaysThisCalendarMonth", () => {
  it("lists full name and day/month for October births, omitting missing dates", () => {
    expect(
      listBirthdaysThisCalendarMonth(
        [
          { fullName: "Ana Costa", birthDate: "1990-10-12" },
          { fullName: "Bruno Dias", birthDate: null },
          { fullName: "Carla Lima", birthDate: "2001-03-05" },
          { fullName: "Diego Souza", birthDate: "2012-10-01" },
        ],
        "2026-10-03",
      ),
    ).toEqual([
      { fullName: "Ana Costa", dayMonth: "12/10" },
      { fullName: "Diego Souza", dayMonth: "01/10" },
    ]);
  });

  it("includes isento when they are in the active-student input", () => {
    expect(
      listBirthdaysThisCalendarMonth(
        [{ fullName: "Eva Isento", birthDate: "1988-10-22" }],
        "2026-10-15",
      ),
    ).toEqual([{ fullName: "Eva Isento", dayMonth: "22/10" }]);
  });
});
