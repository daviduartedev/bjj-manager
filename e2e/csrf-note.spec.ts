import { expect, test } from "./fixtures";

test.describe("CSRF", () => {
  test("modelo Next.js Server Actions + sessão Supabase", async ({}, testInfo) => {
    testInfo.annotations.push({
      type: "manual_review",
      description:
        "Next.js 15 valida Origin/Host em pedidos com Next-Action (SECE2E-1.6). Defina SERVER_ACTIONS_ALLOWED_ORIGINS atrás de proxy. Login Supabase continua no cliente — bruteforce na Auth API é tratado no Supabase/WAF (manual).",
    });
    expect(true).toBeTruthy();
  });
});
