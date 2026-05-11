import { cn } from "@/lib/utils";

type Status = "pending" | "ready" | "failed" | "archived";

const LABELS: Record<Status, string> = {
  pending: "A gerar",
  ready: "Pronto",
  failed: "Falhou",
  archived: "Arquivado",
};

const STYLES: Record<Status, string> = {
  pending: "bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200",
  ready: "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200",
  failed: "bg-red-50 text-red-900 ring-red-200 dark:bg-red-950/40 dark:text-red-200",
  archived: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-300",
};

export function DocumentStatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-crm-xs font-medium ring-1",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
