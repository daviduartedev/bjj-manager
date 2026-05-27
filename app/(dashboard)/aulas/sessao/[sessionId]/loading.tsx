import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export default function SessionPresenceLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-1 sm:px-0">
      <DashboardPageHero badge="Aulas" title="A carregar sessão…" />
      <DashboardPanel icon={CalendarDays} title="Check-ins e presença">
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="min-h-[4rem] rounded-lg border border-border/60" />
          <Skeleton className="min-h-[12rem] rounded-lg border border-border/60" />
          <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
        </div>
      </DashboardPanel>
    </div>
  );
}
