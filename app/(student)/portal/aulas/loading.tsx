import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalAulasLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHero badge="Aulas" title="Minhas aulas" description="Check-in e horários." />
      <ul className="space-y-4" aria-busy="true" aria-label="A carregar aulas">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="min-h-[8.5rem] rounded-lg border border-border/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}
