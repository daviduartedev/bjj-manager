import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight, Users } from "lucide-react";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listUpcomingSessions } from "@/lib/data/classes-page";
import { studentKindLabels } from "@/lib/i18n/domain-enums";
import { routeAulasSessao, ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Aulas",
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

function formatSessionDate(ymd: string): string {
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayLabel = WEEKDAY_LABELS[date.getDay()] ?? "";
    return `${dayLabel}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  } catch {
    return ymd;
  }
}

export default async function AulasPage() {
  const sessions = await listUpcomingSessions();

  return (
    <PageFrame
      title="Aulas"
      context="Sessões dos próximos 7 dias. Clique numa sessão para ver os check-ins."
      secondary={{
        label: "Gerenciar turmas",
        href: ROUTES.aulasTurmas,
        icon: <CalendarDays className="size-5" aria-hidden />,
      }}
    >
      <DashboardPanel icon={CalendarDays} title="Próximas sessões" subtitle="7 dias à frente">
        {sessions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhuma sessão nos próximos 7 dias"
            description="Verifique as turmas e horários para gerar sessões."
            className="rounded-none border-0 bg-transparent shadow-none"
          >
            <Button asChild variant="outline" className="min-h-11">
              <Link href={ROUTES.aulasTurmas}>Ver turmas</Link>
            </Button>
          </EmptyState>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={routeAulasSessao(s.id)}
                  className="flex min-h-11 items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-primary/[0.04]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.className}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSessionDate(s.sessionDate)} · {s.startTime} – {s.endTime}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-4" aria-hidden />
                      {s.checkInCount}
                    </span>
                    <Badge variant="secondary">{studentKindLabels[s.classKind]}</Badge>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>
    </PageFrame>
  );
}
