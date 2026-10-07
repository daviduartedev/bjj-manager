import { describe, expect, it } from "vitest";

import {
  isPainelBlockVisible,
  PAINEL_BLOCK_IDS,
  parsePainelHiddenBlocks,
} from "./hidden-blocks";

describe("PAINEL_BLOCK_IDS", () => {
  it("lista os oito blocos na ordem do painel", () => {
    expect([...PAINEL_BLOCK_IDS]).toEqual([
      "overdue",
      "active",
      "received",
      "alerts",
      "forecast",
      "attention",
      "belts",
      "classes",
    ]);
  });
});

describe("parsePainelHiddenBlocks", () => {
  it("trata lista vazia, null e undefined como nenhum bloco escondido", () => {
    expect(parsePainelHiddenBlocks([])).toEqual([]);
    expect(parsePainelHiddenBlocks(null)).toEqual([]);
    expect(parsePainelHiddenBlocks(undefined)).toEqual([]);
  });

  it("ignora ids desconhecidos e valores que não são string", () => {
    expect(parsePainelHiddenBlocks(["nope", "forecast", 12, "belts"])).toEqual([
      "forecast",
      "belts",
    ]);
  });

  it("deduplica e devolve ids na ordem canónica", () => {
    expect(
      parsePainelHiddenBlocks(["classes", "overdue", "overdue", "forecast"]),
    ).toEqual(["overdue", "forecast", "classes"]);
  });

  it("trata payload que não é lista como nenhum bloco escondido", () => {
    expect(parsePainelHiddenBlocks("overdue")).toEqual([]);
    expect(parsePainelHiddenBlocks({ overdue: true })).toEqual([]);
  });
});

describe("isPainelBlockVisible", () => {
  it("mostra todos os blocos quando a lista escondida está vazia", () => {
    for (const id of PAINEL_BLOCK_IDS) {
      expect(isPainelBlockVisible([], id)).toBe(true);
    }
  });

  it("esconde só os ids gravados", () => {
    const hidden = parsePainelHiddenBlocks(["overdue", "forecast"]);
    expect(isPainelBlockVisible(hidden, "overdue")).toBe(false);
    expect(isPainelBlockVisible(hidden, "forecast")).toBe(false);
    expect(isPainelBlockVisible(hidden, "active")).toBe(true);
    expect(isPainelBlockVisible(hidden, "classes")).toBe(true);
  });
});
