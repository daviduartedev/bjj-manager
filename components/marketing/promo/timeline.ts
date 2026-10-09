import { Easing, interpolate } from "remotion";

/**
 * Primitivas puras de linha do tempo do vídeo-promo. Sem JSX: cursor, câmera,
 * digitação e contadores derivam de dados e do frame atual.
 * Coordenadas de UI são sempre locais à janela do app (WIN), não ao canvas.
 */

export const PROMO_FPS = 30;
export const PROMO_WIDTH = 1920;
export const PROMO_HEIGHT = 1080;

/** Janela do app dentro do canvas. */
export const WIN = { x: 40, y: 40, w: 1840, h: 900 } as const;
export const SIDEBAR_W = 300;
export const HEADER_H = 100;

export type Pt = { f: number; x: number; y: number };
export type CamKey = { f: number; x: number; y: number; s: number };

const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Posição do cursor: trajetória por keyframes, easing por segmento e leve arco. */
export function cursorAt(points: readonly Pt[], frame: number): { x: number; y: number } {
  const first = points[0];
  const last = points[points.length - 1];
  if (frame <= first.f) return { x: first.x, y: first.y };
  if (frame >= last.f) return { x: last.x, y: last.y };

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const span = b.f - a.f;
      if (span === 0) return { x: b.x, y: b.y };
      const t = ease(clamp01((frame - a.f) / span));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      // Arco perpendicular: movimento humano raramente é uma reta perfeita.
      const bow = Math.sin(t * Math.PI) * Math.min(dist * 0.07, 36);
      const nx = dist === 0 ? 0 : -dy / dist;
      const ny = dist === 0 ? 0 : dx / dist;
      return { x: a.x + dx * t + nx * bow, y: a.y + dy * t + ny * bow };
    }
  }
  return { x: last.x, y: last.y };
}

/** Câmera: foco e zoom interpolados entre keyframes. */
export function cameraAt(keys: readonly CamKey[], frame: number): { x: number; y: number; s: number } {
  const frames = keys.map((k) => k.f);
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease } as const;
  return {
    x: interpolate(frame, frames, keys.map((k) => k.x), opts),
    y: interpolate(frame, frames, keys.map((k) => k.y), opts),
    s: interpolate(frame, frames, keys.map((k) => k.s), opts),
  };
}

/** Texto digitado até o frame atual. */
export function typed(text: string, frame: number, start: number, framesPerChar = 2.2): string {
  const count = Math.floor((frame - start) / framesPerChar);
  return text.slice(0, Math.min(text.length, Math.max(0, count)));
}

/** 0→1→0 em torno de um clique (feedback de botão pressionado). */
export function press(frame: number, clickFrame: number): number {
  return interpolate(frame, [clickFrame - 4, clickFrame, clickFrame + 9], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Contador que sobe suavemente. */
export function countUp(from: number, to: number, frame: number, start: number, duration = 24): number {
  const t = clamp01((frame - start) / duration);
  return from + (to - from) * Easing.out(Easing.cubic)(t);
}

/** Progresso 0→1 em uma janela de frames, com easing de saída. */
export function progress(frame: number, start: number, duration: number): number {
  return Easing.out(Easing.cubic)(clamp01((frame - start) / duration));
}

export function brl(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

// ---------------------------------------------------------------------------
// Cenas
// ---------------------------------------------------------------------------

export const SCENE_FRAMES = {
  intro: 105,
  alunos: 300,
  graduacao: 270,
  mensalidades: 240,
  painel: 180,
  documentos: 225,
  outro: 135,
} as const;

export type SceneId = keyof typeof SCENE_FRAMES;

export const SCENE_ORDER: readonly SceneId[] = [
  "intro",
  "alunos",
  "graduacao",
  "mensalidades",
  "painel",
  "documentos",
  "outro",
];

export function sceneStart(id: SceneId): number {
  let from = 0;
  for (const key of SCENE_ORDER) {
    if (key === id) return from;
    from += SCENE_FRAMES[key];
  }
  return from;
}

export const PROMO_DURATION = SCENE_ORDER.reduce((sum, id) => sum + SCENE_FRAMES[id], 0);

/** Cena ativa em um frame global. */
export function sceneAt(frame: number): SceneId {
  let from = 0;
  for (const id of SCENE_ORDER) {
    from += SCENE_FRAMES[id];
    if (frame < from) return id;
  }
  return SCENE_ORDER[SCENE_ORDER.length - 1];
}

/** Desloca keyframes locais de uma cena para frames globais. */
export function shift<T extends { f: number }>(items: readonly T[], offset: number): T[] {
  return items.map((item) => ({ ...item, f: item.f + offset }));
}
