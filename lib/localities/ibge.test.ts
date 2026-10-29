import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getBrazilianMunicipalities,
  isBrazilianMunicipalitySelectionValid,
} from "./ibge";

describe("IBGE municipalities", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns municipalities for a valid state as selectable IDs and names", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { id: 3509502, nome: "Campinas" },
      { id: 3550308, nome: "São Paulo" },
    ]), { status: 200, headers: { "content-type": "application/json" } }));

    await expect(getBrazilianMunicipalities("SP", fetcher)).resolves.toEqual([
      { id: "3509502", name: "Campinas" },
      { id: "3550308", name: "São Paulo" },
    ]);
    expect(fetcher).toHaveBeenCalledWith(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios",
      expect.any(Object),
    );
  });

  it("does not call IBGE for an invalid state", async () => {
    const fetcher = vi.fn();

    await expect(getBrazilianMunicipalities("ZZ", fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("accepts only a municipality whose ID and name both match the selected state", async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([
      { id: 3509502, nome: "Campinas" },
    ]), { status: 200, headers: { "content-type": "application/json" } })));

    await expect(isBrazilianMunicipalitySelectionValid(
      { state: "SP", cityId: "3509502", city: "Campinas" }, fetcher,
    )).resolves.toBe(true);
    await expect(isBrazilianMunicipalitySelectionValid(
      { state: "SP", cityId: "3509502", city: "Santos" }, fetcher,
    )).resolves.toBe(false);
  });

  it("fails closed when the official municipality service is unavailable", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 503 }));

    await expect(isBrazilianMunicipalitySelectionValid(
      { state: "SP", cityId: "3509502", city: "Campinas" }, fetcher,
    )).rejects.toThrow();
  });

  it("falls back to BrasilAPI when IBGE is unavailable", async () => {
    const fetcher = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("servicodados.ibge.gov.br")) {
        return Promise.resolve(new Response("", { status: 503 }));
      }
      return Promise.resolve(new Response(JSON.stringify([
        { codigo_ibge: "1600303", nome: "Macapá" },
        { codigo_ibge: 1600600, nome: "Santana" },
      ]), { status: 200, headers: { "content-type": "application/json" } }));
    });

    await expect(getBrazilianMunicipalities("AP", fetcher)).resolves.toEqual([
      { id: "1600303", name: "Macapá" },
      { id: "1600600", name: "Santana" },
    ]);
  });
});
