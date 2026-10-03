import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { pieSlices } from "@/lib/billing/revenue-forecast";
import { cn } from "@/lib/utils";

type Props = {
  forecastCents: number;
  receivedCents: number;
  size?: "md" | "lg";
  className?: string;
};

export function ForecastPie({
  forecastCents,
  receivedCents,
  size = "md",
  className,
}: Props) {
  const slices = pieSlices(forecastCents, receivedCents);
  const box = size === "lg" ? "size-44" : "size-36";
  const hole = size === "lg" ? "inset-8" : "inset-7";

  if (slices.kind === "empty") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div
          className={cn(box, "rounded-full bg-zinc-200 dark:bg-zinc-800")}
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          Sem mensalidades previstas neste mês
        </p>
      </div>
    );
  }

  const receivedDeg = slices.over ? 360 : (slices.pct / 100) * 360;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(box, "relative rounded-full")}
        style={{
          background: `conic-gradient(#16a34a 0deg ${receivedDeg}deg, #e4e4e7 ${receivedDeg}deg 360deg)`,
        }}
        role="img"
        aria-label={`${slices.pct}% recebido da previsão`}
      >
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-card",
            hole,
          )}
        >
          <span className="font-display text-2xl font-bold tabular-nums">
            {slices.pct}%
          </span>
          <span className="text-[11px] text-muted-foreground">recebido</span>
        </div>
      </div>
      <ul className="space-y-0.5 text-center text-sm">
        <li>
          Previsão {formatMoneyBrFromCents(forecastCents)}
        </li>
        <li className="text-emerald-700 dark:text-emerald-400">
          Recebido {formatMoneyBrFromCents(receivedCents)}
        </li>
        {!slices.over ? (
          <li className="text-muted-foreground">
            A receber {formatMoneyBrFromCents(slices.remaining)}
          </li>
        ) : (
          <li className="font-medium text-amber-800 dark:text-amber-200">
            Acima da previsão
          </li>
        )}
      </ul>
    </div>
  );
}
