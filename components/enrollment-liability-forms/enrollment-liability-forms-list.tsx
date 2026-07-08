"use client";

import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { EnrollmentLiabilityFormRow } from "@/actions/enrollment-liability-forms";
import { EnrollmentLiabilityDocBadge } from "@/components/enrollment-liability-forms/signature-status-badge";
import { Badge } from "@/components/ui/badge";
import { routeMatriculaTermo } from "@/lib/routes";

function pendingDaysChip(updatedAt: string): string | null {
  const days = differenceInCalendarDays(new Date(), new Date(updatedAt));
  if (days <= 3) return null;
  if (days === 1) return "Pendente há 1 dia";
  return `Pendente há ${days} dias`;
}

type Props = {
  rows: EnrollmentLiabilityFormRow[];
};

export function EnrollmentLiabilityFormsList({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-crm-sm text-muted-foreground">
        Nenhuma matrícula/termo encontrada. Crie a primeira pelo botão acima.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Link
          key={row.id}
          href={routeMatriculaTermo(row.id)}
          className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <p className="font-medium">
              {row.number ?? "Rascunho"}{" "}
              {row.variant ? (
                <span className="text-crm-sm font-normal text-muted-foreground">
                  · {row.variant === "minor" ? "Menor" : "Adulto"}
                </span>
              ) : null}
            </p>
            <p className="text-crm-sm text-muted-foreground">
              {row.student_name ? (
                <span>{row.student_name}</span>
              ) : (
                "Aluno"
              )}
              {" · "}
              {format(new Date(row.created_at), "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EnrollmentLiabilityDocBadge
              status={row.status}
              signatureStatus={row.signature_status}
            />
            {row.signature_status === "awaiting_signature" ? (
              (() => {
                const label = pendingDaysChip(row.updated_at);
                return label ? (
                  <Badge variant="outline" className="text-amber-700">
                    {label}
                  </Badge>
                ) : null;
              })()
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
