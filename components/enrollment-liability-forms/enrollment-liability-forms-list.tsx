"use client";

import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { EnrollmentLiabilityFormRow } from "@/actions/enrollment-liability-forms";
import { EnrollmentLiabilityDocBadge } from "@/components/enrollment-liability-forms/signature-status-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { routeMatriculaTermo } from "@/lib/routes";
import { FileSignature } from "lucide-react";

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
      <EmptyState
        icon={FileSignature}
        title="Nenhuma matrícula/termo encontrada"
        description="Crie a primeira pelo botão acima. Os mesmos estados de rascunho e assinatura continuam a aplicar-se."
        className="rounded-none border-0 bg-transparent shadow-none"
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Link
          key={row.id}
          href={routeMatriculaTermo(row.id)}
          className="flex min-h-11 flex-col gap-2 rounded-lg border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
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
                  <Badge variant="outline" className="text-[hsl(var(--status-pending-foreground))]">
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
