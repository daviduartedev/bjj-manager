export const PAINEL_BLOCK_IDS = [
  "overdue",
  "active",
  "received",
  "alerts",
  "forecast",
  "attention",
  "belts",
  "classes",
] as const;

export type PainelBlockId = (typeof PAINEL_BLOCK_IDS)[number];

export const PAINEL_BLOCK_LABELS: Record<PainelBlockId, string> = {
  overdue: "Atrasados",
  active: "Alunos ativos",
  received: "Recebido",
  alerts: "Alertas de graduação",
  forecast: "Previsão de receita",
  attention: "Atenção",
  belts: "Faixas",
  classes: "Aulas de hoje",
};

const KNOWN = new Set<string>(PAINEL_BLOCK_IDS);

export function parsePainelHiddenBlocks(raw: unknown): PainelBlockId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<PainelBlockId>();
  for (const item of raw) {
    if (typeof item !== "string" || !KNOWN.has(item)) continue;
    seen.add(item as PainelBlockId);
  }
  return PAINEL_BLOCK_IDS.filter((id) => seen.has(id));
}

export function isPainelBlockVisible(
  hidden: readonly PainelBlockId[],
  id: PainelBlockId,
): boolean {
  return !hidden.includes(id);
}
