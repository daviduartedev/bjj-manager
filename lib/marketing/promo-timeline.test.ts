import { describe, expect, it } from "vitest";

import {
  APP_SCRIPTS,
  CAMERA_PATH,
  CLICK_FRAMES,
  CURSOR_PATH,
} from "@/components/marketing/promo/scripts";
import {
  PROMO_DURATION,
  SCENE_FRAMES,
  SCENE_ORDER,
  WIN,
  brl,
  cameraAt,
  cursorAt,
  sceneAt,
  sceneStart,
  typed,
} from "@/components/marketing/promo/timeline";

describe("promo timeline: cenas", () => {
  it("a duração total é a soma das cenas e cada frame pertence a exatamente uma cena", () => {
    const sum = SCENE_ORDER.reduce((n, id) => n + SCENE_FRAMES[id], 0);
    expect(PROMO_DURATION).toBe(sum);

    for (const id of SCENE_ORDER) {
      expect(sceneAt(sceneStart(id))).toBe(id);
      expect(sceneAt(sceneStart(id) + SCENE_FRAMES[id] - 1)).toBe(id);
    }
    expect(sceneAt(PROMO_DURATION - 1)).toBe("outro");
  });
});

describe("promo timeline: roteiros", () => {
  it.each(APP_SCRIPTS.map((s) => [s.id, s] as const))(
    "%s: cursor e câmera cobrem a cena inteira, com frames crescentes",
    (id, script) => {
      const length = SCENE_FRAMES[id];
      expect(script.cursor[0].f).toBe(0);
      expect(script.cursor[script.cursor.length - 1].f).toBe(length);
      expect(script.camera[0].f).toBe(0);
      expect(script.camera[script.camera.length - 1].f).toBe(length);

      for (const track of [script.cursor, script.camera]) {
        for (let i = 1; i < track.length; i += 1) {
          expect(track[i].f, `${id}: keyframe ${i} deve vir depois do anterior`).toBeGreaterThan(
            track[i - 1].f,
          );
        }
      }
    },
  );

  it.each(APP_SCRIPTS.map((s) => [s.id, s] as const))(
    "%s: todo clique acontece com o cursor parado sobre o alvo e dentro da janela",
    (_id, script) => {
      for (const click of script.clicks) {
        const before = cursorAt(script.cursor, click - 3);
        const at = cursorAt(script.cursor, click);
        const after = cursorAt(script.cursor, click + 3);
        expect(Math.hypot(at.x - before.x, at.y - before.y)).toBeLessThan(1);
        expect(Math.hypot(at.x - after.x, at.y - after.y)).toBeLessThan(1);
        expect(at.x).toBeGreaterThan(0);
        expect(at.x).toBeLessThan(WIN.w);
        expect(at.y).toBeGreaterThan(0);
        expect(at.y).toBeLessThan(WIN.h);
      }
    },
  );

  it("cliques não se sobrepõem e câmera nunca passa de 1.6x", () => {
    const sorted = [...CLICK_FRAMES].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i] - sorted[i - 1]).toBeGreaterThan(12);
    }
    for (const key of CAMERA_PATH) {
      expect(key.s).toBeGreaterThanOrEqual(1);
      expect(key.s).toBeLessThanOrEqual(1.6);
    }
  });

  it("os caminhos globais são estritamente crescentes (sem frame duplicado na junção)", () => {
    for (const track of [CURSOR_PATH, CAMERA_PATH]) {
      for (let i = 1; i < track.length; i += 1) {
        expect(track[i].f).toBeGreaterThan(track[i - 1].f);
      }
    }
    expect(CAMERA_PATH[CAMERA_PATH.length - 1].f).toBe(PROMO_DURATION);
  });
});

describe("promo timeline: primitivas", () => {
  const path = [
    { f: 10, x: 100, y: 100 },
    { f: 40, x: 500, y: 300 },
    { f: 60, x: 500, y: 300 },
  ];

  it("cursorAt passa exatamente pelos keyframes e fica clampado nas pontas", () => {
    expect(cursorAt(path, 0)).toEqual({ x: 100, y: 100 });
    expect(cursorAt(path, 10)).toEqual({ x: 100, y: 100 });
    const arrived = cursorAt(path, 40);
    expect(arrived.x).toBeCloseTo(500, 5);
    expect(arrived.y).toBeCloseTo(300, 5);
    expect(cursorAt(path, 999)).toEqual({ x: 500, y: 300 });
    const mid = cursorAt(path, 25);
    expect(mid.x).toBeGreaterThan(100);
    expect(mid.x).toBeLessThan(500);
  });

  it("cameraAt interpola zoom e foco", () => {
    const keys = [
      { f: 0, x: 0, y: 0, s: 1 },
      { f: 10, x: 100, y: 200, s: 2 },
    ];
    expect(cameraAt(keys, -5)).toEqual({ x: 0, y: 0, s: 1 });
    expect(cameraAt(keys, 10)).toEqual({ x: 100, y: 200, s: 2 });
    const mid = cameraAt(keys, 5);
    expect(mid.s).toBeGreaterThan(1);
    expect(mid.s).toBeLessThan(2);
  });

  it("typed revela caractere a caractere e nunca passa do texto", () => {
    expect(typed("Marina", 0, 10, 2)).toBe("");
    expect(typed("Marina", 10, 10, 2)).toBe("");
    expect(typed("Marina", 14, 10, 2)).toBe("Ma");
    expect(typed("Marina", 500, 10, 2)).toBe("Marina");
  });

  it("brl formata em reais com separador de milhar", () => {
    expect(brl(0)).toBe("R$ 0,00");
    expect(brl(469.15)).toBe("R$ 469,15");
    expect(brl(1234.5)).toBe("R$ 1.234,50");
  });
});
