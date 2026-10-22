import type { AcademyModality } from "./catalog";

export type RankColor = "white" | "gray" | "blue" | "yellow" | "orange" | "green" | "purple" | "brown" | "black" | "red" | "silver" | "gold";
export type ReferencedRank = {
  referenceId: string;
  modality: "judo" | "muay_thai";
  code: string;
  ordinal: number;
  label: string;
  colors: readonly RankColor[];
  pattern: "solid" | "tips" | "alternating";
};

export const JUDO_REFERENCE = {
  id: "cbj-2023",
  title: "CBJ — Regulamento para exame e outorga de faixas e graus 2023",
  sourceUrl: "https://cbj.com.br/public/uploads/regulamentos_esportivos/arquivo_cbj_180223310123.pdf",
  consultedAt: "2026-10-22",
  limitation: "Referência CBJ 2023 adotada pelo Casca. Não certifica homologação federativa nem conformidade com comunicados posteriores.",
} as const;

export const MUAY_THAI_REFERENCE = {
  id: "cbmtt-19-khan",
  title: "CBMTT — Tabela de graduação de 19 khan",
  sourceUrl: "https://www.cbmtt.org.br/images/graduacoes-cbmtt.jpg",
  consultedAt: "2026-10-22",
  limitation: "A tabela consultada não informa edição, idades ou carências. Não declara equivalência com os 15 khan IFMA 2025. O registro no Casca não certifica homologação federativa. Títulos esportivos não concedem permissões de acesso.",
} as const;

const basics: [string, string, RankColor[]][] = [
  ["beginner", "Iniciante — Branca", ["white"]],
  ["kyu-11", "11º kyū — Branca e cinza", ["white", "gray"]],
  ["kyu-10", "10º kyū — Cinza", ["gray"]],
  ["kyu-9", "9º kyū — Cinza e azul", ["gray", "blue"]],
  ["kyu-8", "8º kyū — Azul", ["blue"]],
  ["kyu-7", "7º kyū — Azul e amarela", ["blue", "yellow"]],
  ["kyu-6", "6º kyū — Amarela", ["yellow"]],
  ["kyu-5", "5º kyū — Amarela e laranja", ["yellow", "orange"]],
  ["kyu-4", "4º kyū — Laranja", ["orange"]],
  ["kyu-3", "3º kyū — Verde", ["green"]],
  ["kyu-2", "2º kyū — Roxa", ["purple"]],
  ["kyu-1", "1º kyū — Marrom", ["brown"]],
];
const judoRanks: readonly ReferencedRank[] = [
  ...basics.map(([code, label, colors], ordinal): ReferencedRank => ({
    referenceId: JUDO_REFERENCE.id, modality: "judo", code, label, colors, ordinal,
    pattern: colors.length === 1 ? "solid" : "tips",
  })),
  ...Array.from({ length: 10 }, (_, i): ReferencedRank => {
    const dan = i + 1;
    return { referenceId: JUDO_REFERENCE.id, modality: "judo", code: `dan-${dan}`,
      ordinal: 12 + i, label: `${dan}º dan — ${dan <= 5 ? "Preta" : dan <= 8 ? "Vermelha e branca" : "Vermelha"}`,
      colors: dan <= 5 ? ["black"] : dan <= 8 ? ["red", "white"] : ["red"],
      pattern: dan >= 6 && dan <= 8 ? "alternating" : "solid" };
  }),
];

const khan: [string, RankColor[]][] = [
  ["Branco (iniciante)", ["white"]],
  ["Amarelo", ["yellow"]],
  ["Amarelo e branco", ["yellow", "white"]],
  ["Verde", ["green"]],
  ["Verde e branco", ["green", "white"]],
  ["Azul", ["blue"]],
  ["Azul e branco", ["blue", "white"]],
  ["Marrom", ["brown"]],
  ["Marrom e branco", ["brown", "white"]],
  ["Vermelho", ["red"]],
  ["Vermelho e branco — Instrutor / Kru Fueng Sorn", ["red", "white"]],
  ["Vermelho e amarelo — Professor / Kru", ["red", "yellow"]],
  ["Vermelho e prata — Mestrando / Kru Yai", ["red", "silver"]],
  ["Prata — Mestre / Arjarn", ["silver"]],
  ["Prata e dourado — Grão Mestre / Arjarn Yai", ["silver", "gold"]],
  ["Dourado — Grão Mestre / Arjarn Yai (honraria)", ["gold"]],
  ["Dourado — Grão Mestre / Arjarn Yai (honraria)", ["gold"]],
  ["Dourado — Grão Mestre / Arjarn Yai (honraria)", ["gold"]],
  ["Dourado — Grão Mestre / Arjarn Yai (honraria)", ["gold"]],
];
const muayThaiRanks: readonly ReferencedRank[] = khan.map(([label, colors], ordinal) => ({
  referenceId: MUAY_THAI_REFERENCE.id, modality: "muay_thai", code: `khan-${ordinal + 1}`,
  ordinal, label: `${ordinal + 1}º khan — ${label}`, colors, pattern: "solid",
}));

/** Catálogos fechados por edição. Não reordenar uma referência já persistida. */
export function getReferencedRanks(modality: AcademyModality): readonly ReferencedRank[] {
  return modality === "judo" ? judoRanks : modality === "muay_thai" ? muayThaiRanks : [];
}
export function findReferencedRank(referenceId: string | null | undefined, code: string | null | undefined): ReferencedRank | null {
  return [...judoRanks, ...muayThaiRanks].find(r => r.referenceId === referenceId && r.code === code) ?? null;
}

/** Colunas aditivas da ficha; a data desconhecida permanece null, sem fallback temporal. */
export type ReferencedGraduationFields = {
  graduation_reference_id?: string | null;
  current_rank_code?: string | null;
  current_rank_date?: string | null;
};
