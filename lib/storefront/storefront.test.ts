import { describe, expect, it } from "vitest";

import {
  allocateSlug,
  canCopyStorefrontLink,
  canPublishStorefront,
  normalizeStorefrontDescription,
  projectStorefrontCatalog,
  resolveStorefrontAccess,
  slugifyAcademyName,
  storefrontListingWarning,
  storefrontPath,
  validateSlugChange,
  type StorefrontProductInput,
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
  it("devolve not_found para um endereço desconhecido, mesmo na prévia", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: false,
        published: true,
        whatsappE164: "5511987654321",
        eligibleProductCount: 3,
        preview: true,
      }),
    ).toBe("not_found");
  });

  it("devolve not_found para uma loja não publicada vista por um visitante anônimo", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: false,
        whatsappE164: "5511987654321",
        eligibleProductCount: 2,
        preview: false,
      }),
    ).toBe("not_found");
  });

  it("devolve not_found quando a loja publicada não tem WhatsApp válido", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: true,
        whatsappE164: null,
        eligibleProductCount: 4,
        preview: false,
      }),
    ).toBe("not_found");
  });

  it("devolve empty para a loja publicada sem produtos elegíveis", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: true,
        whatsappE164: "5511987654321",
        eligibleProductCount: 0,
        preview: false,
      }),
    ).toBe("empty");
  });

  it("devolve catalog para a loja publicada com produtos elegíveis", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: true,
        whatsappE164: "5511987654321",
        eligibleProductCount: 1,
        preview: false,
      }),
    ).toBe("catalog");
  });

  it("devolve empty na prévia sem produtos, mesmo sem publicação nem WhatsApp", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: false,
        whatsappE164: null,
        eligibleProductCount: 0,
        preview: true,
      }),
    ).toBe("empty");
  });

  it("devolve catalog na prévia quando há produtos elegíveis", () => {
    expect(
      resolveStorefrontAccess({
        slugFound: true,
        published: false,
        whatsappE164: null,
        eligibleProductCount: 2,
        preview: true,
      }),
    ).toBe("catalog");
  });
});

describe("canPublishStorefront", () => {
  it("publica 11987654321 como 5511987654321", () => {
    expect(
      canPublishStorefront({
        published: true,
        whatsappRaw: "11987654321",
        currentlyPublished: false,
      }),
    ).toEqual({
      ok: true,
      whatsappE164: "5511987654321",
      published: true,
    });
  });

  it("recusa publicar com abc", () => {
    expect(
      canPublishStorefront({
        published: true,
        whatsappRaw: "abc",
        currentlyPublished: false,
      }),
    ).toEqual({
      ok: false,
      error: "Informe um WhatsApp válido para publicar a loja.",
    });
  });

  it("recusa apagar o WhatsApp enquanto a loja está publicada", () => {
    expect(
      canPublishStorefront({
        published: false,
        whatsappRaw: "",
        currentlyPublished: true,
      }),
    ).toEqual({
      ok: false,
      error: "Despublique a loja antes de apagar o WhatsApp.",
    });
  });

  it("aceita limpar o WhatsApp quando a loja não está publicada", () => {
    expect(
      canPublishStorefront({
        published: false,
        whatsappRaw: "",
        currentlyPublished: false,
      }),
    ).toEqual({
      ok: true,
      whatsappE164: null,
      published: false,
    });
  });

  it("recusa um número que não normaliza mesmo sem publicar", () => {
    expect(
      canPublishStorefront({
        published: false,
        whatsappRaw: "abc",
        currentlyPublished: false,
      }),
    ).toEqual({
      ok: false,
      error: "Informe um WhatsApp válido.",
    });
  });

  it("aceita despublicar mantendo o WhatsApp válido", () => {
    expect(
      canPublishStorefront({
        published: false,
        whatsappRaw: "5511987654321",
        currentlyPublished: true,
      }),
    ).toEqual({
      ok: true,
      whatsappE164: "5511987654321",
      published: false,
    });
  });
});

describe("canCopyStorefrontLink", () => {
  it("fica desligado quando o visitante anônimo receberia not_found", () => {
    expect(canCopyStorefrontLink("not_found")).toBe(false);
  });

  it("liga para a loja vazia que o visitante anônimo abre", () => {
    expect(canCopyStorefrontLink("empty")).toBe(true);
  });

  it("liga para o catálogo que o visitante anônimo abre", () => {
    expect(canCopyStorefrontLink("catalog")).toBe(true);
  });
});

describe("storefrontPath", () => {
  it("monta o caminho público da loja", () => {
    expect(storefrontPath("alianca-centro")).toBe("/loja/alianca-centro");
  });
});

function storefrontProduct(
  overrides: Partial<StorefrontProductInput> & Pick<StorefrontProductInput, "name">,
): StorefrontProductInput {
  return {
    active: true,
    catalogVisible: true,
    description: null,
    audience: "unisex",
    variants: [
      {
        sizeLabel: "A1",
        priceCents: 18990,
        stockQuantity: 2,
        sortOrder: 1,
        line: "unisex",
      },
    ],
    ...overrides,
  };
}

