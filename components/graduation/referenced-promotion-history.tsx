import type { RankPromotionRow } from "@/lib/modalities/referenced-promotion";
import { findReferencedRank, type ReferencedGraduationFields } from "@/lib/modalities/referenced-ranks";
import { formatDateBR } from "@/lib/dates";
import { ReferencedRankDisplay } from "./referenced-rank-display";
import { Card, CardContent } from "@/components/ui/card";

/** O primeiro evento conserva o estado preexistente, inclusive sua data desconhecida. */
export function ReferencedPromotionHistory({ events, current }: { events: RankPromotionRow[]; current: ReferencedGraduationFields }) {
  const first = events.at(-1);
  const priorRank = findReferencedRank(first?.reference_id ?? current.graduation_reference_id, first?.from_rank_code ?? current.current_rank_code);
  const priorDate = first ? first.from_rank_date : current.current_rank_date;
  return <div className="space-y-3">
    {events.length === 0 ? <p className="text-sm text-muted-foreground">Ainda não há eventos de promoção registrados.</p> : null}
    {events.map(event => {
      const to = findReferencedRank(event.reference_id, event.to_rank_code);
      const from = findReferencedRank(event.reference_id, event.from_rank_code);
      return <Card key={event.id}><CardContent className="space-y-2 p-4">
        <p className="text-sm font-medium">{formatDateBR(event.granted_on)}</p>
        {to ? <ReferencedRankDisplay rank={to} compact /> : null}
        <p className="text-xs text-muted-foreground">De {from?.label ?? event.from_rank_code} · data anterior: {formatDateBR(event.from_rank_date) ?? "desconhecida"}</p>
        {event.was_skip ? <p className="text-sm font-medium">Salto no catálogo · rastreabilidade Casca</p> : null}
        {event.guidance_exceptions.length ? <p className="text-sm">Exceção à orientação padrão CBJ: {event.guidance_exceptions.map(e => e === "age" ? "idade" : "carência").join(" e ")}.</p> : null}
        {event.reason ? <p className="whitespace-pre-wrap break-words text-sm"><span className="font-medium">Justificativa: </span>{event.reason}</p> : null}
        <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Orientação considerada no registro</summary><p className="mt-2">{event.guidance_basis}</p></details>
      </CardContent></Card>;
    })}
    <Card><CardContent className="space-y-2 p-4">
      <p className="text-sm text-muted-foreground">Graduação preexistente informada na ficha; sem reconstrução de eventos anteriores.</p>
      {priorRank ? <ReferencedRankDisplay rank={priorRank} compact /> : null}
      <p className="text-sm text-muted-foreground">Data: {formatDateBR(priorDate) ?? "desconhecida"}</p>
    </CardContent></Card>
  </div>;
}
