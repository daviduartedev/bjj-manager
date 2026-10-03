"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Award,
  Banknote,
  CalendarDays,
  Hand,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { RouteHeader } from "@/components/layout/route-header";
import { useState, type ReactNode } from "react";

import { ForecastPie } from "@/components/painel/forecast-pie";
import { PainelCustomizeControl } from "@/components/painel/painel-customize-dialog";
import { formatPainelDate, formatPainelMonth, moneyLabel } from "@/components/painel/painel-blocks";
import type { PainelDashboardProps } from "@/components/painel/painel-types";
import { MIX_META, attentionItems, mixTotal, shareLabel } from "@/components/painel/painel-attention";
import { studentKindLabels } from "@/lib/i18n/domain-enums";
import { isPainelBlockVisible, type PainelBlockId } from "@/lib/painel/hidden-blocks";
import { ROUTES, routeAlunosActivos, routeAulasSessao, routeMensalidadesComFiltro } from "@/lib/routes";
import { beltDistributionBarColor } from "@/lib/students/belt-chart-colors";
import { cn } from "@/lib/utils";

const card =
  "rounded-[20px] border border-black/[0.04] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] dark:border-border dark:bg-card";

const pillTone = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-100",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
};

export function PainelDashboard(props: PainelDashboardProps) {
  const monthLabel = formatPainelMonth(props.referenceMonth);
  const total = mixTotal(props.billingMix);
  const mixRows = MIX_META.map((item) => ({
    ...item,
    value: props.billingMix[item.key],
  }));
  const attention = attentionItems(props);
  const show = (id: PainelBlockId) => isPainelBlockVisible(props.hiddenBlocks, id);
  const showKpis =
    show("overdue") || show("active") || show("received") || show("alerts");
  const showAttention = show("attention");
  const showBelts = show("belts");

  return (
    <div
      className="min-h-[calc(100dvh-3rem)] bg-[#f3f4f6] px-3 pb-8 pt-0 text-foreground dark:bg-zinc-950 sm:px-4 lg:min-h-dvh lg:px-6"
      data-tour="page-painel"
    >
      <RouteHeader
        title="Painel"
        emoji="📊"
        context={`${props.accountName} · ${formatPainelDate(props.todayYmd)}`}
        icon={Hand}
        tone="amber"
        primary={{
          label: "Registrar pagamento",
          href: routeMensalidadesComFiltro("pendente"),
          icon: <Banknote className="size-4" aria-hidden />,
        }}
        secondary={{
          label: "Cadastrar aluno",
          href: ROUTES.alunosNovo,
          icon: <UserPlus className="size-4" aria-hidden />,
        }}
        extra={<PainelCustomizeControl hiddenBlocks={props.hiddenBlocks} />}
      />

      {showKpis ? (
      <section aria-label="Indicadores" className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 min-[520px]:gap-4 xl:grid-cols-4">
        {show("overdue") ? (
        <KpiCard
          href={routeMensalidadesComFiltro("atrasado")}
          icon={<AlertTriangle className="size-4" aria-hidden />}
          iconClass="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100"
          label="Atrasados"
          value={String(props.overdueCount)}
          chip={shareLabel(props.overdueCount, total)}
          chipHint="da carteira no mês"
          chipClass={props.overdueCount > 0 ? pillTone.rose : pillTone.emerald}
          bars={mixRows.map((row) => ({ value: row.value, color: row.key === "overdue" ? row.color : "#d4d4d8" }))}
        />
        ) : null}
        {show("active") ? (
        <KpiCard
          href={routeAlunosActivos()}
          icon={<Users className="size-4" aria-hidden />}
          iconClass="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100"
          label="Alunos ativos"
          value={String(props.activeStudentCount)}
          chip={`${props.distributionAdult.length + props.distributionKids.length} faixas`}
          chipHint="com aluno ativo"
          chipClass={pillTone.sky}
          bars={[...props.distributionAdult, ...props.distributionKids].slice(0, 6).map((slice, index) => ({
            value: slice.count,
            color: ["#2563eb", "#7c3aed", "#ea580c", "#16a34a", "#eab308", "#0ea5e9"][index] ?? "#71717a",
          }))}
        />
        ) : null}
        {show("received") ? (
        <KpiCard
          href={ROUTES.mensalidades}
          icon={<Wallet className="size-4" aria-hidden />}
          iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
          label="Recebido"
          value={moneyLabel(props.monthFinance.totalPaidReceivedCents)}
          chip={props.monthFinance.paidCount === 1 ? "1 pago" : `${props.monthFinance.paidCount} pagos`}
          chipHint={monthLabel}
          chipClass={pillTone.emerald}
          bars={props.monthFinance.paidByPlanLabel.slice(0, 6).map((row, index) => ({
            value: row.totalCents,
            color: ["#16a34a", "#22c55e", "#4ade80", "#15803d", "#86efac", "#166534"][index] ?? "#16a34a",
          }))}
        />
        ) : null}
        {show("alerts") ? (
        <KpiCard
          href={routeAlunosActivos()}
          icon={<Award className="size-4" aria-hidden />}
          iconClass="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100"
          label="Alertas de graduação"
          value={String(props.graduationAlertCount)}
          bars={[
            { value: props.dueToday.length, color: "#f59e0b" },
            { value: props.overdue14.length, color: "#e11d48" },
            { value: props.birthdayToday.length, color: "#8b5cf6" },
            { value: props.graduationAlertCount, color: "#0ea5e9" },
          ]}
        />
        ) : null}
      </section>
      ) : null}

      {show("forecast") ? (
      <section className={cn(card, "mt-3 p-4 sm:mt-4 sm:p-5")} aria-labelledby="painel-forecast-heading">
        <h2 id="painel-forecast-heading" className="text-base font-semibold">
          Previsão de receita
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{monthLabel}</p>
        <ForecastPie
          className="mt-4"
          size="lg"
          forecastCents={props.forecastCents}
          receivedCents={props.monthFinance.totalPaidReceivedCents}
        />
      </section>
      ) : null}

      {showAttention || showBelts ? (
      <section
        className={cn(
          "mt-3 grid grid-cols-1 items-stretch gap-3 min-[520px]:mt-4 min-[520px]:gap-4",
          showAttention && showBelts && "md:grid-cols-2 xl:grid-cols-5",
        )}
      >
        {showAttention ? (
          <AttentionBoard items={attention} className={showBelts ? "xl:col-span-3" : undefined} />
        ) : null}
        {showBelts ? (
          <BeltBarsCard
            adult={props.distributionAdult}
            kids={props.distributionKids}
            className={showAttention ? "xl:col-span-2" : undefined}
          />
        ) : null}
      </section>
      ) : null}

      {show("classes") ? (
      <section className={cn(card, "mt-3 p-4 sm:mt-4 sm:p-5")}>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-sky-600" aria-hidden />
          <h2 className="text-base font-semibold">Aulas de hoje</h2>
        </div>
        <TodaySessions sessions={props.todaySessions} nextSession={props.nextSession} />
      </section>
      ) : null}
    </div>
  );
}

