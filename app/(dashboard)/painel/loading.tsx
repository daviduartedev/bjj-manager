import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { Skeleton } from "@/components/ui/skeleton";

export default function PainelLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Painel operacional"
        title="Painel"
        aside={
          <Skeleton className="h-[4.5rem] w-full max-w-xs rounded-lg border border-border/60" />
        }
      >
        <Skeleton className="h-4 w-full max-w-xl" />
      </DashboardPageHero>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="min-h-[5.5rem] rounded-xl border border-border/60" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="min-h-[22rem] rounded-xl border border-border/60" />
        <Skeleton className="min-h-[22rem] rounded-xl border border-border/60" />
      </div>

      <Skeleton className="min-h-[8rem] rounded-xl border border-border/60" />
    </div>
  );
}
