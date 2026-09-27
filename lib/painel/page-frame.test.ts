import { describe, expect, it } from "vitest";

import { PAGE_FRAME_LABEL, pageFrameVariant, resolvePageHeader } from "./page-frame";

describe("pageFrameVariant", () => {
  it("selects Faixa, Mesa, and Ficha from the variant key", () => {
    expect(pageFrameVariant("A")).toBe("A");
    expect(PAGE_FRAME_LABEL[pageFrameVariant("A")]).toBe("Faixa");
    expect(pageFrameVariant("B")).toBe("B");
    expect(PAGE_FRAME_LABEL[pageFrameVariant("B")]).toBe("Mesa");
    expect(pageFrameVariant("C")).toBe("C");
    expect(PAGE_FRAME_LABEL[pageFrameVariant("C")]).toBe("Ficha");
  });

  it("selects Faixa when the key is missing, empty, or unknown", () => {
    expect(pageFrameVariant(null)).toBe("A");
    expect(pageFrameVariant("")).toBe("A");
    expect(pageFrameVariant("D")).toBe("A");
    expect(PAGE_FRAME_LABEL[pageFrameVariant(null)]).toBe("Faixa");
  });
});

describe("resolvePageHeader", () => {
  it("keeps the first primary and the first secondary", () => {
    expect(
      resolvePageHeader({
        primary: [
          { label: "Cadastrar aluno", href: "/alunos/novo" },
          { label: "Exportar lista", href: "/alunos/exportar" },
        ],
        secondary: [
          { label: "Importar", href: "/alunos/importar" },
          { label: "Arquivar", href: "/alunos/arquivar" },
        ],
      }),
    ).toEqual({
      primary: { label: "Cadastrar aluno", href: "/alunos/novo" },
      secondary: { label: "Importar", href: "/alunos/importar" },
    });
  });

  it("keeps one primary when the screen has no secondary", () => {
    expect(
      resolvePageHeader({
        primary: { label: "Novo aluno", href: "/alunos/novo" },
        secondary: null,
      }),
    ).toEqual({
      primary: { label: "Novo aluno", href: "/alunos/novo" },
      secondary: null,
    });
  });

  it("returns no buttons when the screen has no action", () => {
    expect(resolvePageHeader({ primary: null, secondary: undefined })).toEqual({
      primary: null,
      secondary: null,
    });
  });
});
