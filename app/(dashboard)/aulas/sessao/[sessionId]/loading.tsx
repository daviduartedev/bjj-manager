import { PageFrame } from "@/components/prototype/page-frame";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export default function SessionPresenceLoading() {
  return (
    <PageFrame title="Chamada" emoji="📋" icon={CalendarDays} tone="emerald">
      <DashboardPanel icon={CalendarDays} title="Check-ins e presença">
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="min-h-[4rem] rounded-lg border border-border/60" />
          <Skeleton className="min-h-[12rem] rounded-lg border border-border/60" />
          <Skeleton className="min-h-[8rem] rounded-lg border border-border/60" />
        </div>
      </DashboardPanel>
    </PageFrame>
  );
}
