import { describe, expect, it } from "vitest";

import {
  buildMensalidadesListSearchParams,
  parseMensalidadesFiltroQuery,
  parseMensalidadesKindQuery,
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

describe("parseMensalidadesKindQuery", () => {
  it("maps pt-BR tipo tokens", () => {
    expect(parseMensalidadesKindQuery("adulto")).toBe("adult");
    expect(parseMensalidadesKindQuery("kids")).toBe("kids");
    expect(parseMensalidadesKindQuery("todos")).toBe("all");
  });

  it("defaults for missing or unknown", () => {
    expect(parseMensalidadesKindQuery(undefined)).toBe("all");
    expect(parseMensalidadesKindQuery("")).toBe("all");
  });
});

describe("buildMensalidadesListSearchParams", () => {
  it("joins mes, filtro e tipo", () => {
    expect(
      buildMensalidadesListSearchParams({
        mes: "2026-05-01",
        filtro: "pending",
        tipo: "kids",
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