describe("projectStorefrontCatalog", () => {
  it("omite inativos, sem marcação, sem preço e com preço zero", () => {
    const catalog = projectStorefrontCatalog([
      storefrontProduct({ name: "Inativo", active: false }),
      storefrontProduct({ name: "Sem marca", catalogVisible: false }),
      storefrontProduct({
        name: "Sem preço",
        variants: [
          {
            sizeLabel: "A1",
            priceCents: null,
            stockQuantity: 4,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
      storefrontProduct({
        name: "Preço zero",
        variants: [
          {
            sizeLabel: "A1",
            priceCents: 0,
            stockQuantity: 4,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
      storefrontProduct({ name: "Kimono", audience: "masculine", description: "Trama pesada" }),
    ]);

    expect(catalog.products).toEqual([
      {
        name: "Kimono",
        audienceLabel: "Masculino",
        description: "Trama pesada",
        priceLabel: "R$\u00a0189,90",
        initialSizeLabel: "A1",
      },
    ]);
  });

  it("mostra o preço do primeiro tamanho com preço e estoque acima de zero", () => {
    const catalog = projectStorefrontCatalog([
      storefrontProduct({
        name: "Kimono",
        audience: "masculine",
        description: "Trama pesada",
        variants: [
          {
            sizeLabel: "A2",
            priceCents: 19990,
            stockQuantity: 0,
            sortOrder: 2,
            line: "unisex",
          },
          {
            sizeLabel: "A1",
            priceCents: 18990,
            stockQuantity: 2,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
    ]);

    expect(catalog.products).toEqual([
      {
        name: "Kimono",
        audienceLabel: "Masculino",
        description: "Trama pesada",
        priceLabel: "R$\u00a0189,90",
        initialSizeLabel: "A1",
      },
    ]);
  });

  it("desempata pelo nome do tamanho quando a ordem é a mesma", () => {
    const catalog = projectStorefrontCatalog([
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "M",
            priceCents: 10000,
            stockQuantity: 2,
            sortOrder: 1,
            line: "unisex",
          },
          {
            sizeLabel: "A1",
            priceCents: 25000,
            stockQuantity: 2,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
    ]);

    expect(catalog.products[0]?.initialSizeLabel).toBe("A1");
    expect(catalog.products[0]?.priceLabel).toBe("R$\u00a0250,00");
  });

  it("ordena Kimono antes de Rash Guard", () => {
    const catalog = projectStorefrontCatalog([
      storefrontProduct({ name: "Rash Guard", audience: "feminine", description: null }),
      storefrontProduct({ name: "Kimono", audience: "unisex", description: "Azul" }),
    ]);

    expect(catalog.products.map((product) => product.name)).toEqual(["Kimono", "Rash Guard"]);
    expect(catalog.products[0]?.audienceLabel).toBe("Unissex");
    expect(catalog.products[1]?.audienceLabel).toBe("Feminino");
  });

  it("lista o produto esgotado sem preço quando nenhum tamanho precificado tem estoque", () => {
    const catalog = projectStorefrontCatalog([
      storefrontProduct({
        name: "Kimono",
        audience: "unisex",
        description: "   ",
        variants: [
          {
            sizeLabel: "A2",
            priceCents: 19990,
            stockQuantity: 0,
            sortOrder: 2,
            line: "feminine",
          },
          {
            sizeLabel: "A1",
            priceCents: 18990,
            stockQuantity: 0,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
    ]);

    expect(catalog.products).toEqual([
      {
        name: "Kimono",
        audienceLabel: "Unissex",
        description: null,
        priceLabel: null,
        initialSizeLabel: null,
      },
    ]);
  });
});

describe("storefrontListingWarning", () => {
  it("avisa quando a vitrine está ligada e o produto não entra na loja", () => {
    expect(
      storefrontListingWarning(
        storefrontProduct({
          name: "Kimono",
          catalogVisible: true,
          active: false,
        }),
      ),
    ).toBe("Este produto não entra na loja.");

    expect(
      storefrontListingWarning(
        storefrontProduct({
          name: "Kimono",
          catalogVisible: true,
          active: true,
          variants: [
            {
              sizeLabel: "A1",
              priceCents: 0,
              stockQuantity: 3,
              sortOrder: 1,
              line: "unisex",
            },
          ],
        }),
      ),
    ).toBe("Este produto não entra na loja.");
  });

  it("não avisa quando a marcação está desligada ou o produto entra na loja", () => {
    expect(
      storefrontListingWarning(
        storefrontProduct({
          name: "Kimono",
          catalogVisible: false,
          active: false,
          variants: [],
        }),
      ),
    ).toBeNull();

    expect(storefrontListingWarning(storefrontProduct({ name: "Kimono" }))).toBeNull();
  });
});

describe("normalizeStorefrontDescription", () => {
  it("corta espaços e guarda vazio como nulo", () => {
    expect(normalizeStorefrontDescription("  Kimono azul  ")).toEqual({
      ok: true,
      description: "Kimono azul",
    });
    expect(normalizeStorefrontDescription("   ")).toEqual({ ok: true, description: null });
  });

  it("recusa descrição acima de 500 caracteres", () => {
    expect(normalizeStorefrontDescription("a".repeat(500))).toEqual({
      ok: true,
      description: "a".repeat(500),
    });
    expect(normalizeStorefrontDescription(`  ${"a".repeat(501)}  `)).toEqual({
      ok: false,
      error: "A descrição pode ter no máximo 500 caracteres.",
    });
  });
});
