"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { PlanStatusBadge } from "@/components/lesson-plans/plan-status-badge";
import { PlanStatusSwitcher } from "@/components/lesson-plans/plan-status-switcher";
import { Button } from "@/components/ui/button";
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
import type { LessonPlanListRow } from "@/lib/data/lesson-plans-page";
import { formatDateTimeBR } from "@/lib/documents/formatters";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import { ROUTES, routePedagogicoPlano } from "@/lib/routes";

const KIND_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "adult", label: planKindLabels.adult },
  { value: "kids_1", label: planKindLabels.kids_1 },
  { value: "kids_2", label: planKindLabels.kids_2 },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Qualquer estado" },
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

function formatMonthLabelBR(monthYYYYMM: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(monthYYYYMM);
  if (!m) return monthYYYYMM;
  const date = new Date(`${monthYYYYMM}-01T12:00:00`);
  const raw = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function PlansList({ rows }: { rows: LessonPlanListRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get("mes") ?? "";
  const currentKind = searchParams.get("kind") ?? "all";
  const currentStatus = searchParams.get("status") ?? "all";
  const hasAnyFilter =
    currentMonth !== "" || currentKind !== "all" || currentStatus !== "all";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`${ROUTES.pedagogicoPlanos}${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function clearFilters() {
    router.push(ROUTES.pedagogicoPlanos);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
          <div className="space-y-1.5">
            <Label htmlFor="filtro-mes" className="text-xs font-medium text-muted-foreground">
              Mês
            </Label>
            <Input
              id="filtro-mes"
              type="month"
              value={currentMonth}
              className="min-h-11"
              onChange={(e) => setParam("mes", e.target.value)}
            />
            <p className="min-h-[1.125rem] truncate text-[11px] leading-tight text-muted-foreground">
              {currentMonth ? formatMonthLabelBR(currentMonth) : "Todos os meses"}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-tipo" className="text-xs font-medium text-muted-foreground">
              Tipo
            </Label>
            <Select value={currentKind} onValueChange={(v) => setParam("kind", v)}>
              <SelectTrigger id="filtro-tipo" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="min-h-[1.125rem]" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-status" className="text-xs font-medium text-muted-foreground">
              Estado
            </Label>
            <Select value={currentStatus} onValueChange={(v) => setParam("status", v)}>
              <SelectTrigger id="filtro-status" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="min-h-[1.125rem]" aria-hidden />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasAnyFilter ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 touch-manipulation"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          ) : null}
          <Button asChild className="min-h-11 touch-manipulation">
            <Link href={ROUTES.pedagogicoPlanoNovo}>Novo plano</Link>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border bg-card/50 p-6 text-center text-crm-sm text-muted-foreground">
          Sem planos para os filtros atuais.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="tabular-nums">{row.reference_month}</TableCell>
                  <TableCell>{planKindLabels[row.plan_kind]}</TableCell>
                  <TableCell>
                    <Link
                      href={routePedagogicoPlano(row.id)}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PlanStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTimeBR(row.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PlanStatusSwitcher
                      planId={row.id}
                      status={row.status}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
