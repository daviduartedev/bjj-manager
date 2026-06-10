import { Badge } from "@/components/ui/badge";

export function StudentExemptBadge() {
  return (
    <Badge variant="outline" className="border-[hsl(var(--status-info)/0.35)] text-foreground">
      Isento
    </Badge>
  );
}
