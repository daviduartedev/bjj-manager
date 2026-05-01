"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterX, ListFilter, MoreHorizontal, Pencil, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { deleteStudent } from "@/actions/students";
import { QuickEditDialog } from "@/components/students/quick-edit-dialog";
import { StudentAgeLabel } from "@/components/students/student-age";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { STUDENTS_PAGE_SIZE } from "@/lib/constants/students";
import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import type { ListStudentRow } from "@/lib/data/students-list";
import { ROUTES, routeAlunoEditar, routeAlunoPerfil } from "@/lib/routes";
import type { AlunosUrlState } from "@/lib/students/alunos-url";
import { stringifyAlunosSearchParams } from "@/lib/students/alunos-url";
import { beltLabelPt } from "@/lib/students/belt-labels";

type Props = {
  rows: ListStudentRow[];
  total: number;
  urlState: AlunosUrlState;
  belts: BeltCatalogRow[];
  plans: PlanCatalogRow[];
};

export function StudentsList({
  rows,
  total,
  urlState,
  belts,
  plans,
}: Props) {
  const router = useRouter();
  const [localQ, setLocalQ] = useState(urlState.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quickStudent, setQuickStudent] = useState<ListStudentRow | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    setLocalQ(urlState.q);
  }, [urlState.q]);

  const pushUrl = useCallback(
    (next: AlunosUrlState) => {
      router.replace(`${ROUTES.alunos}${stringifyAlunosSearchParams(next)}`);
    },
    [router],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = localQ.trim();
      if (trimmed === urlState.q) return;
      pushUrl({
        ...urlState,
        q: trimmed,
        page: 1,
      });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQ, pushUrl, urlState]);

  const pageCount =
    total === 0
      ? 1
      : Math.ceil(total / STUDENTS_PAGE_SIZE);

  function beltLine(row: ListStudentRow): string {
    if (!row.belt) return "—";
    return `${beltLabelPt(row.belt.slug, row.belt.kind)} · grau ${row.current_degree}`;
  }

  async function handleDeactivate(student: ListStudentRow) {
    if (
      !confirm(
        `Desativar ${student.full_name}? O aluno passará a Inativo e permanece na lista.`,
      )
    ) {
      return;
    }
    const r = await deleteStudent(student.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Aluno desativado.");
    router.refresh();
  }

  const hasFilters =
    urlState.q !== "" ||
    urlState.kind !== "all" ||
    urlState.status !== "all" ||
    urlState.sort !== "name";

  const emptyNoFilters = total === 0 && !hasFilters;

  const thClass =
    "text-crm-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/90 shadow-md ring-1 ring-[hsl(var(--status-info))/0.14]">
        <div className="flex items-center gap-2 border-b border-border/70 bg-gradient-to-r from-muted/90 via-muted/50 to-[hsl(var(--status-info)/0.06)] px-4 py-3.5 sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-background/90 text-[hsl(var(--status-info))] shadow-sm ring-1 ring-border/60">
            <ListFilter className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-crm-sm font-semibold text-foreground">Filtros e pesquisa</p>
            <p className="text-crm-xs text-muted-foreground">Refine a lista por nome, tipo e situação.</p>
          </div>
        </div>
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[200px] flex-1 space-y-2">
              <label className="type-field-label" htmlFor="student-search">
                Buscar por nome
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="student-search"
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                  placeholder="Nome do aluno…"
                  className="min-h-11 border-border/80 bg-background/80 pl-9 shadow-inner"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap">
              <div className="space-y-2">
                <span className="type-field-label">Tipo</span>
                <Select
                  value={urlState.kind}
                  onValueChange={(v) =>
                    pushUrl({
                      ...urlState,
                      kind: v as AlunosUrlState["kind"],
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="min-h-11 w-full border-border/80 bg-background/80 sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <span className="type-field-label">Situação</span>
                <Select
                  value={urlState.status}
                  onValueChange={(v) =>
                    pushUrl({
                      ...urlState,
                      status: v as AlunosUrlState["status"],
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="min-h-11 w-full border-border/80 bg-background/80 sm:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <span className="type-field-label">Ordenar</span>
                <Select
                  value={urlState.sort}
                  onValueChange={(v) =>
                    pushUrl({
                      ...urlState,
                      sort: v as AlunosUrlState["sort"],
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="min-h-11 w-full border-border/80 bg-background/80 sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A–Z)</SelectItem>
                    <SelectItem value="academy_start">Data de entrada</SelectItem>
                    <SelectItem value="updated_at">Última alteração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {emptyNoFilters ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-card via-card to-primary/[0.05] px-6 py-14 text-center shadow-sm ring-1 ring-primary/[0.08]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.09),transparent_55%)]" aria-hidden />
          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-inner ring-1 ring-primary/25">
            <Users className="size-8" aria-hidden />
          </div>
          <p className="type-card-heading relative">Ainda não há alunos</p>
          <p className="type-lead relative mx-auto mt-2 max-w-md">
            Cadastre o primeiro aluno para começar a usar o sistema.
          </p>
          <Button className="relative mt-8 min-h-11 shadow-md shadow-primary/15" asChild>
            <Link href={ROUTES.alunosNovo}>Cadastrar primeiro aluno</Link>
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--status-info)/0.35)] bg-gradient-to-br from-card via-card to-[hsl(var(--status-info)/0.07)] px-6 py-12 text-center shadow-md ring-1 ring-[hsl(var(--status-info))/0.12]">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[hsl(var(--status-info)/0.15)] text-[hsl(var(--status-info))] ring-1 ring-[hsl(var(--status-info))/0.25]">
            <FilterX className="size-7" aria-hidden />
          </div>
          <p className="type-card-heading">Nenhum resultado</p>
          <p className="type-lead mx-auto mt-2 max-w-sm">
            Nenhum aluno corresponde aos filtros atuais. Ajuste a pesquisa ou limpe os filtros.
          </p>
          <div className="mt-6">
            <Button variant="outline" className="min-h-11 border-[hsl(var(--status-info)/0.4)] bg-background/80" asChild>
              <Link href={ROUTES.alunos}>Limpar filtros</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Users className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-crm-sm font-semibold text-foreground">
                  {total === 1 ? "1 aluno" : `${total} alunos`}
                  {pageCount > 1 ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · Página {urlState.page} de {pageCount}
                    </span>
                  ) : null}
                </p>
                <p className="text-crm-xs text-muted-foreground">Toque na linha ou cartão para ver o perfil.</p>
              </div>
            </div>
            {hasFilters ? (
              <Badge
                variant="outline"
                className="w-fit border-[hsl(var(--status-pending)/0.45)] bg-[hsl(var(--status-pending)/0.12)] font-medium text-[hsl(var(--status-pending-foreground))]"
              >
                Filtros ativos
              </Badge>
            ) : null}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border/90 bg-card shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06] lg:block">
            <Table>
              <TableHeader className="bg-gradient-to-b from-muted/95 to-muted/55 [&_tr]:border-border/70">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={thClass}>Nome</TableHead>
                  <TableHead className={thClass}>Faixa / grau</TableHead>
                  <TableHead className={thClass}>Idade</TableHead>
                  <TableHead className={thClass}>Situação</TableHead>
                  <TableHead className={`${thClass} w-[72px] text-right`}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-border/60 transition-colors hover:bg-[hsl(var(--status-info)/0.07)] data-[state=selected]:bg-muted"
                    onClick={() => router.push(routeAlunoPerfil(row.id))}
                  >
                    <TableCell className="font-semibold text-foreground">{row.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{beltLine(row)}</TableCell>
                    <TableCell className="tabular-nums-crm text-muted-foreground">
                      <StudentAgeLabel birthDate={row.birth_date} />
                    </TableCell>
                    <TableCell>
                      <StudentStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        row={row}
                        onQuick={() => {
                          setQuickStudent(row);
                          setQuickOpen(true);
                        }}
                        onDeactivate={() => handleDeactivate(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 lg:hidden">
            {rows.map((row) => (
              <div
                key={row.id}
                className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-md ring-1 ring-primary/[0.05] transition-shadow hover:shadow-lg"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-[hsl(var(--status-info))]"
                  aria-hidden
                />
                <div className="p-4 pl-5">
                  <button
                    type="button"
                    className="w-full rounded-lg text-left outline-none ring-offset-background transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => router.push(routeAlunoPerfil(row.id))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold text-foreground">{row.full_name}</p>
                        <p className="text-crm-sm text-muted-foreground">{beltLine(row)}</p>
                        <p className="text-crm-sm text-muted-foreground tabular-nums-crm">
                          <StudentAgeLabel birthDate={row.birth_date} />
                        </p>
                      </div>
                      <StudentStatusBadge status={row.status} />
                    </div>
                  </button>
                  <div className="mt-4 flex justify-end border-t border-border/60 pt-4">
                    <RowActions
                      row={row}
                      onQuick={() => {
                        setQuickStudent(row);
                        setQuickOpen(true);
                      }}
                      onDeactivate={() => handleDeactivate(row)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 shadow-inner">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 min-w-[44px] border-border/90 bg-card shadow-sm"
                disabled={urlState.page <= 1}
                onClick={() =>
                  pushUrl({ ...urlState, page: Math.max(1, urlState.page - 1) })
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 min-w-[44px] border-border/90 bg-card shadow-sm"
                disabled={urlState.page >= pageCount}
                onClick={() =>
                  pushUrl({
                    ...urlState,
                    page: Math.min(pageCount, urlState.page + 1),
                  })
                }
              >
                Seguinte
              </Button>
            </div>
          ) : null}
        </>
      )}

      <QuickEditDialog
        student={quickStudent}
        belts={belts}
        plans={plans}
        open={quickOpen}
        onOpenChange={(o) => {
          setQuickOpen(o);
          if (!o) setQuickStudent(null);
        }}
      />
    </div>
  );
}

function RowActions({
  row,
  onQuick,
  onDeactivate,
}: {
  row: ListStudentRow;
  onQuick: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        aria-label="Edição rápida"
        onClick={(e) => {
          e.stopPropagation();
          onQuick();
        }}
      >
        <Pencil className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 text-muted-foreground hover:bg-[hsl(var(--status-info)/0.12)] hover:text-[hsl(var(--status-info))]"
            aria-label="Mais acções"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onQuick();
            }}
          >
            Edição rápida
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={routeAlunoEditar(row.id)}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              Editar ficha completa
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeactivate();
            }}
          >
            Desativar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
