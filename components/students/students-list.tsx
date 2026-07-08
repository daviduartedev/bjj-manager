"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterX, ListFilter, MoreHorizontal, Pencil, Search, SlidersHorizontal, Users } from "lucide-react";
import { toast } from "sonner";

import {
  archiveStudent,
  deleteStudent,
  removeStudentRecord,
  undoRemoveStudentRecord,
  unarchiveStudent,
} from "@/actions/students";
import { QuickEditDialog } from "@/components/students/quick-edit-dialog";
import { BeltIllustration } from "@/components/graduation/belt-illustration";
import { StudentAgeLabel } from "@/components/students/student-age";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { StudentExemptBadge } from "@/components/students/student-exempt-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { formatDateBR } from "@/lib/dates";
import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import type { ListStudentRow } from "@/lib/data/students-list";
import { ROUTES, routeAlunoEditar, routeAlunoPerfil } from "@/lib/routes";
import {
  ALUNOS_LIST_COLUMN_LABELS,
  ALUNOS_LIST_COLUMNS,
  DEFAULT_ALUNOS_LIST_COLUMNS,
  toggleAlunosListColumn,
  type AlunosListColumn,
} from "@/lib/students/alunos-list-columns";
import type { AlunosUrlState } from "@/lib/students/alunos-url";
import { stringifyAlunosSearchParams } from "@/lib/students/alunos-url";
import { beltWithDegreeLine } from "@/lib/students/belt-labels";
import { StudentWeightInlineEdit } from "@/components/students/student-weight-inline-edit";

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

  const visibleCols = ALUNOS_LIST_COLUMNS.filter((c) =>
    urlState.colunas.includes(c),
  );

  function showCol(col: AlunosListColumn): boolean {
    return urlState.colunas.includes(col);
  }

  function beltLine(row: ListStudentRow): string {
    if (!row.belt) return "–";
    return beltWithDegreeLine(row.belt.slug, row.belt.kind, row.current_degree);
  }

  function BeltFaixaCell({ row }: { row: ListStudentRow }) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {row.belt ? (
          <BeltIllustration
            slug={row.belt.slug}
            kind={row.belt.kind}
            degree={row.current_degree}
            compact
          />
        ) : null}
        <span className="text-crm-sm text-muted-foreground">{beltLine(row)}</span>
      </div>
    );
  }

  function renderColumnCell(col: AlunosListColumn, row: ListStudentRow) {
    switch (col) {
      case "faixa":
        return <BeltFaixaCell row={row} />;
      case "data_graduacao":
        return (
          <span className="tabular-nums-crm text-muted-foreground">
            {row.graduationConfiguredAtYmd
              ? (formatDateBR(row.graduationConfiguredAtYmd) ?? "–")
              : "–"}
          </span>
        );
      case "tempo_grau":
        return (
          <span className="text-crm-sm text-muted-foreground">
            {row.graduationDurationLine ?? "–"}
          </span>
        );
      case "peso":
        return (
          <StudentWeightInlineEdit
            studentId={row.id}
            graduationEventId={row.graduationEventId}
            weightKg={row.graduationWeightKg}
          />
        );
      case "idade":
        return (
          <span className="tabular-nums-crm text-muted-foreground">
            <StudentAgeLabel birthDate={row.birth_date} />
          </span>
        );
      case "situacao":
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <StudentStatusBadge status={row.status} />
            {row.is_exempt ? <StudentExemptBadge /> : null}
          </div>
        );
      default:
        return null;
    }
  }

  function MobileMetaLines({ row }: { row: ListStudentRow }) {
    const lines: { label: string; value: ReactNode }[] = [];
    if (showCol("data_graduacao")) {
      lines.push({
        label: ALUNOS_LIST_COLUMN_LABELS.data_graduacao,
        value: row.graduationConfiguredAtYmd
          ? (formatDateBR(row.graduationConfiguredAtYmd) ?? "–")
          : "–",
      });
    }
    if (showCol("tempo_grau")) {
      lines.push({
        label: ALUNOS_LIST_COLUMN_LABELS.tempo_grau,
        value: row.graduationDurationLine ?? "–",
      });
    }
    if (showCol("peso")) {
      lines.push({
        label: ALUNOS_LIST_COLUMN_LABELS.peso,
        value: (
          <StudentWeightInlineEdit
            studentId={row.id}
            graduationEventId={row.graduationEventId}
            weightKg={row.graduationWeightKg}
            className="w-[5.75rem]"
          />
        ),
      });
    }
    if (showCol("idade")) {
      lines.push({
        label: ALUNOS_LIST_COLUMN_LABELS.idade,
        value: <StudentAgeLabel birthDate={row.birth_date} />,
      });
    }
    if (!lines.length) return null;
    return (
      <dl className="mt-2 space-y-1 text-crm-xs text-muted-foreground">
        {lines.map(({ label, value }) => (
          <div key={label} className="flex flex-wrap gap-x-1.5">
            <dt className="font-medium text-foreground/80">{label}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    );
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

  async function handleArchive(student: ListStudentRow) {
    if (
      !confirm(
        `Arquivar ${student.full_name}? Deixa de aparecer na lista principal e nas mensalidades; o histórico financeiro mantém‑se.`,
      )
    )
      return;
    const r = await archiveStudent(student.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Aluno arquivado.");
    router.refresh();
  }

  async function handleRemoveSoft(student: ListStudentRow) {
    if (
      !confirm(
        `Remover o cadastro de ${student.full_name} da operação corrente? É uma remoção soft (distincta de Arquivar e de Inativo).`,
      )
    )
      return;
    const r = await removeStudentRecord(student.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Cadastro removido da operação corrente.");
    router.refresh();
  }

  async function handleUnarchive(student: ListStudentRow) {
    const r = await unarchiveStudent(student.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Aluno desarquivado.");
    router.refresh();
  }

  async function handleUndoRemove(student: ListStudentRow) {
    const r = await undoRemoveStudentRecord(student.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Remoção soft anulada.");
    router.refresh();
  }

  const hasFilters =
    urlState.q !== "" ||
    urlState.plan !== "all" ||
    urlState.status !== "all" ||
    urlState.lista !== "principal" ||
    urlState.sort !== "name";

  const emptyNoFilters = total === 0 && !hasFilters;

  const thClass =
    "text-crm-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40 border-l-[3px] border-l-primary/30" data-tour="page-alunos">
      <div className="border-b border-border/80 bg-gradient-to-r from-[hsl(var(--content-wash-mid)/0.55)] via-muted/35 to-transparent">
        <div className="flex items-center gap-2 px-4 py-3.5 sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.07] text-primary">
            <ListFilter className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-crm-sm font-semibold text-foreground">Filtros e pesquisa</p>
            <p className="text-crm-xs text-muted-foreground">
              Refine a lista por nome, plano e situação. Use as vistas para alunos arquivados ou removidos.
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-4 sm:px-5"
          data-tour="alunos-vistas-tabs"
        >
          <Button
            type="button"
            size="sm"
            variant={urlState.lista === "principal" ? "default" : "outline"}
            className="min-h-10"
            onClick={() =>
              pushUrl({ ...urlState, lista: "principal", page: 1 })
            }
          >
            Lista principal
          </Button>
          <Button
            type="button"
            size="sm"
            variant={urlState.lista === "arquivados" ? "default" : "outline"}
            className="min-h-10"
            onClick={() =>
              pushUrl({ ...urlState, lista: "arquivados", page: 1 })
            }
          >
            Arquivados
          </Button>
          <Button
            type="button"
            size="sm"
            variant={urlState.lista === "removidos" ? "default" : "outline"}
            className="min-h-10"
            onClick={() =>
              pushUrl({ ...urlState, lista: "removidos", page: 1 })
            }
          >
            Removidos
          </Button>
        </div>
        <div className="space-y-5 border-t border-border/60 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <label className="type-field-label block" htmlFor="student-search">
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
                  className="h-11 border-border/80 bg-background/80 pl-9 shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <span className="type-field-label block">Plano</span>
              <Select
                value={urlState.plan}
                onValueChange={(v) =>
                  pushUrl({
                    ...urlState,
                    plan: v as AlunosUrlState["plan"],
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="h-11 w-full border-border/80 bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="adult">Adulto</SelectItem>
                  <SelectItem value="kids_1">Kids 1</SelectItem>
                  <SelectItem value="kids_2">Kids 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <span className="type-field-label block">Situação</span>
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
                <SelectTrigger className="h-11 w-full border-border/80 bg-background/80">
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
            <div className="space-y-2 lg:col-span-2">
              <span className="type-field-label block">Ordenar</span>
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
                <SelectTrigger className="h-11 w-full border-border/80 bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome (A–Z)</SelectItem>
                  <SelectItem value="academy_start">Data de entrada</SelectItem>
                  <SelectItem value="updated_at">Última alteração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <span className="type-field-label block">Colunas</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-start gap-2 border-border/80 bg-background/80 font-normal shadow-sm"
                  >
                    <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
                    Exibir colunas
                  </Button>
                </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-3">
                    <p className="mb-3 text-crm-xs font-medium text-foreground">
                      Escolha o que aparece na lista
                    </p>
                    <ul className="space-y-2">
                      {ALUNOS_LIST_COLUMNS.map((col) => (
                        <li key={col}>
                          <label className="flex cursor-pointer items-center gap-2 text-crm-sm">
                            <Checkbox
                              checked={urlState.colunas.includes(col)}
                              onCheckedChange={() =>
                                pushUrl({
                                  ...urlState,
                                  colunas: toggleAlunosListColumn(
                                    urlState.colunas,
                                    col,
                                  ),
                                })
                              }
                            />
                            {ALUNOS_LIST_COLUMN_LABELS[col]}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 h-8 w-full text-crm-xs"
                      onClick={() =>
                        pushUrl({
                          ...urlState,
                          colunas: [...DEFAULT_ALUNOS_LIST_COLUMNS],
                        })
                      }
                    >
                      Restaurar padrão
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
          </div>
        </div>
      </div>

      {emptyNoFilters ? (
        <div className="border-t border-border px-6 py-14 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
            <Users className="size-7" aria-hidden />
          </div>
          <p className="type-card-heading">Ainda não há alunos</p>
          <p className="type-lead mx-auto mt-2 max-w-md">
            Cadastre o primeiro aluno para começar a usar o sistema.
          </p>
          <Button className="mt-8 min-h-11" asChild>
            <Link href={ROUTES.alunosNovo}>Cadastrar primeiro aluno</Link>
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="border-t border-border px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
            <FilterX className="size-6" aria-hidden />
          </div>
          <p className="type-card-heading">
            {urlState.lista === "arquivados"
              ? "Nenhum aluno arquivado"
              : urlState.lista === "removidos"
                ? "Nenhuma remoção soft"
                : "Nenhum resultado"}
          </p>
          <p className="type-lead mx-auto mt-2 max-w-sm">
            {urlState.lista === "principal"
              ? "Nenhum aluno corresponde aos filtros atuais. Ajuste a pesquisa ou limpe os filtros."
              : urlState.lista === "arquivados"
                ? "Ainda não há alunos arquivados nesta conta."
                : "Ainda não há cadastros com remoção soft nesta vista."}
          </p>
          <div className="mt-6">
            <Button variant="outline" className="min-h-11" asChild>
              <Link href={ROUTES.alunos}>Limpar filtros</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-t border-border bg-muted/25 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                <Users className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-crm-sm font-semibold text-foreground">
                  {total === 1 ? "1 aluno" : `${total} alunos`}
                  {pageCount > 1 ? (
                    <span className="font-normal text-muted-foreground">
                      {`, página ${urlState.page} de ${pageCount}`}
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

          <div className="hidden border-t border-border lg:block">
            <Table>
              <TableHeader className="border-b border-border bg-muted/40 [&_tr]:border-border">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={thClass}>Nome</TableHead>
                  {visibleCols.map((col) => (
                    <TableHead key={col} className={thClass}>
                      {ALUNOS_LIST_COLUMN_LABELS[col]}
                    </TableHead>
                  ))}
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
                    {visibleCols.map((col) => (
                      <TableCell
                        key={col}
                        className="text-muted-foreground"
                        onClick={col === "peso" ? (e) => e.stopPropagation() : undefined}
                      >
                        {renderColumnCell(col, row)}
                      </TableCell>
                    ))}
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        lista={urlState.lista}
                        row={row}
                        onQuick={() => {
                          setQuickStudent(row);
                          setQuickOpen(true);
                        }}
                        onDeactivate={() => handleDeactivate(row)}
                        onArchive={() => handleArchive(row)}
                        onRemoveSoft={() => handleRemoveSoft(row)}
                        onUnarchive={() => handleUnarchive(row)}
                        onUndoRemove={() => handleUndoRemove(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-0 border-t border-border lg:hidden">
            {rows.map((row) => (
              <div
                key={row.id}
                className="border-b border-border bg-card px-4 py-4 last:border-b-0"
              >
                <div className="p-0">
                  <button
                    type="button"
                    className="w-full rounded-lg text-left outline-none ring-offset-background transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => router.push(routeAlunoPerfil(row.id))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold text-foreground">{row.full_name}</p>
                        {showCol("faixa") ? <BeltFaixaCell row={row} /> : null}
                        <MobileMetaLines row={row} />
                      </div>
                      {showCol("situacao") ? (
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StudentStatusBadge status={row.status} />
                        {row.is_exempt ? <StudentExemptBadge /> : null}
                      </div>
                      ) : null}
                    </div>
                  </button>
                  <div className="mt-4 flex justify-end border-t border-border/60 pt-4">
                    <RowActions
                      lista={urlState.lista}
                      row={row}
                      onQuick={() => {
                        setQuickStudent(row);
                        setQuickOpen(true);
                      }}
                      onDeactivate={() => handleDeactivate(row)}
                      onArchive={() => handleArchive(row)}
                      onRemoveSoft={() => handleRemoveSoft(row)}
                      onUnarchive={() => handleUnarchive(row)}
                      onUndoRemove={() => handleUndoRemove(row)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border bg-muted/30 px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 min-w-[44px] bg-background"
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
                className="min-h-11 min-w-[44px] bg-background"
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
  lista,
  row,
  onQuick,
  onDeactivate,
  onArchive,
  onRemoveSoft,
  onUnarchive,
  onUndoRemove,
}: {
  lista: AlunosUrlState["lista"];
  row: ListStudentRow;
  onQuick: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onRemoveSoft: () => void;
  onUnarchive: () => void;
  onUndoRemove: () => void;
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
          {lista === "principal" ? (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              >
                Arquivar…
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSoft();
                }}
              >
                Remover cadastro (soft)…
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate();
                }}
              >
                Desativar
              </DropdownMenuItem>
            </>
          ) : lista === "arquivados" ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUnarchive();
              }}
            >
              Desarquivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUndoRemove();
              }}
            >
              Anular remoção soft
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
