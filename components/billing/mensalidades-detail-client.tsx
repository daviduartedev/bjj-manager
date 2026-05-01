"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { voidPayment } from "@/actions/billing";
import { BillingIndicatorBadge } from "@/components/billing/billing-indicator-badge";
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateBR } from "@/lib/dates";
import type { MensalidadesDetailPayload } from "@/lib/data/mensalidades-detail";
import { ROUTES, routeAlunoPerfil, routeMensalidadesAluno } from "@/lib/routes";
import {
  formatMoneyBrFromCents,
  paymentStatusLabelPt,
} from "@/lib/students/payment-ui";
import { profileFormatPaidAt } from "@/lib/data/students-profile.shared";
import { Wallet } from "lucide-react";

export function MensalidadesDetailClient({
  payload,
}: {
  payload: MensalidadesDetailPayload;
}) {
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [pendingVoid, startVoid] = useTransition();

  const snap = payload.snapshot;
  const indicator = snap?.indicator ?? "pending";

  const monthInputValue = payload.referenceMonth.slice(0, 7);

  function navigateMonth(v: string) {
    if (!v) return;
    const mes = `${v}-01`;
    router.replace(`${routeMensalidadesAluno(payload.studentId)}?mes=${encodeURIComponent(mes)}`);
  }

  function confirmVoid(paymentId: string) {
    if (!window.confirm("Estornar este registo? O mês voltará ao estado derivado (pendente/atraso).")) {
      return;
    }
    startVoid(async () => {
      const r = await voidPayment({ paymentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Pagamento estornado.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Financeiro"
        intro={
          <DashboardBackLink
            href={`${ROUTES.mensalidades}?mes=${encodeURIComponent(payload.referenceMonth)}`}
          >
            Mensalidades
          </DashboardBackLink>
        }
        title={payload.fullName}
        description="Pagamentos e registro no mês selecionado."
        aside={
          <Button className="min-h-11 shadow-md shadow-primary/15" asChild variant="outline">
            <Link href={routeAlunoPerfil(payload.studentId)}>Ver perfil do aluno</Link>
          </Button>
        }
      />

      <DashboardPanel icon={Wallet} title="Resumo" subtitle="Plano, valor e estado no mês">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="det-mes">Mês de referência</Label>
            <Input
              id="det-mes"
              type="month"
              value={monthInputValue}
              className="min-h-11 w-full max-w-[14rem]"
              onChange={(e) => navigateMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="type-meta-label">Plano</p>
              <p className="font-medium text-foreground">
                {payload.planLabel ?? (
                  <span className="text-amber-700 dark:text-amber-400">Sem plano ativo</span>
                )}
              </p>
            </div>
            <div>
              <p className="type-meta-label">Valor efectivo</p>
              <p className="tabular-nums-crm font-medium">
                {payload.amountCentsExpected != null
                  ? formatMoneyBrFromCents(payload.amountCentsExpected)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="type-meta-label">Dia de vencimento</p>
              <p className="tabular-nums-crm font-medium">{payload.dueDay ?? "—"}</p>
            </div>
            <div>
              <p className="type-meta-label">Estado (mês)</p>
              <BillingIndicatorBadge indicator={indicator} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="min-h-11"
            disabled={payload.amountCentsExpected == null}
            onClick={() => setPayOpen(true)}
          >
            Registrar pagamento
          </Button>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Histórico de pagamentos" subtitle="Mais recentes primeiro">
        {payload.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            Ainda não há linhas de pagamento registadas.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Mês</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Pago em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payload.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {formatDateBR(p.reference_month)}
                    </TableCell>
                    <TableCell>{paymentStatusLabelPt(p.status)}</TableCell>
                    <TableCell className="text-right tabular-nums-crm">
                      {formatMoneyBrFromCents(p.amount_cents)}
                    </TableCell>
                    <TableCell className="max-w-[8rem] truncate text-muted-foreground">
                      {p.payment_method ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profileFormatPaidAt(p.paid_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-9 text-destructive hover:text-destructive"
                        disabled={pendingVoid}
                        onClick={() => confirmVoid(p.id)}
                      >
                        Estornar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DashboardPanel>

      <RecordPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        studentId={payload.studentId}
        defaultReferenceMonth={payload.referenceMonth}
        amountCents={payload.amountCentsExpected}
      />
    </div>
  );
}
