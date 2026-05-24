"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SessionCheckInRow } from "@/lib/data/class-session-check-ins";

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

function formatCheckinTime(iso: string): string {
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
  initialCheckIns: SessionCheckInRow[];
};

export function SessionCheckInsPanel({ initialCheckIns }: Props) {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, [initialCheckIns]);

  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  if (checkIns.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Nenhum aluno fez check-in nesta sessão ainda.
        </p>
        <RefreshButton lastRefresh={lastRefresh} onRefresh={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-lg border">
        {checkIns.map((ci) => {
          const badge = BILLING_BADGE[ci.billingIndicator] ?? BILLING_BADGE.pending;
          return (
            <li
              key={ci.checkInId}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{ci.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  Check-in às {formatCheckinTime(ci.checkedInAt)}
                </p>
              </div>
              <Badge variant={badge.variant} className="shrink-0 text-xs">
                {badge.label}
              </Badge>
            </li>
          );
        })}
      </ul>

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
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="mr-2 size-4" aria-hidden />
        Atualizar
      </Button>
      <span className="text-xs text-muted-foreground">
        Atualizado às {timeStr} · Auto-refresh a cada 30s
      </span>
    </div>
  );
}
