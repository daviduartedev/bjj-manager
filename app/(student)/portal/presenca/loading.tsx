import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalPresencaLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 sm:space-y-8 sm:px-0">
      <DashboardPageHero badge="Presença" title="Minhas presenças" />
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="min-h-[5rem] rounded-lg border border-border/60" />
        <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
        <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
      </div>
    </div>
  );
}
