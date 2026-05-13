"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BillingIndicatorBadge } from "@/components/billing/billing-indicator-badge";
import { BulkPayDialog } from "@/components/billing/bulk-pay-dialog";
import { ReceiptViewerDialog } from "@/components/billing/receipt-viewer-dialog";
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  MensalidadesStudentRow,
  MonthFinanceSummary,
} from "@/lib/data/mensalidades-page";
import {
  buildMensalidadesListSearchParams,
  type MensalidadesClientFilterKey,
  type MensalidadesPlanFilterKey,
} from "@/lib/billing/mensalidades-filtro-url";
import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";
import { ROUTES, routeMensalidadesAluno } from "@/lib/routes";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { cn } from "@/lib/utils";
import { Receipt, Wallet } from "lucide-react";

import { MensalidadesMonthFinancePanel } from "@/components/billing/mensalidades-month-finance-panel";

export type MensalidadesClientProps = {
  initialRows: MensalidadesStudentRow[];
  referenceMonth: string;
  /** **BUI-2.6**, hidratação a partir de `?filtro=` */
  initialFilter?: MensalidadesClientFilterKey;
  /** Hidratação a partir de `?tipo=` (plano + legado `kids`). */
  initialPlanFilter?: MensalidadesPlanFilterKey;
  monthFinance: MonthFinanceSummary;
};

type FilterKey =
  | "all"
  | MonthBillingIndicator;

function matchesFilter(row: MensalidadesStudentRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  return row.indicator === filter;
}

function matchesPlanFilter(
  row: MensalidadesStudentRow,
  plan: MensalidadesPlanFilterKey,
): boolean {
  if (plan === "all") return true;
  if (plan === "kids_either") {
    return row.planKind === "kids_1" || row.planKind === "kids_2";
  }
  return row.planKind === plan;
}

/** Filtros: mesma altura e tipografia em todos os controlos */
const filterControl =
  "h-9 min-h-9 w-full rounded-md border border-input bg-background px-3 py-0 text-xs shadow-sm";

