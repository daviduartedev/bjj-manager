"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { voidPayment } from "@/actions/billing";
import { BillingIndicatorBadge } from "@/components/billing/billing-indicator-badge";
import { ReceiptViewerDialog } from "@/components/billing/receipt-viewer-dialog";
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog";
import { PageFrame } from "@/components/prototype/page-frame";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { formActionsClass, primaryActionClass } from "@/lib/ui/form-chrome";
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
import { Receipt, Wallet } from "lucide-react";

export function MensalidadesDetailClient({
  payload,
  frameVariant,
}: {
  payload: MensalidadesDetailPayload;
  frameVariant?: string;
}) {
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [receiptForPayment, setReceiptForPayment] = useState<
    | {
        paymentId: string;
        referenceMonth: string;
      }
    | null
  >(null);
  const [pendingVoid, startVoid] = useTransition();

  const snap = payload.snapshot;
  const indicator = snap?.indicator ?? "pending";

  const monthInputValue = payload.referenceMonth.slice(0, 7);

  function navigateMonth(v: string) {
    if (!v) return;
    const mes = `${v}-01`;
    const params = new URLSearchParams();
    params.set("mes", mes);
    const variant = new URLSearchParams(window.location.search).get("variant");
    if (variant === "A" || variant === "B" || variant === "C") {
      params.set("variant", variant);
    }
    router.replace(`${routeMensalidadesAluno(payload.studentId)}?${params.toString()}`);
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
    <PageFrame
      title={`Mensalidade · ${payload.fullName}`}
      emoji="🧾"
      icon={Receipt}
      tone="sky"
      secondary={{
        label: "Ver perfil do aluno",
        href: routeAlunoPerfil(payload.studentId),
      }}
    >
    <div className="space-y-8">
      <DashboardBackLink
        href={
          frameVariant === "A" || frameVariant === "B" || frameVariant === "C"
            ? `${ROUTES.mensalidades}?mes=${encodeURIComponent(payload.referenceMonth)}&variant=${frameVariant}`
            : `${ROUTES.mensalidades}?mes=${encodeURIComponent(payload.referenceMonth)}`
        }
      >
        Mensalidades
      </DashboardBackLink>

      <DashboardPanel icon={Wallet} title="Resumo" subtitle="Plano, valor e estado no mês">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="det-mes">Mês de referência</Label>
            <Input
              id="det-mes"
              type="month"
              value={monthInputValue}
              className="w-full"
              onChange={(e) => navigateMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="type-meta-label">Plano</p>
              <p className="font-medium text-foreground">
                {payload.planLabel ?? (
                  <span className="text-[hsl(var(--status-pending-foreground))]">Sem plano ativo</span>
                )}
              </p>
            </div>
            <div>
              <p className="type-meta-label">Valor efectivo</p>
              <p className="tabular-nums-crm font-medium">
                {payload.amountCentsExpected != null
                  ? formatMoneyBrFromCents(payload.amountCentsExpected)
                  : ","}
              </p>
            </div>
            <div>
              <p className="type-meta-label">Dia de vencimento</p>
              <p className="tabular-nums-crm font-medium">{payload.dueDay ?? ","}</p>
            </div>
            <div>
              <p className="type-meta-label">Estado (mês)</p>
              <BillingIndicatorBadge indicator={indicator} />
            </div>
          </div>
        </div>

        <div className={`mt-6 ${formActionsClass}`}>
          <Button
            type="button"
            className={primaryActionClass}
            disabled={payload.amountCentsExpected == null}
            onClick={() => setPayOpen(true)}
          >
            Registrar pagamento
          </Button>
        </div>
      </DashboardPanel>

      <DashboardPanel icon={Wallet} title="Histórico de pagamentos" subtitle="Mais recentes primeiro">
        {payload.payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Ainda não há pagamentos"
            description="Ainda não há linhas de pagamento registadas neste aluno."
            className="rounded-none border-0 bg-transparent shadow-none"
          />
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
                      {p.payment_method ?? ","}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profileFormatPaidAt(p.paid_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {p.status === "paid" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="min-h-11"
                            onClick={() =>
                              setReceiptForPayment({
                                paymentId: p.id,
                                referenceMonth: p.reference_month,
                              })
                            }
                          >
                            <Receipt className="mr-1.5 size-3.5" />
                            Comprovante
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-11 text-destructive hover:text-destructive"
                          disabled={pendingVoid}
                          onClick={() => confirmVoid(p.id)}
                        >
                          Estornar
                        </Button>
                      </div>
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

      {receiptForPayment ? (
        <ReceiptViewerDialog
          open={true}
          onOpenChange={(o) => {
            if (!o) setReceiptForPayment(null);
          }}
          paymentId={receiptForPayment.paymentId}
          studentName={payload.fullName}
          referenceMonthLabel={formatDateBR(receiptForPayment.referenceMonth) ?? undefined}
        />
      ) : null}
    </div>
    </PageFrame>
  );
}
