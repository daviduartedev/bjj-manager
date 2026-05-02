import { describe, expect, it } from "vitest";

import {
  buildMensalidadesListSearchParams,
  parseMensalidadesFiltroQuery,
  parseMensalidadesPlanQuery,
} from "./mensalidades-filtro-url";

describe("parseMensalidadesFiltroQuery", () => {
  it("maps pt-BR tokens", () => {
    expect(parseMensalidadesFiltroQuery("atrasado")).toBe("overdue");
    expect(parseMensalidadesFiltroQuery("pendente")).toBe("pending");
    expect(parseMensalidadesFiltroQuery("pago")).toBe("paid");
    expect(parseMensalidadesFiltroQuery("bolsista")).toBe("scholarship");
    expect(parseMensalidadesFiltroQuery("outro")).toBe("other");
    expect(parseMensalidadesFiltroQuery("todos")).toBe("all");
  });

  it("is case-insensitive", () => {
    expect(parseMensalidadesFiltroQuery("ATRASADO")).toBe("overdue");
  });

  it("defaults for missing or unknown", () => {
    expect(parseMensalidadesFiltroQuery(undefined)).toBe("all");
    expect(parseMensalidadesFiltroQuery("")).toBe("all");
    expect(parseMensalidadesFiltroQuery("nope")).toBe("all");
  });
});

describe("parseMensalidadesPlanQuery", () => {
  it("maps tipo tokens (plano + legado)", () => {
    expect(parseMensalidadesPlanQuery("adulto")).toBe("adult");
    expect(parseMensalidadesPlanQuery("kids_1")).toBe("kids_1");
    expect(parseMensalidadesPlanQuery("kids1")).toBe("kids_1");
    expect(parseMensalidadesPlanQuery("kids_2")).toBe("kids_2");
    expect(parseMensalidadesPlanQuery("kids")).toBe("kids_either");
    expect(parseMensalidadesPlanQuery("infantil")).toBe("kids_either");
    expect(parseMensalidadesPlanQuery("todos")).toBe("all");
  });

  it("defaults for missing or unknown", () => {
    expect(parseMensalidadesPlanQuery(undefined)).toBe("all");
    expect(parseMensalidadesPlanQuery("")).toBe("all");
  });
});

describe("buildMensalidadesListSearchParams", () => {
  it("joins mes, filtro e tipo", () => {
    expect(
      buildMensalidadesListSearchParams({
        mes: "2026-05-01",
        filtro: "pending",
        tipo: "kids_1",
      }),
    ).toBe("?mes=2026-05-01&filtro=pendente&tipo=kids_1");
    expect(
      buildMensalidadesListSearchParams({
        mes: "2026-05-01",
        filtro: "pending",
        tipo: "kids_either",
      }),
    ).toBe("?mes=2026-05-01&filtro=pendente&tipo=kids");
  });

  it("omits tipo e filtro em modo todos / all", () => {
    expect(
      buildMensalidadesListSearchParams({
        mes: "2026-05-01",
        filtro: "all",
        tipo: "all",
      }),
    ).toBe("?mes=2026-05-01");
  });
});