function KpiCard(props: {
  href: string;
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
  chip?: string;
  chipHint?: string;
  chipClass?: string;
  bars: { value: number; color: string }[];
}) {
  const rows = props.bars.length > 0 ? props.bars : [{ value: 0, color: "#e4e4e7" }];
  return (
    <Link href={props.href} className={cn(card, "flex h-full min-w-0 flex-col p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full", props.iconClass)}>
          {props.icon}
        </span>
        <MiniBars rows={rows} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{props.label}</p>
      <p className="mt-1 font-display text-[1.65rem] font-bold leading-none tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-[2rem]">
        {props.value}
      </p>
      {props.chip || props.chipHint ? (
        <p className="mt-3 flex flex-wrap items-center gap-2">
          {props.chip ? (
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", props.chipClass)}>{props.chip}</span>
          ) : null}
          {props.chipHint ? (
            <span className="text-xs text-muted-foreground">{props.chipHint}</span>
          ) : null}
        </p>
      ) : null}
    </Link>
  );
}

function MiniBars(props: { rows: { value: number; color: string }[] }) {
  const max = Math.max(1, ...props.rows.map((row) => row.value));
  const width = 88;
  const slot = width / props.rows.length;
  return (
    <svg viewBox={`0 0 ${width} 40`} className="h-8 w-16 shrink-0 sm:h-10 sm:w-[5.5rem]" aria-hidden>
      {props.rows.map((row, index) => {
        const h = row.value <= 0 ? 3 : Math.max(6, (row.value / max) * 36);
        return (
          <rect
            key={index}
            x={index * slot + 1.5}
            y={40 - h}
            width={Math.max(4, slot - 4)}
            height={h}
            rx="3"
            fill={row.color}
          />
        );
      })}
    </svg>
  );
}

