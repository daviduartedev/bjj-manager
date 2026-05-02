import { test, expect } from "./fixtures";

test.describe("rate limiting @exploratory", () => {
  test("placeholder — sem middleware de rate limit na app", async ({}, testInfo) => {
    testInfo.annotations.push({
      type: "exploratory",
      description:
        "Middleware limita Server Actions (SECE2E-1.7). Limitação global/distribuída (Redis, CDN) e endpoint Auth Supabase — avaliar separadamente.",
    });
    expect(true).toBeTruthy();
  });
});
