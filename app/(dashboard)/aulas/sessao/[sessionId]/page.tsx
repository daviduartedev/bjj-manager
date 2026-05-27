import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";

import { SessionCheckInsPanel } from "@/components/classes/session-check-ins-panel";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { listSessionPresence } from "@/lib/data/class-session-check-ins";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Presença da sessão",
};

type Props = {
  params: Promise<{ sessionId: string }>;
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

function formatSessionDate(ymd: string): string {
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayLabel = WEEKDAY_LABELS[date.getDay()] ?? "";
    return `${dayLabel}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  } catch {
    return ymd;
  }
}

export default async function SessionCheckInsPage({ params }: Props) {
  const { sessionId } = await params;
  const result = await listSessionPresence(sessionId);

  if (!result.ok) notFound();

  const { session, checkIns, attendances, manualEligible } = result;
  const dateLabel = formatSessionDate(session.sessionDate);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-1 sm:px-0">
      <DashboardPageHero
        badge="Aulas"
        intro={<DashboardBackLink href={ROUTES.aulas}>Aulas</DashboardBackLink>}
        title={session.className}
        description={`${dateLabel} · ${session.startTime} – ${session.endTime}`}
      />

      <DashboardPanel
        icon={CalendarDays}
        title="Check-ins e presença"
        subtitle="Atualização automática a cada 30 segundos"
      >
        <SessionCheckInsPanel
          sessionId={sessionId}
          initialCheckIns={checkIns}
          initialAttendances={attendances}
          initialManualEligible={manualEligible}
        />
      </DashboardPanel>

      <DashboardPanel
        icon={Users}
        title="Resumo"
        subtitle="Contagem rápida desta sessão"
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <dt className="text-xs text-muted-foreground">Check-ins</dt>
            <dd className="text-2xl font-semibold tabular-nums">{checkIns.length}</dd>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <dt className="text-xs text-muted-foreground">Presença confirmada</dt>
            <dd className="text-2xl font-semibold tabular-nums">{attendances.length}</dd>
          </div>
          <div className="col-span-2 rounded-lg border border-border/80 bg-muted/20 p-3 sm:col-span-1">
            <dt className="text-xs text-muted-foreground">Elegíveis manual</dt>
            <dd className="text-2xl font-semibold tabular-nums">{manualEligible.length}</dd>
          </div>
        </dl>
      </DashboardPanel>
    </div>
  );
}
