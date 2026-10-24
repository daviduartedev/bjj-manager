import { describe, expect, it } from "vitest";

import {
  allocateSlug,
  resolveStorefrontAccess,
  slugifyAcademyName,
  storefrontPath,
  validateSlugChange,
} from "./storefront";

describe("slugifyAcademyName", () => {
  it("deriva alianca-centro de Aliança Centro", () => {
    expect(slugifyAcademyName("Aliança Centro")).toBe("alianca-centro");
  });

  it("corta em 40 e remove o hífen que sobrou no fim", () => {
    expect(slugifyAcademyName("Academia de Jiu-Jitsu da Aliança Centro Norte")).toBe(
      "academia-de-jiu-jitsu-da-alianca-centro",
    );
  });
});

describe("allocateSlug", () => {
  it("acrescenta -2 quando alianca-centro já está ocupado", () => {
    expect(allocateSlug("Aliança Centro", ["alianca-centro"])).toBe("alianca-centro-2");
  });

  it("acrescenta -3 quando a base e o -2 já estão ocupados", () => {
    expect(allocateSlug("Aliança Centro", ["alianca-centro", "alianca-centro-2"])).toBe(
      "alianca-centro-3",
    );
  });

  it("não atribui o endereço reservado loja", () => {
    expect(allocateSlug("Loja", [])).toBe("loja-2");
  });

  it("usa academia quando o nome não gera 3 caracteres", () => {
    expect(allocateSlug("A", [])).toBe("academia");
  });

  it("mantém o sufixo dentro de 40 caracteres", () => {
    expect(allocateSlug("a".repeat(40), ["a".repeat(40)])).toBe(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2",
    );
  });
});

describe("validateSlugChange", () => {
  it("recusa a troca quando o endereço muda e não houve confirmação", () => {
    expect(
      validateSlugChange({
        next: "nova-academia",
        current: "alianca-centro",
        takenByOthers: [],
        confirmed: false,
      }),
    ).toEqual({
      ok: false,
      error: "Confirme a troca do endereço. O endereço anterior deixa de abrir.",
    });
  });

  it("aceita um endereço livre quando a troca foi confirmada", () => {
    expect(
      validateSlugChange({
        next: "nova-academia",
        current: "alianca-centro",
        takenByOthers: [],
        confirmed: true,
      }),
    ).toEqual({ ok: true, slug: "nova-academia" });
  });

  it("aceita salvar o mesmo endereço sem confirmação", () => {
    expect(
      validateSlugChange({
        next: "Aliança Centro",
        current: "alianca-centro",
        takenByOthers: [],
        confirmed: false,
      }),
    ).toEqual({ ok: true, slug: "alianca-centro" });
  });

  it("recusa endereço reservado", () => {
    expect(
      validateSlugChange({
        next: "Loja",
        current: "alianca-centro",
        takenByOthers: [],
        confirmed: true,
      }),
    ).toEqual({ ok: false, error: "Este endereço está reservado." });
  });

  it("recusa endereço já usado por outra academia", () => {
    expect(
      validateSlugChange({
        next: "outra-academia",
        current: "alianca-centro",
        takenByOthers: ["outra-academia"],
        confirmed: true,
      }),
    ).toEqual({ ok: false, error: "Este endereço já está em uso." });
  });

  it("recusa endereço curto demais", () => {
    expect(
      validateSlugChange({
        next: "ab",
        current: "alianca-centro",
        takenByOthers: [],
        confirmed: true,
      }),
    ).toEqual({
      ok: false,
      error: "O endereço precisa ter de 3 a 40 caracteres, só com letras minúsculas, números e hífens.",
    });
  });
});

describe("resolveStorefrontAccess", () => {
  it("devolve not_found para um endereço desconhecido", () => {
    expect(resolveStorefrontAccess({ slugFound: false })).toBe("not_found");
  });

  it("devolve not_found para um endereço encontrado", () => {
    expect(resolveStorefrontAccess({ slugFound: true })).toBe("not_found");
  });
});

describe("storefrontPath", () => {
  it("monta o caminho público da loja", () => {
    expect(storefrontPath("alianca-centro")).toBe("/loja/alianca-centro");
  });
});
