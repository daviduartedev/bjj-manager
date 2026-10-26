import { describe, expect, it } from "vitest";

import {
  pieSlices,
  sumMonthlyRevenueForecast,
  type RevenueForecastStudent,
} from "./revenue-forecast";

function student(
  overrides: Partial<RevenueForecastStudent> & {
    openPlan?: RevenueForecastStudent["openPlan"];
  } = {},
): RevenueForecastStudent {
  return {
    status: "active",
    is_exempt: false,
    archived_at: null,
    removed_at: null,
    openPlan: { customPriceCents: null, planPriceCents: 15_000 },
    monthPaymentStatus: null,
    ...overrides,
  };
}

describe("pieSlices", () => {
  it("fica vazio quando não há previsão", () => {
    expect(pieSlices(0, 50_000)).toEqual({
      kind: "empty",
      pct: 0,
      remaining: 0,
      over: false,
    });
  });

  it("fica vazio quando a previsão é negativa", () => {
    expect(pieSlices(-1, 0)).toEqual({
      kind: "empty",
      pct: 0,
      remaining: 0,
      over: false,
    });
  });

  it("parte recebido e a receber com percentagem arredondada", () => {
    expect(pieSlices(480_000, 312_000)).toEqual({
      kind: "split",
      pct: 65,
      remaining: 168_000,
      over: false,
    });
  });

  it("mostra 0% quando ainda não houve recebido", () => {
    expect(pieSlices(20_000, 0)).toEqual({
      kind: "split",
      pct: 0,
      remaining: 20_000,
      over: false,
    });
  });

  it("preenche o círculo quando o recebido iguala a previsão", () => {
    expect(pieSlices(10_000, 10_000)).toEqual({
      kind: "full",
      pct: 100,
      remaining: 0,
      over: false,
    });
  });

  it("marca acima da previsão quando o recebido passa o círculo", () => {
    expect(pieSlices(10_000, 12_000)).toEqual({
      kind: "full",
      pct: 100,
      remaining: 0,
      over: true,
    });
  });
});

describe("sumMonthlyRevenueForecast", () => {
  it("é 0 sem alunos", () => {
    expect(sumMonthlyRevenueForecast([])).toBe(0);
  });

  it("usa o preço do plano quando não há personalizado", () => {
    expect(sumMonthlyRevenueForecast([student({ openPlan: { customPriceCents: null, planPriceCents: 12_000 } })])).toBe(
      12_000,
    );
  });

  it("usa o preço personalizado quando existe", () => {
    expect(
      sumMonthlyRevenueForecast([
        student({ openPlan: { customPriceCents: 8_000, planPriceCents: 15_000 } }),
      ]),
    ).toBe(8_000);
  });

  it("soma só a carteira operacional com vínculo aberto, fora isento e bolsista", () => {
    expect(
      sumMonthlyRevenueForecast([
        student({ openPlan: { customPriceCents: null, planPriceCents: 10_000 } }),
        student({ openPlan: { customPriceCents: 25_000, planPriceCents: 10_000 } }),
        student({ monthPaymentStatus: "paid", openPlan: { customPriceCents: null, planPriceCents: 5_000 } }),
        student({ is_exempt: true, openPlan: { customPriceCents: null, planPriceCents: 99_999 } }),
        student({
          monthPaymentStatus: "scholarship",
          openPlan: { customPriceCents: null, planPriceCents: 88_888 },
        }),
        student({ status: "inactive", openPlan: { customPriceCents: null, planPriceCents: 77_777 } }),
        student({ status: "paused", openPlan: { customPriceCents: null, planPriceCents: 66_666 } }),
        student({ status: "trial", openPlan: { customPriceCents: null, planPriceCents: 55_555 } }),
        student({
          archived_at: "2026-01-01T00:00:00.000Z",
          openPlan: { customPriceCents: null, planPriceCents: 44_444 },
        }),
        student({
          removed_at: "2026-01-01T00:00:00.000Z",
          openPlan: { customPriceCents: null, planPriceCents: 33_333 },
        }),
        student({ openPlan: null }),
      ]),
    ).toBe(40_000);
  });
});
