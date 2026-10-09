import {
  PROMO_DURATION,
  sceneStart,
  shift,
  type CamKey,
  type Pt,
  type SceneId,
} from "@/components/marketing/promo/timeline";

/**
 * Roteiros das cenas (frames locais, coordenadas locais à janela do app).
 * Ficam em um módulo sem JSX para serem testáveis: cliques sempre acontecem com o
 * cursor parado sobre o alvo, e cursor/câmera cobrem exatamente a duração da cena.
 */
// --- alunos
export const ALUNOS_CURSOR: Pt[] = [
  { f: 0, x: 1250, y: 640 },
  { f: 34, x: 1672, y: 52 },
  { f: 42, x: 1672, y: 52 },
  { f: 62, x: 820, y: 302 },
  { f: 100, x: 820, y: 302 },
  { f: 122, x: 900, y: 416 },
  { f: 130, x: 900, y: 416 },
  { f: 146, x: 700, y: 552 },
  { f: 154, x: 700, y: 552 },
  { f: 166, x: 690, y: 526 },
  { f: 174, x: 690, y: 526 },
  { f: 192, x: 1130, y: 700 },
  { f: 200, x: 1130, y: 700 },
  { f: 228, x: 1040, y: 818 },
  { f: 300, x: 1040, y: 818 },
];

export const ALUNOS_CLICKS = [38, 66, 126, 150, 170, 196];

export const ALUNOS_CAMERA: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1 },
  { f: 22, x: 920, y: 450, s: 1 },
  { f: 38, x: 1400, y: 190, s: 1.3 },
  { f: 52, x: 920, y: 420, s: 1.2 },
  { f: 68, x: 920, y: 350, s: 1.5 },
  { f: 112, x: 920, y: 370, s: 1.4 },
  { f: 126, x: 920, y: 480, s: 1.45 },
  { f: 162, x: 920, y: 520, s: 1.45 },
  { f: 194, x: 1000, y: 590, s: 1.45 },
  { f: 224, x: 1000, y: 470, s: 1.12 },
  { f: 266, x: 920, y: 460, s: 1.06 },
  { f: 300, x: 920, y: 450, s: 1 },
];

// --- graduacao
export const GRADUACAO_CURSOR: Pt[] = [
  { f: 0, x: 1040, y: 820 },
  { f: 30, x: 1602, y: 322 },
  { f: 38, x: 1602, y: 322 },
  { f: 56, x: 880, y: 236 },
  { f: 66, x: 880, y: 236 },
  { f: 78, x: 880, y: 348 },
  { f: 88, x: 880, y: 348 },
  { f: 98, x: 725, y: 468 },
  { f: 128, x: 725, y: 468 },
  { f: 138, x: 920, y: 584 },
  { f: 186, x: 920, y: 584 },
  { f: 196, x: 1150, y: 740 },
  { f: 206, x: 1150, y: 740 },
  { f: 236, x: 1000, y: 640 },
  { f: 270, x: 1000, y: 640 },
];

export const GRADUACAO_CLICKS = [34, 62, 84, 102, 142, 202];

export const GRADUACAO_CAMERA: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1 },
  { f: 22, x: 920, y: 450, s: 1 },
  { f: 38, x: 1450, y: 300, s: 1.3 },
  { f: 52, x: 920, y: 400, s: 1.15 },
  { f: 62, x: 880, y: 270, s: 1.4 },
  { f: 84, x: 880, y: 350, s: 1.4 },
  { f: 100, x: 800, y: 480, s: 1.45 },
  { f: 140, x: 920, y: 560, s: 1.5 },
  { f: 192, x: 1000, y: 640, s: 1.35 },
  { f: 218, x: 760, y: 300, s: 1.4 },
  { f: 244, x: 940, y: 450, s: 1.1 },
  { f: 270, x: 920, y: 450, s: 1 },
];

// --- mensalidades
export const MENSALIDADES_CURSOR: Pt[] = [
  { f: 0, x: 1100, y: 780 },
  { f: 28, x: 404, y: 488 },
  { f: 36, x: 404, y: 488 },
  { f: 44, x: 404, y: 568 },
  { f: 52, x: 404, y: 568 },
  { f: 60, x: 404, y: 648 },
  { f: 68, x: 404, y: 648 },
  { f: 84, x: 1602, y: 358 },
  { f: 94, x: 1602, y: 358 },
  { f: 132, x: 1693, y: 728 },
  { f: 142, x: 1693, y: 728 },
  { f: 170, x: 1300, y: 640 },
  { f: 240, x: 1300, y: 640 },
];

export const MENSALIDADES_CLICKS = [32, 48, 64, 90, 138];

