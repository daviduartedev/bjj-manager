import { test as base } from "@playwright/test";

/** Mantido alinhado a `GUIDED_TOUR_COMPLETED_KEY` em `components/onboarding/guided-tour.tsx`. */
const GUIDED_TOUR_COMPLETED_KEY = "casca.guided-tour.completed.v1";

/**
 * Desliga tour guiado para estabilizar E2E (**SECE2E**).
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript((key: string) => {
      window.localStorage.setItem(key, "1");
    }, GUIDED_TOUR_COMPLETED_KEY);
    await use(context);
  },
});

export { expect } from "@playwright/test";
