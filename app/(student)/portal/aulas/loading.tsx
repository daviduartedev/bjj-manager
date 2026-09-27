import { PageFrame } from "@/components/prototype/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalAulasLoading() {
  return (
    <PageFrame title="Minhas aulas" context="Check-in e horários.">
      <ul className="space-y-4" aria-busy="true" aria-label="A carregar aulas">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="min-h-[8.5rem] rounded-lg border border-border/60" />
          </li>
        ))}
      </ul>
    </PageFrame>
  );
}
