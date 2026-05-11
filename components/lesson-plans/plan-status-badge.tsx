import { cn } from "@/lib/utils";

type Status = "draft" | "published" | "archived";

const LABELS: Record<Status, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const STYLES: Record<Status, string> = {
  draft: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-200",
  published: "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200",
  archived: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200",
};

export function PlanStatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-crm-xs font-medium ring-1", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
