import { Cake } from "lucide-react";

import type { BirthdayThisMonthRow } from "@/lib/painel/birthday-utils";

type BirthdayMonthTileProps = {
  rows: BirthdayThisMonthRow[];
};

/** Cartão só de leitura: nomes + dia/mês, sem navegação e sem limite artificial. */
export function BirthdayMonthTile({ rows }: BirthdayMonthTileProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-[20px] border border-border bg-card p-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--status-info)/0.12)] text-[hsl(var(--status-info-foreground))]">
          <Cake className="size-4" aria-hidden />
        </span>
        <span className="mt-1 h-8 w-2 rounded-full bg-[hsl(var(--status-info))]" aria-hidden />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Aniversariantes do mês</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhum aniversariante neste mês.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {rows.map((row, index) => (
            <li key={`${row.fullName}-${row.dayMonth}-${index}`} className="text-sm">
              <span className="font-medium">{row.fullName}</span>
              <span className="text-muted-foreground"> {row.dayMonth}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
