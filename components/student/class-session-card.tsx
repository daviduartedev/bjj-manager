"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cancelCheckIn, createCheckIn } from "@/actions/student-portal/check-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCheckinWindowState,
  type CheckinWindowState,
} from "@/lib/classes/checkin-window";
import { formatDateBR } from "@/lib/dates";
import type { StudentClassSessionRow } from "@/lib/data/student-class-sessions";

type ClassSessionCardProps = {
  session: StudentClassSessionRow;
};

function windowBadge(state: CheckinWindowState, hasCheckIn: boolean) {
  if (hasCheckIn && state === "closed") {
    return { label: "Presença confirmada", variant: "paid" as const };
  }
  if (hasCheckIn) {
    return { label: "Check-in confirmado", variant: "paid" as const };
  }
  if (state === "open") {
    return { label: "Check-in aberto", variant: "info" as const };
  }
  if (state === "not_yet_open") {
    return { label: "Check-in em breve", variant: "pending" as const };
  }
  return { label: "Check-in encerrado", variant: "muted" as const };
}

export function ClassSessionCard({ session }: ClassSessionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const windowState = getCheckinWindowState(
    session.sessionDate,
    `${session.startTime}:00`,
  );
  const hasCheckIn = Boolean(session.checkInId);
  const badge = windowBadge(windowState, hasCheckIn);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const result = await createCheckIn({ classSessionId: session.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Check-in confirmado. Até a aula!");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      const result = await cancelCheckIn({ classSessionId: session.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Check-in cancelado.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const dateLabel = formatDateBR(session.sessionDate) ?? session.sessionDate;
  const kindLabel = session.classKind === "kids" ? "Kids" : "Adulto";

  return (
    <article className="rounded-lg border border-border border-l-[3px] border-l-primary/35 bg-gradient-to-br from-[hsl(var(--content-wash-mid)/0.4)] to-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{dateLabel}</p>
          <h3 className="type-card-heading break-words">{session.className}</h3>
          <p className="text-sm text-muted-foreground">
            {session.startTime} – {session.endTime} · {kindLabel} · {session.instructorName}
          </p>
        </div>
        <Badge variant={badge.variant} className="w-fit shrink-0">
          {badge.label}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:flex-wrap">
        {!hasCheckIn && windowState === "open" ? (
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={loading}
            onClick={handleCheckIn}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CalendarCheck className="size-4" aria-hidden />
            )}
            Estou presente
          </Button>
        ) : null}

        {hasCheckIn && windowState === "open" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={loading}
            onClick={handleCancel}
          >
            Cancelar check-in
          </Button>
        ) : null}

        {hasCheckIn && windowState !== "open" ? (
          <p className="text-sm text-muted-foreground">
            Check-in registado
            {session.checkInAt
              ? ` às ${new Date(session.checkInAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Sao_Paulo",
                })}`
              : ""}
            .
          </p>
        ) : null}

        {!hasCheckIn && windowState === "not_yet_open" ? (
          <p className="text-sm text-muted-foreground">
            O check-in abre 6 horas antes do início da aula.
          </p>
        ) : null}

        {!hasCheckIn && windowState === "closed" ? (
          <p className="text-sm text-muted-foreground">
            A janela de check-in já encerrou para esta aula.
          </p>
        ) : null}
      </div>
    </article>
  );
}