function formatReferenceMonthCaption(isoFirstDay: string): string {
  const d = new Date(`${isoFirstDay.slice(0, 10)}T12:00:00`);
  const raw = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(d);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function MensalidadesClient({
  initialRows,
  referenceMonth,
  initialFilter = "all",
  initialPlanFilter = "all",
  monthFinance,
}: MensalidadesClientProps) {
  const router = useRouter();
  const rows = initialRows;
  const [nameQuery, setNameQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);
  const [planFilter, setPlanFilter] =
    useState<MensalidadesPlanFilterKey>(initialPlanFilter);
  useEffect(() => {
    setPlanFilter(initialPlanFilter);
  }, [initialPlanFilter]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payStudent, setPayStudent] = useState<MensalidadesStudentRow | null>(null);
  const [receiptStudent, setReceiptStudent] =
    useState<MensalidadesStudentRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (!matchesFilter(r, filter)) return false;
      if (!matchesPlanFilter(r, planFilter)) return false;
      if (q === "") return true;
      return r.fullName.toLowerCase().includes(q);
    });
  }, [rows, filter, planFilter, nameQuery]);

  function navigateMensalidades(opts: {
    mes?: string;
    filtro?: FilterKey;
    tipo?: MensalidadesPlanFilterKey;
  }) {
    router.replace(
      `${ROUTES.mensalidades}${buildMensalidadesListSearchParams({
        mes: opts.mes ?? referenceMonth,
        filtro: opts.filtro ?? filter,
        tipo: opts.tipo ?? planFilter,
      })}`,
    );
  }

  const allFilteredSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selected.has(r.studentId));

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const r of filteredRows) next.add(r.studentId);
      } else {
        for (const r of filteredRows) next.delete(r.studentId);
      }
      return next;
    });
  }

  const selectedVisibleRows = useMemo(
    () => filteredRows.filter((r) => selected.has(r.studentId)),
    [filteredRows, selected],
  );

  const bulkTotalCents = selectedVisibleRows.reduce((acc, r) => {
    if (r.amountCentsExpected == null) return acc;
    return acc + r.amountCentsExpected;
  }, 0);

  const bulkEligibleIds = selectedVisibleRows
    .filter((r) => r.amountCentsExpected != null)
    .map((r) => r.studentId);

  const monthInputValue = referenceMonth.slice(0, 7);
  const monthCaption = formatReferenceMonthCaption(referenceMonth);

  return (
    <div className="w-full max-w-[min(100%,112rem)] space-y-5">
      <DashboardPageHero
        badge="Financeiro"
        title="Mensalidades"
        description="Fechamento mensal: filtre, selecione e registre pagamentos."
        className="pb-4"
      />

      <div data-tour="mensalidades-resumo-mes">
        <MensalidadesMonthFinancePanel summary={monthFinance} monthCaption={monthCaption} />
      </div>

      <DashboardPanel
        icon={Wallet}
        title="Lista do mês"
        subtitle="Filtros e lista densa"
        contentClassName="p-3 sm:p-4"
      >
        <div className="rounded-xl border border-border/60 bg-muted/15 p-4" data-tour="page-mensalidades">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="mes-ref"
                className="text-xs font-medium text-muted-foreground"
              >
                Mês
              </Label>
              <Input
                id="mes-ref"
                type="month"
                value={monthInputValue}
                className={filterControl}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const mes = `${v}-01`;
                  navigateMensalidades({ mes });
                }}
              />
              <div className="min-h-[1.125rem]">
                <p className="truncate text-[11px] leading-tight text-muted-foreground/90">
                  {monthCaption}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="filtro-estado"
                className="text-xs font-medium text-muted-foreground"
              >
                Estado
              </Label>
              <Select
                value={filter}
                onValueChange={(v) => {
                  const next = v as FilterKey;
                  setFilter(next);
                  navigateMensalidades({ filtro: next });
                }}
              >
                <SelectTrigger id="filtro-estado" className={filterControl}>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="scholarship">Bolsista</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <div className="min-h-[1.125rem]" aria-hidden />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="filtro-plano"
                className="text-xs font-medium text-muted-foreground"
              >
                Plano
              </Label>
              <Select
                value={planFilter}
                onValueChange={(v) => {
                  const next = v as MensalidadesPlanFilterKey;
                  setPlanFilter(next);
                  navigateMensalidades({ tipo: next });
                }}
              >
                <SelectTrigger id="filtro-plano" className={filterControl}>
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="adult">Adulto</SelectItem>
                  <SelectItem value="kids_1">Kids 1</SelectItem>
                  <SelectItem value="kids_2">Kids 2</SelectItem>
                  <SelectItem value="kids_either">Kids 1 ou 2</SelectItem>
                </SelectContent>
              </Select>
              <div className="min-h-[1.125rem]" aria-hidden />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                htmlFor="busca-nome"
                className="text-xs font-medium text-muted-foreground"
              >
                Buscar nome
              </Label>
              <Input
                id="busca-nome"
                placeholder="Filtrar na lista…"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className={filterControl}
              />
              <div className="min-h-[1.125rem]" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => toggleSelectAllFiltered(!allFilteredSelected)}
            >
              {allFilteredSelected ? "Limpar" : "Seleccionar todos"}
            </Button>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {selectedVisibleRows.length} sel.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs font-semibold"
            disabled={bulkEligibleIds.length === 0}
            onClick={() => setBulkOpen(true)}
          >
            Marcar como pagos
          </Button>
        </div>

        <div className="mt-4 hidden md:block">
          <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
            <Table
              wrapperClassName="max-h-[min(calc(100dvh-13.5rem),880px)] overscroll-y-contain scroll-smooth"
              className="text-xs"
            >
              <TableHeader className="sticky top-0 z-20 bg-card/95 shadow-[0_1px_0_0_hsl(var(--border)/0.9)] backdrop-blur-sm [&_tr]:border-border/70">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="h-7 min-h-0 w-8 min-w-8 py-0 pl-2 pr-1">
                    <Checkbox
                      size="dense"
                      checked={allFilteredSelected}
                      onCheckedChange={() =>
                        toggleSelectAllFiltered(!allFilteredSelected)
                      }
                      aria-label="Seleccionar todos os visíveis"
                    />
                  </TableHead>
                  <TableHead className="h-7 min-h-0 py-0 pl-1 pr-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Aluno
                  </TableHead>
                  <TableHead className="h-7 min-h-0 py-0 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Plano
                  </TableHead>
                  <TableHead className="h-7 min-h-0 w-[6.5rem] py-0 px-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Valor
                  </TableHead>
                  <TableHead className="h-7 min-h-0 w-10 py-0 px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Venc.
                  </TableHead>
                  <TableHead className="h-7 min-h-0 py-0 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </TableHead>
                  <TableHead className="h-7 min-h-0 w-[8.5rem] py-0 pr-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ação
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="min-h-0 py-10 text-center text-xs text-muted-foreground"
                    >
                      Nenhum aluno corresponde aos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, idx) => (
                    <TableRow
                      key={row.studentId}
                      className={cn(
                        "border-border/50",
                        idx % 2 === 1 && "bg-muted/30",
                      )}
                    >
                      <TableCell className="min-h-0 py-0.5 pl-2 pr-1 align-middle">
                        <Checkbox
                          size="dense"
                          checked={selected.has(row.studentId)}
                          onCheckedChange={(v) =>
                            toggleRow(row.studentId, v === true)
                          }
                          aria-label={`Seleccionar ${row.fullName}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[14rem] min-h-0 truncate py-0.5 pl-1 pr-2 font-medium leading-tight">
                        <Link
                          href={`${routeMensalidadesAluno(row.studentId)}?mes=${encodeURIComponent(referenceMonth)}`}
                          className="text-primary underline-offset-2 hover:underline"
                          title={row.fullName}
                        >
                          {row.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[10rem] min-h-0 truncate py-0.5 px-2 text-muted-foreground leading-tight">
                        {row.planLabel ?? (
                          <span className="text-amber-700 dark:text-amber-400">Sem plano</span>
                        )}
                      </TableCell>
                      <TableCell className="min-h-0 py-0.5 px-2 text-right tabular-nums-crm leading-tight">
                        {row.amountCentsExpected != null
                          ? formatMoneyBrFromCents(row.amountCentsExpected)
                          : ","}
                      </TableCell>
                      <TableCell className="min-h-0 py-0.5 px-1 text-center tabular-nums-crm leading-tight">
                        {row.dueDay ?? ","}
                      </TableCell>
                      <TableCell className="min-h-0 py-0.5 px-2 align-middle leading-none">
                        <BillingIndicatorBadge indicator={row.indicator} compact />
                      </TableCell>
                      <TableCell className="min-h-0 py-0.5 pr-2 text-right leading-none">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 min-h-0 shrink-0 px-2 py-0 text-[11px] font-medium leading-none"
                            disabled={row.amountCentsExpected == null}
                            onClick={() => setPayStudent(row)}
                          >
                            Pagar
                          </Button>
                          {row.indicator === "paid" && row.paymentId ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 min-h-0 shrink-0 px-2 py-0 text-[11px] font-medium leading-none"
                              onClick={() => setReceiptStudent(row)}
                              title="Ver / gerar comprovante"
                              aria-label={`Comprovante de ${row.fullName}`}
                            >
                              <Receipt className="mr-1 size-3.5" />
                              Comprovante
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 space-y-2 md:hidden">
          {filteredRows.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Nenhum aluno corresponde aos filtros.
            </p>
          ) : (
            filteredRows.map((row) => (
              <div
                key={row.studentId}
                className="space-y-2 rounded-lg border border-border/80 bg-card p-2.5"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    size="dense"
                    checked={selected.has(row.studentId)}
                    onCheckedChange={(v) => toggleRow(row.studentId, v === true)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Link
                      href={`${routeMensalidadesAluno(row.studentId)}?mes=${encodeURIComponent(referenceMonth)}`}
                      className="block text-sm font-semibold leading-snug text-foreground hover:text-primary"
                    >
                      {row.fullName}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {row.planLabel ?? (
                        <span className="text-amber-700 dark:text-amber-400">Sem plano</span>
                      )}
                    </p>
                  </div>
                  <BillingIndicatorBadge indicator={row.indicator} compact />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span>
                    Valor:{" "}
                    <span className="tabular-nums-crm font-medium text-foreground">
                      {row.amountCentsExpected != null
                        ? formatMoneyBrFromCents(row.amountCentsExpected)
                        : ","}
                    </span>
                  </span>
                  <span>
                    Venc.:{" "}
                    <span className="tabular-nums-crm font-medium text-foreground">
                      {row.dueDay ?? ","}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 w-full text-xs"
                    disabled={row.amountCentsExpected == null}
                    onClick={() => setPayStudent(row)}
                  >
                    Registrar pagamento
                  </Button>
                  {row.indicator === "paid" && row.paymentId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-full text-xs"
                      onClick={() => setReceiptStudent(row)}
                    >
                      <Receipt className="mr-1.5 size-3.5" />
                      Ver comprovante
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardPanel>

      {payStudent ? (
        <RecordPaymentDialog
          open={true}
          onOpenChange={(o) => {
            if (!o) setPayStudent(null);
          }}
          studentId={payStudent.studentId}
          defaultReferenceMonth={referenceMonth}
          amountCents={payStudent.amountCentsExpected}
        />
      ) : null}

      {receiptStudent && receiptStudent.paymentId ? (
        <ReceiptViewerDialog
          open={true}
          onOpenChange={(o) => {
            if (!o) setReceiptStudent(null);
          }}
          paymentId={receiptStudent.paymentId}
          studentName={receiptStudent.fullName}
          referenceMonthLabel={monthCaption}
        />
      ) : null}

      <BulkPayDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        studentIds={bulkEligibleIds}
        referenceMonth={referenceMonth}
        totalCents={bulkTotalCents}
      />
    </div>
  );
}