export const MENSALIDADES_CAMERA: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1 },
  { f: 18, x: 920, y: 450, s: 1 },
  { f: 34, x: 880, y: 560, s: 1.35 },
  { f: 70, x: 960, y: 520, s: 1.3 },
  { f: 88, x: 1000, y: 470, s: 1.15 },
  { f: 124, x: 1100, y: 600, s: 1.3 },
  { f: 142, x: 1250, y: 650, s: 1.4 },
  { f: 176, x: 920, y: 450, s: 1.1 },
  { f: 240, x: 920, y: 450, s: 1 },
];

// --- painel
export const PAINEL_CURSOR: Pt[] = [
  { f: 0, x: 1300, y: 640 },
  { f: 44, x: 900, y: 430 },
  { f: 56, x: 900, y: 430 },
  { f: 80, x: 1068, y: 718 },
  { f: 90, x: 1068, y: 718 },
  { f: 140, x: 1500, y: 740 },
  { f: 180, x: 1500, y: 740 },
];

export const PAINEL_CLICKS = [86];

export const PAINEL_CAMERA: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1.04 },
  { f: 40, x: 900, y: 300, s: 1.25 },
  { f: 74, x: 800, y: 620, s: 1.35 },
  { f: 116, x: 1250, y: 620, s: 1.25 },
  { f: 180, x: 920, y: 450, s: 1 },
];

// --- documentos
export const DOCUMENTOS_CURSOR: Pt[] = [
  { f: 0, x: 1300, y: 700 },
  { f: 24, x: 628, y: 281 },
  { f: 32, x: 628, y: 281 },
  { f: 48, x: 1200, y: 248 },
  { f: 86, x: 1200, y: 248 },
  { f: 122, x: 1572, y: 818 },
  { f: 134, x: 1572, y: 818 },
  { f: 175, x: 1100, y: 560 },
  { f: 225, x: 1100, y: 560 },
];

export const DOCUMENTOS_CLICKS = [28, 52, 128];

export const DOCUMENTOS_CAMERA: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1 },
  { f: 18, x: 920, y: 450, s: 1 },
  { f: 30, x: 700, y: 300, s: 1.3 },
  { f: 54, x: 1250, y: 300, s: 1.4 },
  { f: 90, x: 1300, y: 520, s: 1.25 },
  { f: 122, x: 1400, y: 700, s: 1.35 },
  { f: 148, x: 1450, y: 540, s: 1.35 },
  { f: 200, x: 1300, y: 500, s: 1.2 },
  { f: 225, x: 920, y: 450, s: 1.05 },
];



// ---------------------------------------------------------------------------
// Roteiro global: junta cursor, cliques e câmera de cada cena em frames absolutos
// ---------------------------------------------------------------------------

export const APP_SCRIPTS = [
  { id: "alunos", cursor: ALUNOS_CURSOR, clicks: ALUNOS_CLICKS, camera: ALUNOS_CAMERA },
  { id: "graduacao", cursor: GRADUACAO_CURSOR, clicks: GRADUACAO_CLICKS, camera: GRADUACAO_CAMERA },
  { id: "mensalidades", cursor: MENSALIDADES_CURSOR, clicks: MENSALIDADES_CLICKS, camera: MENSALIDADES_CAMERA },
  { id: "painel", cursor: PAINEL_CURSOR, clicks: PAINEL_CLICKS, camera: PAINEL_CAMERA },
  { id: "documentos", cursor: DOCUMENTOS_CURSOR, clicks: DOCUMENTOS_CLICKS, camera: DOCUMENTOS_CAMERA },
] as const satisfies ReadonlyArray<{
  id: SceneId;
  cursor: Pt[];
  clicks: number[];
  camera: CamKey[];
}>;

/** Concatena keyframes de cena em frames globais, sem duplicar o frame de junção. */
function stitch<T extends { f: number }>(pick: (s: (typeof APP_SCRIPTS)[number]) => readonly T[]): T[] {
  const out: T[] = [];
  for (const script of APP_SCRIPTS) {
    const lastF = out.length ? out[out.length - 1].f : -1;
    for (const item of shift(pick(script), sceneStart(script.id))) {
      if (item.f > lastF) out.push(item);
    }
  }
  return out;
}

export const CURSOR_PATH: Pt[] = stitch((s) => s.cursor);

export const CLICK_FRAMES: number[] = APP_SCRIPTS.flatMap((s) =>
  s.clicks.map((f) => f + sceneStart(s.id)),
);

export const CAMERA_PATH: CamKey[] = [
  { f: 0, x: 920, y: 450, s: 1 },
  ...stitch((s) => s.camera),
  { f: PROMO_DURATION, x: 920, y: 450, s: 1 },
];
