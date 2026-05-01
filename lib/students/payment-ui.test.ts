import { describe, expect, it } from "vitest";

import {
  dueCalendarDateInMonth,
  isBillingOverdueUi,
} from "./payment-ui";

describe("dueCalendarDateInMonth", () => {
  it("caps due day to month length", () => {
    expect(dueCalendarDateInMonth("2026-02-01", 28)).toBe("2026-02-28");
    expect(dueCalendarDateInMonth("2026-02-01", 31)).toBe("2026-02-28");
  });
});

describe("isBillingOverdueUi", () => {
  it("is false for paid and scholarship", () => {
    expect(
      isBillingOverdueUi({
        referenceMonthFirstDay: "2026-04-01",
        dueDay: 5,
        status: "paid",
        todayYmd: "2026-04-30",
      }),
    ).toBe(false);
    expect(
      isBillingOverdueUi({
        referenceMonthFirstDay: "2026-04-01",
        dueDay: 5,
        status: "scholarship",
        todayYmd: "2026-04-30",
      }),
    ).toBe(false);
  });

  it("is true when past due and status not settled", () => {
    expect(
      isBillingOverdueUi({
        referenceMonthFirstDay: "2026-04-01",
        dueDay: 5,
        status: "pending",
        todayYmd: "2026-04-10",
      }),
    ).toBe(true);
  });
});
