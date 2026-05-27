"use client";

import { Loader2, RefreshCw, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  convertCheckInsToAttendances,
  recordManualAttendance,
  removeSessionAttendance,
} from "@/actions/attendances";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  SessionAttendanceRow,
  SessionCheckInRow,
  SessionManualEligibleRow,
} from "@/lib/data/class-session-check-ins";

const POLLING_INTERVAL_MS = 30_000;

const BILLING_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  paid: { label: "Em dia", variant: "secondary" },
  pending: { label: "Pendente", variant: "outline" },
  overdue: { label: "Atrasado", variant: "destructive" },
  scholarship: { label: "Bolsista", variant: "secondary" },
  other: { label: "Outro", variant: "outline" },
};

const ORIGIN_LABEL: Record<SessionAttendanceRow["origin"], string> = {
  checkin_student: "Check-in",
  manual_instructor: "Manual",
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

type Props = {
  sessionId: string;
  initialCheckIns: SessionCheckInRow[];
  initialAttendances: SessionAttendanceRow[];
  initialManualEligible: SessionManualEligibleRow[];
};

export function SessionCheckInsPanel({
  sessionId,
  initialCheckIns,
  initialAttendances,
  initialManualEligible,
}: Props) {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [attendances, setAttendances] = useState(initialAttendances);
  const [manualEligible, setManualEligible] = useState(initialManualEligible);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [manualStudentId, setManualStudentId] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pendingCheckIns = useMemo(
    () => checkIns.filter((ci) => !ci.hasAttendance),
    [checkIns],
  );

  const refresh = useCallback(() => {
    router.refresh();
    setLastRefresh(new Date());
  }, [router]);

  useEffect(() => {
    intervalRef.current = setInterval(refresh, POLLING_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    setCheckIns(initialCheckIns);
    setAttendances(initialAttendances);
    setManualEligible(initialManualEligible);
    setSelectedStudentIds(new Set());
  }, [initialCheckIns, initialAttendances, initialManualEligible]);

  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  }

  function toggleAllPending(checked: boolean) {
    if (checked) {
      setSelectedStudentIds(new Set(pendingCheckIns.map((ci) => ci.studentId)));
    } else {
      setSelectedStudentIds(new Set());
    }
  }

  async function handleConvert(studentIds?: string[]) {
    setConverting(true);
    try {
      const result = await convertCheckInsToAttendances({
        classSessionId: sessionId,
        studentIds,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const count = result.count ?? 0;
      toast.success(
        count === 1
          ? "Presença confirmada para 1 aluno."
          : `Presença confirmada para ${count} alunos.`,
      );
      setSelectedStudentIds(new Set());
      refresh();
    } finally {
      setConverting(false);
    }
  }

  async function handleManual() {
    if (!manualStudentId) {
      toast.error("Selecione um aluno para registar presença manual.");
      return;
    }
    setManualLoading(true);
    try {
      const result = await recordManualAttendance({
        classSessionId: sessionId,
        studentId: manualStudentId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Presença manual registada.");
      setManualStudentId("");
      refresh();
    } finally {
      setManualLoading(false);
    }
  }

  async function handleRemove(studentId: string, studentName: string) {
    setRemovingId(studentId);
    try {
      const result = await removeSessionAttendance({
        classSessionId: sessionId,
        studentId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${studentName} removido da lista de presença.`);
      refresh();
    } finally {
      setRemovingId(null);
    }
  }

  const allPendingSelected =
    pendingCheckIns.length > 0 &&
    pendingCheckIns.every((ci) => selectedStudentIds.has(ci.studentId));

  return (
    <div className="space-y-8">
      {/* Check-ins */}
      <section className="space-y-4" aria-labelledby="checkins-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="checkins-heading" className="text-sm font-semibold">
              Check-ins ({checkIns.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Intenção do aluno — converta em presença oficial quando confirmar.
            </p>
          </div>
          {pendingCheckIns.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                disabled={converting || selectedStudentIds.size === 0}
                onClick={() => handleConvert([...selectedStudentIds])}
              >
                {converting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Confirmar seleccionados
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={converting}
                onClick={() => handleConvert()}
              >
                {converting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Confirmar todos ({pendingCheckIns.length})
              </Button>
            </div>
          ) : null}
        </div>

        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum aluno fez check-in nesta sessão ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border/80 overflow-hidden rounded-lg border border-border/80 border-l-[3px] border-l-primary/25 bg-card shadow-sm">
            {pendingCheckIns.length > 0 ? (
              <li className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-3 py-2 sm:px-4">
                <Checkbox
                  id="select-all-pending"
                  checked={allPendingSelected}
                  onCheckedChange={(v) => toggleAllPending(v === true)}
                  aria-label="Seleccionar todos os check-ins pendentes"
                />
                <Label htmlFor="select-all-pending" className="text-xs text-muted-foreground">
                  Seleccionar pendentes ({pendingCheckIns.length})
                </Label>
              </li>
            ) : null}
            {checkIns.map((ci) => {
              const badge = BILLING_BADGE[ci.billingIndicator] ?? BILLING_BADGE.pending;
              return (
                <li
                  key={ci.checkInId}
                  className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {!ci.hasAttendance ? (
                      <Checkbox
                        checked={selectedStudentIds.has(ci.studentId)}
                        onCheckedChange={(v) => toggleStudent(ci.studentId, v === true)}
                        aria-label={`Seleccionar ${ci.studentName}`}
                        className="mt-0.5 shrink-0"
                      />
                    ) : (
                      <span className="size-11 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ci.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        Check-in às {formatTime(ci.checkedInAt)}
                        {ci.hasAttendance ? " · Presença confirmada" : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant={badge.variant} className="w-fit shrink-0 self-start text-xs sm:self-center">
                    {badge.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Presença confirmada */}
      <section className="space-y-4" aria-labelledby="attendance-heading">
        <div>
          <h3 id="attendance-heading" className="text-sm font-semibold">
            Presença confirmada ({attendances.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Lista final da aula — remova faltosos sem apagar o check-in.
          </p>
        </div>

        {attendances.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma presença oficial registada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border/80 overflow-hidden rounded-lg border border-border/80 border-l-[3px] border-l-[hsl(var(--status-paid)/0.45)] bg-card shadow-sm">
            {attendances.map((att) => {
              const badge = BILLING_BADGE[att.billingIndicator] ?? BILLING_BADGE.pending;
              const removing = removingId === att.studentId;
              return (
                <li
                  key={att.attendanceId}
                  className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{att.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {ORIGIN_LABEL[att.origin]} · Registado às {formatTime(att.recordedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      disabled={removing}
                      onClick={() => handleRemove(att.studentId, att.studentName)}
                    >
                      {removing ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <UserMinus className="size-4" aria-hidden />
                      )}
                      Remover
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Presença manual */}
      <section className="space-y-4" aria-labelledby="manual-heading">
        <div>
          <h3 id="manual-heading" className="text-sm font-semibold">
            Presença manual
          </h3>
          <p className="text-xs text-muted-foreground">
            Alunos inscritos na turma que não fizeram check-in.
          </p>
        </div>

        {manualEligible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum aluno elegível para presença manual nesta sessão.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="manual-student">Aluno inscrito</Label>
              <Select value={manualStudentId} onValueChange={setManualStudentId}>
                <SelectTrigger id="manual-student" className="min-h-11 w-full">
                  <SelectValue placeholder="Seleccionar aluno…" />
                </SelectTrigger>
                <SelectContent>
                  {manualEligible.map((row) => (
                    <SelectItem key={row.studentId} value={row.studentId}>
                      {row.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              className="min-h-11 w-full shrink-0 sm:w-auto"
              disabled={manualLoading || !manualStudentId}
              onClick={handleManual}
            >
              {manualLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <UserPlus className="size-4" aria-hidden />
              )}
              Registar presença
            </Button>
          </div>
        )}
      </section>

      <RefreshButton lastRefresh={lastRefresh} onRefresh={refresh} />
    </div>
  );
}

function RefreshButton({
  lastRefresh,
  onRefresh,
}: {
  lastRefresh: Date;
  onRefresh: () => void;
}) {
  const timeStr = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(lastRefresh);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Button variant="outline" className="min-h-11 w-full sm:w-auto" onClick={onRefresh}>
        <RefreshCw className="mr-2 size-4" aria-hidden />
        Atualizar
      </Button>
      <span className="text-xs text-muted-foreground">
        Atualizado às {timeStr} · Auto-refresh a cada 30s
      </span>
    </div>
  );
}
