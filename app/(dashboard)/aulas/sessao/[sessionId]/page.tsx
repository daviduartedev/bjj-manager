import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";

import { SessionCheckInsPanel } from "@/components/classes/session-check-ins-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { DashboardStatTile } from "@/components/layout/dashboard-stat-tile";
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
    <PageFrame
      title={session.className}
      context={`${dateLabel} · ${session.startTime} – ${session.endTime}`}
    >
      <div className="space-y-8">
      <DashboardBackLink href={ROUTES.aulas}>Aulas</DashboardBackLink>

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DashboardStatTile label="Check-ins" value={checkIns.length} />
          <DashboardStatTile label="Presença confirmada" value={attendances.length} accent="paid" />
          <DashboardStatTile
            label="Elegíveis manual"
            value={manualEligible.length}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </DashboardPanel>
      </div>
    </PageFrame>
  );
}
