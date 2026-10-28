import { MessageCircle, Wallet } from "lucide-react";

import { pieSlices } from "@/lib/billing/revenue-forecast";
import type { PaymentReminderRow } from "@/lib/painel/payment-reminders";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { cn } from "@/lib/utils";

const shell =
  "rounded-[20px] border border-border bg-card shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)]";

const avatarTones = [
  "bg-primary/10 text-primary",
  "bg-[hsl(var(--status-pending)/0.2)] text-[hsl(var(--status-pending-foreground))]",
  "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))]",
  "bg-secondary text-secondary-foreground",
  "bg-card text-foreground",
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
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))]">
            <Wallet className="size-4" aria-hidden />
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {monthLabel}
          </span>
        </div>
        <div className="mt-5">
          <div className="flex h-3 overflow-hidden rounded-full bg-primary/10" aria-hidden>
            <div
              className={cn(
                "h-full rounded-full",
                over ? "bg-[hsl(var(--status-pending))]" : "bg-[hsl(var(--status-paid))]",
              )}
              style={{ width: empty ? "0%" : `${receivedShare}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-[hsl(var(--status-paid-foreground))]">
            {empty ? "Sem mensalidades previstas neste mês" : `${slices.pct}% recebido`}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[hsl(var(--status-paid)/0.12)] px-4 py-3">
            <p className="text-xs font-medium text-[hsl(var(--status-paid-foreground))]">Recebido</p>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em] text-[hsl(var(--status-paid-foreground))]">
              {formatMoneyBrFromCents(receivedCents)}
            </p>
          </div>
          <div className={cn("rounded-2xl px-4 py-3", over ? "bg-[hsl(var(--status-pending)/0.18)]" : "bg-primary/10")}>
            <p className={cn("text-xs font-medium", over ? "text-[hsl(var(--status-pending-foreground))]" : "text-primary")}>{openLabel}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em]",
                over ? "text-[hsl(var(--status-pending-foreground))]" : "text-primary",
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
                ? "bg-[hsl(var(--status-overdue)/0.12)] text-[hsl(var(--status-overdue-foreground))]"
                : "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))]",
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
                className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--status-overdue)/0.12)] px-3 py-2"
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
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-primary-foreground shadow-sm"
                    aria-label={`WhatsApp para ${row.fullName}`}
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </a>
                ) : (
                  <span
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
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
