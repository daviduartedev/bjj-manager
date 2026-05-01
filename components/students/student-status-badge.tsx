import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  paused: "Pausado",
  trial: "Em avaliação",
};

export function StudentStatusBadge({ status }: { status: string }) {
  const label = LABELS[status] ?? status;
  const variant =
    status === "active"
      ? "paid"
      : status === "inactive"
        ? "muted"
        : status === "paused"
          ? "pending"
          : status === "trial"
            ? "info"
            : "outline";
  return <Badge variant={variant}>{label}</Badge>;
}
