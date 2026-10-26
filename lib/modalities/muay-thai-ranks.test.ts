import { describe, expect, it } from "vitest";
import { findReferencedRank, getReferencedRanks } from "./referenced-ranks";

describe("catálogo CBMTT de 19 khan", () => {
  it("preserva números, cores e títulos publicados inclusive as quatro honrarias douradas", () => {
    const ranks = getReferencedRanks("muay_thai");
    expect(ranks.map(rank => [rank.code, rank.colors.join("/"), rank.label])).toEqual([
      ["khan-1", "white", "1º khan — Branco (iniciante)"],
      ["khan-2", "yellow", "2º khan — Amarelo"],
      ["khan-3", "yellow/white", "3º khan — Amarelo e branco"],
      ["khan-4", "green", "4º khan — Verde"],
      ["khan-5", "green/white", "5º khan — Verde e branco"],
      ["khan-6", "blue", "6º khan — Azul"],
      ["khan-7", "blue/white", "7º khan — Azul e branco"],
      ["khan-8", "brown", "8º khan — Marrom"],
      ["khan-9", "brown/white", "9º khan — Marrom e branco"],
      ["khan-10", "red", "10º khan — Vermelho"],
      ["khan-11", "red/white", "11º khan — Vermelho e branco — Instrutor / Kru Fueng Sorn"],
      ["khan-12", "red/yellow", "12º khan — Vermelho e amarelo — Professor / Kru"],
      ["khan-13", "red/silver", "13º khan — Vermelho e prata — Mestrando / Kru Yai"],
      ["khan-14", "silver", "14º khan — Prata — Mestre / Arjarn"],
      ["khan-15", "silver/gold", "15º khan — Prata e dourado — Grão Mestre / Arjarn Yai"],
      ["khan-16", "gold", "16º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)"],
      ["khan-17", "gold", "17º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)"],
      ["khan-18", "gold", "18º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)"],
      ["khan-19", "gold", "19º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)"],
    ]);
    expect(ranks.map(rank => rank.ordinal)).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]);
    expect(findReferencedRank("cbmtt-19-khan", "khan-19")?.modality).toBe("muay_thai");
    expect(findReferencedRank("cbj-2023", "khan-19")).toBeNull();
    expect(findReferencedRank("cbmtt-19-khan", "khan-20")).toBeNull();
  });
});
