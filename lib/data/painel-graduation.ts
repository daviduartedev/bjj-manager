import type { AcademyModality } from "@/lib/modalities/catalog";
import { findReferencedRank, type RankColor } from "@/lib/modalities/referenced-ranks";
import { beltLabelPt } from "@/lib/students/belt-labels";
import {
  meetsGraduationAttentionThreshold,
  resolveBeltStart,
  resolveDegreeStart,
  type GraduationRecordInput,
} from "@/lib/students/graduation-reference";

export type PainelAttentionRow = {
  studentId: string;
  fullName: string;
};

export type PainelDistributionSlice = {
  beltId: string;
  slug: string;
  kind: "adult" | "kids";
  ordinal: number;
  label: string;
  count: number;
  barColor?: string;
};

export type PainelGraduationStudent = {
  id: string;
  fullName: string;
  kind: "adult" | "kids" | "baby";
  academyStartDate: string | null;
  currentBelt: {
    id: string;
    slug: string;
    kind: "adult" | "kids";
    ordinal: number;
  } | null;
  currentDegree: number | null;
  graduations: GraduationRecordInput[];
  graduationReferenceId: string | null;
  currentRankCode: string | null;
  currentRankDate: string | null;
};

const RANK_HEX: Record<RankColor, string> = {
  white: "#f4f4f5",
  gray: "#6b7280",
  blue: "#2563eb",
  yellow: "#eab308",
  orange: "#ea580c",
  green: "#16a34a",
  purple: "#7c3aed",
  brown: "#92400e",
  black: "#18181b",
  red: "#dc2626",
  silver: "#94a3b8",
  gold: "#d4a017",
};

function rankBarColor(colors: readonly RankColor[], pattern: "solid" | "tips" | "alternating"): string {
  const hex = colors.map((color) => RANK_HEX[color]);
  if (hex.length < 2) return hex[0] ?? "#64748b";
  if (pattern === "alternating") {
    return `repeating-linear-gradient(90deg, ${hex[0]} 0 8px, ${hex[1]} 8px 16px)`;
  }
  return `linear-gradient(90deg, ${hex[0]} 0 18%, ${hex[1]} 18% 82%, ${hex[0]} 82% 100%)`;
}

function beltSlices(
  students: PainelGraduationStudent[],
  kind: "adult" | "kids",
): PainelDistributionSlice[] {
  const map = new Map<string, { belt: NonNullable<PainelGraduationStudent["currentBelt"]>; count: number }>();
  for (const student of students) {
    if (student.kind !== kind || !student.currentBelt || student.currentBelt.kind !== kind) continue;
    const prev = map.get(student.currentBelt.id);
    if (prev) prev.count += 1;
    else map.set(student.currentBelt.id, { belt: student.currentBelt, count: 1 });
  }
  return [...map.values()]
    .map(({ belt, count }) => ({
      beltId: belt.id,
      slug: belt.slug,
      kind: belt.kind,
      ordinal: belt.ordinal,
      label: beltLabelPt(belt.slug, belt.kind),
      count,
    }))
    .sort((a, b) => a.ordinal - b.ordinal);
}

function referencedSlices(students: PainelGraduationStudent[]): PainelDistributionSlice[] {
  const map = new Map<string, PainelDistributionSlice>();
  for (const student of students) {
    const rank = findReferencedRank(student.graduationReferenceId, student.currentRankCode);
    if (!rank) continue;
    const prev = map.get(rank.code);
    if (prev) {
      prev.count += 1;
      continue;
    }
    map.set(rank.code, {
      beltId: rank.code,
      slug: rank.code,
      kind: "adult",
      ordinal: rank.ordinal,
      label: rank.label,
      count: 1,
      barColor: rankBarColor(rank.colors, rank.pattern),
    });
  }
  return [...map.values()].sort((a, b) => a.ordinal - b.ordinal);
}

/** Distribuição e prontidão do painel. A entrada na academia não entra nesta conta. */
export function buildPainelGraduationView(
  modality: AcademyModality,
  todayYmd: string,
  students: PainelGraduationStudent[],
): {
  alerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
} {
  if (modality === "boxing") {
    return { alerts: [], distributionAdult: [], distributionKids: [] };
  }
  if (modality === "judo" || modality === "muay_thai") {
    return { alerts: [], distributionAdult: referencedSlices(students), distributionKids: [] };
  }
  const alerts: PainelAttentionRow[] = [];
  for (const student of students) {
    if (!student.currentBelt || student.currentDegree == null) continue;
    const beltStart = resolveBeltStart(
      student.graduations,
      student.currentBelt.id,
      student.academyStartDate,
    );
    const degreeStart = resolveDegreeStart(
      student.graduations,
      student.currentBelt.id,
      student.currentDegree,
      student.academyStartDate,
    );
    if (meetsGraduationAttentionThreshold(beltStart.startYmd, degreeStart.startYmd, todayYmd)) {
      alerts.push({ studentId: student.id, fullName: student.fullName });
    }
  }
  return {
    alerts,
    distributionAdult: beltSlices(students, "adult"),
    distributionKids: beltSlices(students, "kids"),
  };
}
