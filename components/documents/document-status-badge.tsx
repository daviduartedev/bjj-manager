import { cn } from "@/lib/utils";

type Status = "pending" | "ready" | "failed" | "archived";

const LABELS: Record<Status, string> = {
  pending: "A gerar",
  ready: "Pronto",
  failed: "Falhou",
  archived: "Arquivado",
};

const STYLES: Record<Status, string> = {
  pending:
    "bg-[hsl(var(--status-info)/0.12)] text-[hsl(var(--status-info-foreground))] ring-[hsl(var(--status-info)/0.28)]",
  ready:
    "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))] ring-[hsl(var(--status-paid)/0.28)]",
  failed:
    "bg-[hsl(var(--status-overdue)/0.12)] text-[hsl(var(--status-overdue-foreground))] ring-[hsl(var(--status-overdue)/0.28)]",
  archived: "bg-muted text-muted-foreground ring-border",
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
