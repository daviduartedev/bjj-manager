import Link from "next/link";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentAttendancesPage, StudentAttendanceRow } from "@/lib/data/student-attendances";
import { cn } from "@/lib/utils";

const ORIGIN_LABEL: Record<StudentAttendanceRow["origin"], string> = {
  checkin_student: "Check-in do aluno",
  manual_instructor: "Manual (professor)",
};

function formatRecordedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

type AttendanceHistoryPanelProps = {
  data: StudentAttendancesPage;
  /** Base path for pagination links (without query). */
  paginationBasePath: string;
  /** Extra query params preserved in pagination (e.g. tab=presenca). */
  paginationQuery?: Record<string, string>;
  emptyTitle: string;
  emptyDescription: string;
  className?: string;
};

function buildPageHref(
  basePath: string,
  page: number,
  extra?: Record<string, string>,
): string {
  const params = new URLSearchParams(extra);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AttendanceHistoryPanel({
  data,
  paginationBasePath,
  paginationQuery,
  emptyTitle,
  emptyDescription,
  className,
}: AttendanceHistoryPanelProps) {
  const { rows, total, page, totalPages } = data;

  if (total === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const prevHref =
    page > 1 ? buildPageHref(paginationBasePath, page - 1, paginationQuery) : null;
  const nextHref =
    page < totalPages
      ? buildPageHref(paginationBasePath, page + 1, paginationQuery)
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-border/80 border-l-[3px] border-l-[hsl(var(--status-paid)/0.45)] bg-muted/15 px-4 py-3">
        <p className="text-sm text-muted-foreground">Total de aulas frequentadas</p>
        <p className="text-3xl font-semibold tabular-nums">{total}</p>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <article className="rounded-lg border border-border border-l-[3px] border-l-primary/30 bg-card p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {row.sessionDateLabel}
                  </p>
                  <h4 className="type-card-heading break-words">{row.className}</h4>
                  <p className="text-sm text-muted-foreground">
                    {row.startTime} – {row.endTime} · {row.instructorName}
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit shrink-0">
                  {ORIGIN_LABEL[row.origin]}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Registado por {row.recordedByName} · {formatRecordedAt(row.recordedAt)}
              </p>
            </article>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {prevHref ? (
              <Button variant="outline" className="min-h-11 w-full sm:w-auto" asChild>
                <Link href={prevHref}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Anterior
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="min-h-11 w-full sm:w-auto" disabled>
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </Button>
            )}
            {nextHref ? (
              <Button variant="outline" className="min-h-11 w-full sm:w-auto" asChild>
                <Link href={nextHref}>
                  Próxima
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="min-h-11 w-full sm:w-auto" disabled>
                Próxima
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
