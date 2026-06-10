export const ALUNOS_LIST_COLUMNS = [
  "faixa",
  "data_graduacao",
  "tempo_grau",
  "peso",
  "idade",
  "situacao",
] as const;

export type AlunosListColumn = (typeof ALUNOS_LIST_COLUMNS)[number];

export const DEFAULT_ALUNOS_LIST_COLUMNS: readonly AlunosListColumn[] = [
  ...ALUNOS_LIST_COLUMNS,
];

export const ALUNOS_LIST_COLUMN_LABELS: Record<AlunosListColumn, string> = {
  faixa: "Faixa / grau",
  data_graduacao: "Data do grau",
  tempo_grau: "Tempo no grau",
  peso: "Peso (kg)",
  idade: "Idade",
  situacao: "Situação",
};

export function parseAlunosListColumns(raw?: string): AlunosListColumn[] {
  if (!raw?.trim()) return [...DEFAULT_ALUNOS_LIST_COLUMNS];
  const parts = raw.split(",").map((s) => s.trim());
  const valid = parts.filter((c): c is AlunosListColumn =>
    (ALUNOS_LIST_COLUMNS as readonly string[]).includes(c),
  );
  return valid.length > 0 ? valid : [...DEFAULT_ALUNOS_LIST_COLUMNS];
}

export function stringifyAlunosListColumns(
  cols: readonly AlunosListColumn[],
): string | null {
  const normalized = ALUNOS_LIST_COLUMNS.filter((c) => cols.includes(c));
  const isDefault =
    normalized.length === DEFAULT_ALUNOS_LIST_COLUMNS.length &&
    DEFAULT_ALUNOS_LIST_COLUMNS.every((c, i) => normalized[i] === c);
  return isDefault ? null : normalized.join(",");
}

export function toggleAlunosListColumn(
  cols: readonly AlunosListColumn[],
  column: AlunosListColumn,
): AlunosListColumn[] {
  const set = new Set(cols);
  if (set.has(column)) set.delete(column);
  else set.add(column);
  return ALUNOS_LIST_COLUMNS.filter((c) => set.has(c));
}
