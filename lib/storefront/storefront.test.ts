import { describe, expect, it } from "vitest";

import {
  allocateSlug,
  canCopyStorefrontLink,
  canPublishStorefront,
  checkStorefrontPhoto,
  filterStorefrontByName,
  normalizeStorefrontDescription,
  projectStorefrontCard,
  projectStorefrontCatalog,
  reorderStorefrontPhotos,
  resolveStorefrontAccess,
  slugifyAcademyName,
  parseStorefrontTheme,
  storefrontCover,
  storefrontListingWarning,
  storefrontPath,
  storefrontThemeDefaults,
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
      error: "Informe um WhatsApp válido para publicar o catálogo de produtos.",
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
      error: "Despublique o catálogo de produtos antes de apagar o WhatsApp.",
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
  it("omite inativos e sem marcação, e lista tamanho sem preço", () => {
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
      {
        name: "Preço zero",
        audienceLabel: "Unissex",
        description: null,
        priceLabel: "A combinar",
        initialSizeLabel: "A1",
      },
      {
        name: "Sem preço",
        audienceLabel: "Unissex",
        description: null,
        priceLabel: "A combinar",
        initialSizeLabel: "A1",
      },
    ]);
  });

  it("mostra o preço do primeiro tamanho com estoque acima de zero", () => {
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

const KIMONO_WHATSAPP_MESSAGE =
  "Olá! Quero 1× Kimono — A1. Valor: R$\u00a0189,90. Vi no catálogo de produtos Aliança Centro: https://app.aslam.com.br/loja/alianca-centro";

const KIMONO_WHATSAPP_HREF =
  "https://wa.me/5511987654321?text=Ol%C3%A1!%20Quero%201%C3%97%20Kimono%20%E2%80%94%20A1.%20Valor%3A%20R%24%C2%A0189%2C90.%20Vi%20no%20cat%C3%A1logo%20de%20produtos%20Alian%C3%A7a%20Centro%3A%20https%3A%2F%2Fapp.aslam.com.br%2Floja%2Falianca-centro";

describe("projectStorefrontCard", () => {
  const ctx = {
    academyName: "Aliança Centro",
    storeUrl: "https://app.aslam.com.br/loja/alianca-centro",
    whatsappE164: "5511987654321",
  };

  it("abre o WhatsApp do primeiro tamanho com estoque, com a frase exata", () => {
    const card = projectStorefrontCard(
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
      ctx,
    );

    expect(card).toEqual({
      name: "Kimono",
      audienceLabel: "Masculino",
      description: "Trama pesada",
      chips: [
        { label: "A1", priceLabel: "R$\u00a0189,90", available: true },
        { label: "A2", priceLabel: "R$\u00a0199,90", available: false },
      ],
      initialChipIndex: 0,
      whatsappHref: KIMONO_WHATSAPP_HREF,
    });
    expect(new URL(card.whatsappHref ?? "").searchParams.get("text")).toBe(KIMONO_WHATSAPP_MESSAGE);
  });

  it("ordena os chips por sortOrder e depois pelo tamanho em pt-BR", () => {
    const card = projectStorefrontCard(
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "M",
            priceCents: 10000,
            stockQuantity: 1,
            sortOrder: 2,
            line: "unisex",
          },
          {
            sizeLabel: "P",
            priceCents: 9000,
            stockQuantity: 1,
            sortOrder: 1,
            line: "unisex",
          },
          {
            sizeLabel: "G",
            priceCents: 11000,
            stockQuantity: 1,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
      ctx,
    );

    expect(card.chips.map((chip) => chip.label)).toEqual(["G", "P", "M"]);
    expect(card.initialChipIndex).toBe(0);
  });

  it("marca Feminino no chip da linha feminina e deixa o unissex só com o tamanho", () => {
    const card = projectStorefrontCard(
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "M",
            priceCents: 12000,
            stockQuantity: 1,
            sortOrder: 2,
            line: "feminine",
          },
          {
            sizeLabel: "P",
            priceCents: 10000,
            stockQuantity: 1,
            sortOrder: 1,
            line: "unisex",
          },
        ],
      }),
      ctx,
    );

    expect(card.chips.map((chip) => chip.label)).toEqual(["P", "M · Feminino"]);
  });

  it("mostra tamanho sem preço como a combinar", () => {
    const card = projectStorefrontCard(
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "A0",
            priceCents: 0,
            stockQuantity: 5,
            sortOrder: 0,
            line: "unisex",
          },
          {
            sizeLabel: "A1",
            priceCents: null,
            stockQuantity: 5,
            sortOrder: 1,
            line: "unisex",
          },
          {
            sizeLabel: "A2",
            priceCents: 15000,
            stockQuantity: 1,
            sortOrder: 2,
            line: "unisex",
          },
        ],
      }),
      ctx,
    );

    expect(card.chips).toEqual([
      { label: "A0", priceLabel: "A combinar", available: true },
      { label: "A1", priceLabel: "A combinar", available: true },
      { label: "A2", priceLabel: "R$\u00a0150,00", available: true },
    ]);
  });

  it("seleciona o primeiro tamanho que sobrou com estoque e mantém o esgotado visível", () => {
    const card = projectStorefrontCard(
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "A1",
            priceCents: 18990,
            stockQuantity: 0,
            sortOrder: 1,
            line: "unisex",
          },
          {
            sizeLabel: "A2",
            priceCents: 19990,
            stockQuantity: 3,
            sortOrder: 2,
            line: "unisex",
          },
        ],
      }),
      ctx,
    );

    expect(card.chips).toEqual([
      { label: "A1", priceLabel: "R$\u00a0189,90", available: false },
      { label: "A2", priceLabel: "R$\u00a0199,90", available: true },
    ]);
    expect(card.initialChipIndex).toBe(1);
    expect(card.whatsappHref).toBe(
      "https://wa.me/5511987654321?text=Ol%C3%A1!%20Quero%201%C3%97%20Kimono%20%E2%80%94%20A2.%20Valor%3A%20R%24%C2%A0199%2C90.%20Vi%20no%20cat%C3%A1logo%20de%20produtos%20Alian%C3%A7a%20Centro%3A%20https%3A%2F%2Fapp.aslam.com.br%2Floja%2Falianca-centro",
    );
  });

  it("não chama no WhatsApp quando o telefone é nulo", () => {
    const card = projectStorefrontCard(storefrontProduct({ name: "Kimono" }), {
      ...ctx,
      whatsappE164: null,
    });

    expect(card.initialChipIndex).toBe(0);
    expect(card.whatsappHref).toBeNull();
  });

  it("não seleciona nem chama quando todos os tamanhos visíveis estão esgotados", () => {
    const card = projectStorefrontCard(
      storefrontProduct({
        name: "Kimono",
        variants: [
          {
            sizeLabel: "A1",
            priceCents: 18990,
            stockQuantity: 0,
            sortOrder: 1,
            line: "unisex",
          },
          {
            sizeLabel: "A2",
            priceCents: 19990,
            stockQuantity: 0,
            sortOrder: 2,
            line: "feminine",
          },
        ],
      }),
      ctx,
    );

    expect(card.chips).toEqual([
      { label: "A1", priceLabel: "R$\u00a0189,90", available: false },
      { label: "A2 · Feminino", priceLabel: "R$\u00a0199,90", available: false },
    ]);
    expect(card.initialChipIndex).toBeNull();
    expect(card.whatsappHref).toBeNull();
  });
});

