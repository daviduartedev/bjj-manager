import type { PainelDashboardProps } from "@/components/painel/painel-types";
import { routeAlunoPerfil } from "@/lib/routes";

export const MIX_META = [
  { key: "paid" as const, label: "Pago", short: "Pago", color: "#16a34a" },
  { key: "pending" as const, label: "Pendente", short: "Pend.", color: "#eab308" },
  { key: "overdue" as const, label: "Atrasado", short: "Atras.", color: "#e11d48" },
  { key: "scholarship" as const, label: "Bolsista", short: "Bolsa", color: "#2563eb" },
  { key: "other" as const, label: "Outro", short: "Outro", color: "#71717a" },
];

export function mixTotal(mix: PainelDashboardProps["billingMix"]): number {
  return mix.paid + mix.pending + mix.overdue + mix.scholarship + mix.other;
}

export function shareLabel(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export type AttentionItem = {
  id: string;
  name: string;
  reason: string;
  href: string;
  tone: "rose" | "amber" | "violet" | "sky";
};

export function attentionItems(props: PainelDashboardProps): AttentionItem[] {
  const groups: { reason: string; tone: AttentionItem["tone"]; rows: PainelDashboardProps["dueToday"] }[] = [
    { reason: "Vence hoje", tone: "amber", rows: props.dueToday },
    { reason: "Atraso +14 dias", tone: "rose", rows: props.overdue14 },
    { reason: "Aniversário", tone: "violet", rows: props.birthdayToday },
    { reason: "Faixa ou grau", tone: "sky", rows: props.graduationAlerts },
  ];
  return groups.flatMap((group) =>
    group.rows.map((row) => ({
      id: `${group.reason}-${row.studentId}`,
      name: row.fullName,
      reason: group.reason,
      href: routeAlunoPerfil(row.studentId),
      tone: group.tone,
    })),
  );
}