function AttentionBoard(props: { items: ReturnType<typeof attentionItems>; className?: string }) {
  const groups = [
    {
      reason: "Vence hoje",
      label: "Vence hoje",
      hint: "Mensalidade deste mês que vence hoje e ainda não foi paga.",
    },
    {
      reason: "Atraso +14 dias",
      label: "Atraso longo",
      hint: "Mensalidade atrasada há 14 dias ou mais.",
    },
    {
      reason: "Aniversário",
      label: "Aniversário",
      hint: "Aluno ativo que faz aniversário hoje.",
    },
    {
      reason: "Faixa ou grau",
      label: "Faixa ou grau",
      hint: "Tempo no grau passou de 4 meses, ou na faixa passou de 1 ano.",
    },
  ] as const;
  const firstWithRows = groups.findIndex((group) => props.items.some((item) => item.reason === group.reason));
  const [reason, setReason] = useState<(typeof groups)[number]["reason"]>(
    groups[firstWithRows === -1 ? 0 : firstWithRows].reason,
  );
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const current = groups.find((group) => group.reason === reason) ?? groups[0];
  const rows = props.items.filter((item) => item.reason === current.reason);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className={cn(card, "flex h-full min-w-0 flex-col p-4 sm:p-5", props.className)}>
      <h2 className="text-base font-semibold">Atenção</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Tipo de atenção">
        {groups.map((group) => {
          const count = props.items.filter((item) => item.reason === group.reason).length;
          const selected = group.reason === current.reason;
          return (
            <button
              key={group.reason}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                selected ? "bg-zinc-950 text-white" : "bg-[#f3f4f6] text-muted-foreground dark:bg-muted",
              )}
              onClick={() => {
                setReason(group.reason);
                setPage(0);
              }}
            >
              {group.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                  selected ? "bg-white text-zinc-950" : "bg-white text-foreground dark:bg-zinc-900",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{current.hint}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum aluno nesta lista.</p>
      ) : (
        <ul className="mt-3 divide-y divide-black/[0.06] dark:divide-border">
          {visible.map((item) => (
            <li key={item.id} className="py-2.5">
              <Link href={item.href} className="block truncate text-sm font-medium hover:text-primary">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rows.length > pageSize ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="rounded-full px-3 py-1.5 font-medium text-foreground disabled:opacity-40"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            Anterior
          </button>
          <span className="tabular-nums text-muted-foreground">
            {safePage + 1} de {pageCount}
          </span>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 font-medium text-foreground disabled:opacity-40"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}

function BeltBarsCard(props: {
  adult: PainelDashboardProps["distributionAdult"];
  kids: PainelDashboardProps["distributionKids"];
  className?: string;
}) {
  const [kind, setKind] = useState<"adult" | "kids">(props.adult.length > 0 ? "adult" : "kids");
  const slices = kind === "adult" ? props.adult : props.kids;
  const max = Math.max(1, ...slices.map((slice) => slice.count));
  const empty =
    kind === "adult"
      ? "Sem alunos adultos ativos com faixa registrada."
      : "Sem alunos kids ativos com faixa registrada.";

  return (
    <div className={cn(card, "flex h-full min-w-0 flex-col p-4 sm:p-5", props.className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Faixas</h2>
          <p className="mt-1 text-xs text-muted-foreground">Alunos ativos. Pessoas.</p>
        </div>
        <div className="inline-flex rounded-full bg-[#f3f4f6] p-1 dark:bg-muted" role="tablist" aria-label="Quadro de faixas">
          {(
            [
              ["adult", "Adulto"],
              ["kids", "Kids"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={kind === value}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                kind === value ? "bg-zinc-950 text-white" : "text-muted-foreground",
              )}
              onClick={() => setKind(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {slices.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-y-auto">
          {slices.map((slice) => {
            const width = slice.count <= 0 ? 0 : Math.max(8, Math.round((slice.count / max) * 100));
            return (
              <li key={slice.beltId} className="grid grid-cols-[minmax(0,5.75rem)_minmax(0,1fr)_auto] items-center gap-2">
                <span className="truncate text-xs text-foreground">{slice.label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-[#f3f4f6] dark:bg-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      background: beltDistributionBarColor(slice.slug, slice.kind),
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                    }}
                  />
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">{slice.count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TodaySessions(props: {
  sessions: PainelDashboardProps["todaySessions"];
  nextSession: PainelDashboardProps["nextSession"];
}) {
  if (props.sessions.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        {props.nextSession
          ? `Nenhuma sessão hoje. A próxima é ${props.nextSession.className}, ${formatPainelDate(props.nextSession.sessionDate)} às ${props.nextSession.startTime}.`
          : "Nenhuma sessão hoje."}{" "}
        <Link href={ROUTES.aulas} className="font-medium text-foreground underline-offset-4 hover:underline">
          Ver os próximos 7 dias
        </Link>
      </p>
    );
  }
  return (
    <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {props.sessions.map((session) => (
        <li key={session.id} className="min-w-52">
          <Link
            href={routeAulasSessao(session.id)}
            className="block rounded-2xl bg-[#f4f5f7] px-4 py-3 hover:bg-sky-50 dark:bg-muted"
          >
            <span className="text-sm font-semibold tabular-nums text-sky-700">{session.startTime}</span>
            <span className="mt-1 block truncate text-sm font-medium">{session.className}</span>
            <span className="text-xs text-muted-foreground">
              {studentKindLabels[session.classKind]} · {session.checkInCount} check-in
              {session.checkInCount === 1 ? "" : "s"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
