import { describe, expect, it } from "vitest";
import { getReferencedRanks, findReferencedRank } from "./referenced-ranks";

describe("catálogo CBJ 2023", () => {
  it("oferece iniciante, 11 kyū e 10 dan com identidade e cores da referência", () => {
    const ranks = getReferencedRanks("judo");
    expect(ranks.map(r => [r.code, r.colors.join("/")])).toEqual([
      ["beginner", "white"], ["kyu-11", "white/gray"], ["kyu-10", "gray"],
      ["kyu-9", "gray/blue"], ["kyu-8", "blue"], ["kyu-7", "blue/yellow"],
      ["kyu-6", "yellow"], ["kyu-5", "yellow/orange"], ["kyu-4", "orange"],
      ["kyu-3", "green"], ["kyu-2", "purple"], ["kyu-1", "brown"],
      ["dan-1", "black"], ["dan-2", "black"], ["dan-3", "black"],
      ["dan-4", "black"], ["dan-5", "black"], ["dan-6", "red/white"],
      ["dan-7", "red/white"], ["dan-8", "red/white"], ["dan-9", "red"], ["dan-10", "red"],
    ]);
    expect(ranks.map(r => r.ordinal)).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]);
    expect(findReferencedRank("cbj-2023", "dan-5")?.label).toBe("5º dan — Preta");
    expect(findReferencedRank("cbmtt-19-khan", "dan-5")).toBeNull();
  });
});
