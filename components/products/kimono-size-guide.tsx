import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info, Ruler } from "lucide-react";

const ADULT_SIZES = [
  {
    size: "A0",
    height: "1,45 m a 1,53 m",
    weight: "45 kg a 55 kg",
    note: null as string | null,
  },
  {
    size: "A1",
    height: "1,53 m a 1,62 m",
    weight: "55 kg a 65 kg",
    note: "Pequeno / médio",
  },
  {
    size: "A2",
    height: "1,62 m a 1,70 m",
    weight: "65 kg a 77 kg",
    note: "Médio / comum",
  },
  {
    size: "A3",
    height: "1,70 m a 1,80 m",
    weight: "77 kg a 90 kg",
    note: "Alto / pesado",
  },
  {
    size: "A4",
    height: "1,80 m a 1,90 m",
    weight: "90 kg a 115 kg",
    note: "Grande",
  },
  {
    size: "A5",
    height: "1,90 m a 2,00 m",
    weight: "115 kg a 140 kg",
    note: null,
  },
] as const;

const KIDS_SIZES = [
  { size: "M00", age: "aprox. 3 anos" },
  { size: "M0", age: "aprox. 4 anos" },
  { size: "M1", age: "5 a 6 anos" },
  { size: "M2", age: "7 a 8 anos" },
  { size: "M3", age: "9 a 10 anos" },
  { size: "M4", age: "aprox. 11 a 12 anos" },
] as const;

/**
 * Referência oficial de tamanhos de kimono (adulto A0–A5, infantil M00–M4) para consulta no controlo de stock.
 */
export function KimonoSizeGuide({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <p className="text-crm-sm leading-relaxed text-muted-foreground">
        Use esta tabela ao cadastrar variantes (ex.: <strong className="text-foreground">A2</strong>,{" "}
        <strong className="text-foreground">M1</strong>) para manter o mesmo padrão da academia.
      </p>

      <Card className="overflow-hidden border-bjj-blue/20 bg-gradient-to-br from-bjj-blue/[0.05] to-card shadow-md">
        <CardHeader className="border-b border-border/60 bg-card/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <span className="text-xl" aria-hidden>
              🥋
            </span>
            Kimonos adultos
            <span className="text-crm-sm font-normal text-muted-foreground">
              (masculino / unissex · A0 a A5)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-crm-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-crm-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Tam.</th>
                  <th className="px-4 py-3 font-medium">Altura</th>
                  <th className="px-4 py-3 font-medium">Peso</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Referência</th>
                </tr>
              </thead>
              <tbody>
                {ADULT_SIZES.map((row, i) => (
                  <tr
                    key={row.size}
                    className={cn(
                      "border-b border-border/70 transition-colors hover:bg-muted/30",
                      i % 2 === 0 ? "bg-card/50" : "bg-muted/[0.2]",
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums text-foreground">{row.size}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.height}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.weight}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {row.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 border-t border-border/80 bg-muted/25 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-bjj-blue" aria-hidden />
            <p className="text-crm-xs leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Nota:</strong> alguns fabricantes usam
              numeração ligeiramente diferente, como A1 (até 1,75 m) ou A3 (até 1,85 m / 95 kg). Em caso
              de dúvida, confira a etiqueta do modelo.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] to-card shadow-md">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <span className="text-xl" aria-hidden>
              👧👦
            </span>
            Kimonos infantis
            <span className="text-crm-sm font-normal text-muted-foreground">(M00 a M4)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KIDS_SIZES.map((row) => (
              <li
                key={row.size}
                className="flex items-baseline justify-between gap-3 rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm"
              >
                <span className="font-semibold tabular-nums text-foreground">{row.size}</span>
                <span className="text-right text-crm-sm text-muted-foreground">{row.age}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="flex items-start gap-2 text-crm-xs text-muted-foreground">
        <Ruler className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Lista de referência interna; ajuste os rótulos no estoque conforme os artigos reais em loja.
      </p>
    </div>
  );
}
