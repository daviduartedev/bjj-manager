import { cn } from "@/lib/utils";

type Status = "draft" | "published" | "archived";

const LABELS: Record<Status, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const STYLES: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground ring-border",
  published:
    "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))] ring-[hsl(var(--status-paid)/0.3)]",
  archived:
    "bg-[hsl(var(--status-pending)/0.18)] text-[hsl(var(--status-pending-foreground))] ring-[hsl(var(--status-pending)/0.35)]",
};

export function PlanStatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-crm-xs font-medium ring-1", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
