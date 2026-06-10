import { describe, expect, it } from "vitest";

import {
  beltAssetPath,
  clampDegreeForBeltAsset,
} from "@/lib/graduation/belt-asset";

describe("beltAssetPath", () => {
  it("mapeia slug kids com underscore para hífen no ficheiro", () => {
    expect(beltAssetPath("gray_white", "kids", 2)).toBe(
      "/belts/kids-gray-white_degree_2.png",
    );
  });

  it("diferencia adulto e kids com slug white", () => {
    expect(beltAssetPath("white", "adult", 0)).toBe(
      "/belts/adult-white_degree_0.png",
    );
    expect(beltAssetPath("white", "kids", 3)).toBe(
      "/belts/kids-white_degree_3.png",
    );
  });

  it("limita preta a 6 graus", () => {
    expect(clampDegreeForBeltAsset("black", "adult", 9)).toBe(6);
    expect(beltAssetPath("black", "adult", 9)).toBe(
      "/belts/adult-black_degree_6.png",
    );
  });
});