describe("storefrontListingWarning", () => {
  it("avisa quando o produto está inativo ou sem tamanho", () => {
    expect(
      storefrontListingWarning(
        storefrontProduct({
          name: "Kimono",
          catalogVisible: true,
          active: false,
        }),
      ),
    ).toBe("Ative o produto para ele aparecer no catálogo de produtos.");

    expect(
      storefrontListingWarning(
        storefrontProduct({
          name: "Kimono",
          catalogVisible: true,
          active: true,
          variants: [],
        }),
      ),
    ).toBe("Cadastre um tamanho para ele aparecer no catálogo de produtos.");

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
    ).toBeNull();
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

const FIVE_MB = 5 * 1024 * 1024;

describe("checkStorefrontPhoto", () => {
  it("aceita image/jpeg de 1000 bytes quando ainda não há fotos", () => {
    expect(checkStorefrontPhoto({ size: 1000, type: "image/jpeg" }, 0)).toEqual({
      ok: true,
      ext: "jpg",
    });
  });

  it("aceita image/png", () => {
    expect(checkStorefrontPhoto({ size: 1000, type: "image/png" }, 0)).toEqual({
      ok: true,
      ext: "png",
    });
  });

  it("aceita image/webp", () => {
    expect(checkStorefrontPhoto({ size: 1000, type: "image/webp" }, 0)).toEqual({
      ok: true,
      ext: "webp",
    });
  });

  it("recusa image/gif", () => {
    expect(checkStorefrontPhoto({ size: 1000, type: "image/gif" }, 0)).toEqual({
      ok: false,
      error: "Use JPEG, PNG ou WebP.",
    });
  });

  it("recusa arquivo vazio", () => {
    expect(checkStorefrontPhoto({ size: 0, type: "image/jpeg" }, 0)).toEqual({
      ok: false,
      error: "Arquivo vazio.",
    });
  });

  it("recusa arquivo acima de 5 MB", () => {
    expect(checkStorefrontPhoto({ size: FIVE_MB + 1, type: "image/jpeg" }, 0)).toEqual({
      ok: false,
      error: "A foto pode ter no máximo 5 MB.",
    });
  });

  it("recusa a sétima foto", () => {
    expect(checkStorefrontPhoto({ size: 1000, type: "image/jpeg" }, 6)).toEqual({
      ok: false,
      error: "Cada produto aceita no máximo 6 fotos.",
    });
  });
});

describe("reorderStorefrontPhotos", () => {
  const photos = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("coloca o id pedido na primeira posição, que é a capa", () => {
    expect(reorderStorefrontPhotos(photos, ["c", "a", "b"])).toEqual([
      { id: "c" },
      { id: "a" },
      { id: "b" },
    ]);
  });

  it("devolve a lista original quando algum id é desconhecido", () => {
    expect(reorderStorefrontPhotos(photos, ["c", "missing", "a"])).toEqual(photos);
  });
});

describe("storefrontCover", () => {
  it("devolve as urls das fotos e não usa a logo", () => {
    expect(
      storefrontCover([{ url: "https://foto-1" }, { url: "https://foto-2" }], "https://logo"),
    ).toEqual({
      urls: ["https://foto-1", "https://foto-2"],
      fallback: "none",
    });
  });

  it("usa a logo quando não há fotos", () => {
    expect(storefrontCover([], "https://logo")).toEqual({
      urls: [],
      fallback: "logo",
    });
  });

  it("não inventa imagem quando não há fotos nem logo", () => {
    expect(storefrontCover([], null)).toEqual({
      urls: [],
      fallback: "none",
    });
  });
});

describe("filterStorefrontByName", () => {
  const products = [
    { name: "Kimono", description: "tecido pesado" },
    { name: "Faixa", description: "kimono de competição" },
  ];

  it("mantém Kimono e descarta Faixa quando a busca é kimo", () => {
    expect(filterStorefrontByName(products, "kimo").map((product) => product.name)).toEqual([
      "Kimono",
    ]);
  });

  it("encontra Kimono quando a busca é KÍMONO, dobrando acento dos dois lados", () => {
    expect(filterStorefrontByName([{ name: "Kimono" }], "KÍMONO")).toEqual([{ name: "Kimono" }]);
    expect(filterStorefrontByName([{ name: "Kímono" }], "kimono")).toEqual([{ name: "Kímono" }]);
  });

  it("ignora a descrição quando a busca só aparece nela", () => {
    expect(filterStorefrontByName(products, "kimono de competição")).toEqual([]);
    expect(filterStorefrontByName(products, "tecido pesado")).toEqual([]);
  });

  it("devolve a mesma lista na mesma ordem quando a busca está vazia", () => {
    expect(filterStorefrontByName(products, "")).toEqual(products);
  });

  it("devolve lista vazia quando nada combina", () => {
    expect(filterStorefrontByName(products, "rash")).toEqual([]);
  });
});

describe("parseStorefrontTheme", () => {
  it("devolve o padrão quando a academia ainda não escolheu cores", () => {
    const parsed = parseStorefrontTheme({});
    expect(parsed).toEqual({ ok: true, theme: storefrontThemeDefaults() });
  });

  it("troca só o fundo da página e mantém o restante", () => {
    const parsed = parseStorefrontTheme({ pageBackground: "#112233" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.theme.pageBackground).toBe("#112233");
    expect(parsed.theme.headerBackground).toBe("#ffffff");
  });

  it("recusa cor fora de #RRGGBB", () => {
    expect(parseStorefrontTheme({ accent: "red" })).toEqual({
      ok: false,
      error: "Use cores no formato #RRGGBB.",
    });
  });
});
