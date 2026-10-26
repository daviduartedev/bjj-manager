import { MessageCircle, Wallet } from "lucide-react";

import { pieSlices } from "@/lib/billing/revenue-forecast";
import type { PaymentReminderRow } from "@/lib/painel/payment-reminders";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { cn } from "@/lib/utils";

const shell =
  "rounded-[20px] border border-black/[0.04] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] dark:border-border dark:bg-card";

const avatarTones = [
  "bg-rose-100 text-rose-700",
  "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

type Props = {
  forecastCents: number;
  receivedCents: number;
  monthLabel: string;
  reminders: PaymentReminderRow[];
  className?: string;
};

export function MonthRevenuePair({
  forecastCents,
  receivedCents,
  monthLabel,
  reminders,
  className,
}: Props) {
  const slices = pieSlices(forecastCents, receivedCents);
  const empty = slices.kind === "empty";
  const over = slices.over;
  const receivedShare = empty ? 0 : over ? 100 : slices.pct;
  const openLabel = over ? "Acima" : "A receber";
  const openValue = empty ? "—" : over ? "Acima" : formatMoneyBrFromCents(slices.remaining);
  const rows = reminders.slice(0, 5);

  return (
    <div className={cn("grid items-stretch gap-3 lg:grid-cols-2", className)}>
      <section className={cn(shell, "p-5")} aria-label="Previsão de receita">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100">
            <Wallet className="size-4" aria-hidden />
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-muted dark:text-muted-foreground">
            {monthLabel}
          </span>
        </div>
        <div className="mt-5">
          <div className="flex h-3 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950" aria-hidden>
            <div
              className={cn("h-full rounded-full", over ? "bg-amber-400" : "bg-emerald-500")}
              style={{ width: empty ? "0%" : `${receivedShare}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {empty ? "Sem mensalidades previstas neste mês" : `${slices.pct}% recebido`}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
            <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-200/80">Recebido</p>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em] text-emerald-950 dark:text-emerald-50">
              {formatMoneyBrFromCents(receivedCents)}
            </p>
          </div>
          <div className={cn("rounded-2xl px-4 py-3", over ? "bg-amber-50 dark:bg-amber-950/40" : "bg-rose-50 dark:bg-rose-950/30")}>
            <p className={cn("text-xs font-medium", over ? "text-amber-800/80" : "text-rose-800/80")}>{openLabel}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em]",
                over ? "text-amber-950 dark:text-amber-50" : "text-rose-950 dark:text-rose-50",
              )}
            >
              {openValue}
            </p>
          </div>
        </div>
      </section>

      <section className={cn(shell, "p-5")} aria-label="Atrasados">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Atrasados</p>
          <span
            className={cn(
              "inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
              reminders.length > 0
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
            )}
          >
            {reminders.length}
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Ninguém atrasado neste mês.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((row) => (
              <li
                key={row.studentId}
                className="flex items-center gap-3 rounded-2xl bg-rose-50/70 px-3 py-2 dark:bg-rose-950/30"
              >
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    avatarTones[(row.fullName.trim().charCodeAt(0) || 0) % avatarTones.length],
                  )}
                  aria-hidden
                >
                  {row.fullName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{row.fullName}</p>
                {row.whatsappHref ? (
                  <a
                    href={row.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
                    aria-label={`WhatsApp para ${row.fullName}`}
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </a>
                ) : (
                  <span
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-muted"
                    title="Sem telefone"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
