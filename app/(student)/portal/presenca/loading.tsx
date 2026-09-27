import { PageFrame } from "@/components/prototype/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalPresencaLoading() {
  return (
    <PageFrame
      title="Minhas presenças"
      context="Aulas em que o professor confirmou a sua presença oficial."
    >
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="min-h-[5rem] rounded-lg border border-border/60" />
        <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
        <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
      </div>
    </PageFrame>
  );
}
