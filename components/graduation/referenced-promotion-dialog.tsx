"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { promoteReferencedStudent } from "@/actions/referenced-promotions";
import { assessReferencedPromotion } from "@/lib/modalities/referenced-promotion";
import { findReferencedRank, getReferencedRanks, JUDO_REFERENCE, MUAY_THAI_REFERENCE } from "@/lib/modalities/referenced-ranks";
import { ReferencedRankDisplay } from "./referenced-rank-display";
import { ReferencedGraduationReference } from "./referenced-graduation-reference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  modality: "judo" | "muay_thai";
  open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void;
  studentId: string; currentCode: string; currentDate: string | null; birthDate: string; today: string;
};
export function ReferencedPromotionDialog({ modality, open, onOpenChange, onSuccess, studentId, currentCode, currentDate, birthDate, today }: Props) {
  const reference = modality === "judo" ? JUDO_REFERENCE : MUAY_THAI_REFERENCE;
  const ranks = getReferencedRanks(modality);
  const current = findReferencedRank(reference.id, currentCode);
  const available = ranks.filter(r => r.ordinal > (current?.ordinal ?? Infinity));
  const nextCode = available[0]?.code ?? "";
  const [rankCode, setRankCode] = useState(nextCode);
  const [date, setDate] = useState(today);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setRankCode(nextCode); setDate(today); setReason(""); setErrors({}); setError(""); } }, [open, nextCode, today]);
  const assessment = assessReferencedPromotion({ modality, fromCode: currentCode, fromDate: currentDate, toCode: rankCode, birthDate, date });
  const target = findReferencedRank(reference.id, rankCode);
  const reasonRequired = assessment.wasSkip || assessment.exceptions.length > 0;
  function fieldError(field: string) { return errors[field]?.length ? <p id={`promotion-${field}-error`} className="text-sm text-destructive">{errors[field].join(" ")}</p> : null; }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
    <DialogHeader><DialogTitle>Registrar promoção de {modality === "judo" ? "Judô" : "Muay Thai"}</DialogTitle><DialogDescription>Registre uma graduação já concedida pelo professor.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setErrors({}); setError("");
      try {
        const result = await promoteReferencedStudent(studentId, { reference_id: reference.id, rank_code: rankCode, granted_on: date, reason });
        if (!result.ok) { setErrors(result.fieldErrors ?? {}); if (!result.fieldErrors) setError(result.error); return; }
        toast.success("Promoção registrada."); onOpenChange(false); onSuccess();
      } catch { setError("Não foi possível registrar esta promoção. Tente novamente."); }
      finally { setBusy(false); }
    }}>
      {current ? <div className="space-y-1 text-sm"><p className="text-muted-foreground">Graduação atual</p><ReferencedRankDisplay rank={current} compact /></div> : null}
      <div className="space-y-2"><Label htmlFor="promotion-rank">{modality === "muay_thai" ? "Khan concedido" : "Graduação concedida"}</Label>
        <select id="promotion-rank" className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rankCode} onChange={e => setRankCode(e.target.value)} required aria-invalid={!!errors.rank_code} aria-describedby={errors.rank_code ? "promotion-rank_code-error" : undefined}>
          {available.length ? available.map(r => <option key={r.code} value={r.code}>{r.label}</option>) : <option value="">Última graduação do catálogo</option>}
        </select>{fieldError("rank_code")}{target ? <ReferencedRankDisplay rank={target} compact /> : null}
      </div>
      <div className="space-y-2"><Label htmlFor="promotion-date">Data da graduação</Label><Input id="promotion-date" type="date" value={date} onChange={e => setDate(e.target.value)} min={currentDate ?? undefined} max={today} required aria-invalid={!!errors.granted_on} aria-describedby={errors.granted_on ? "promotion-granted_on-error" : undefined} />{fieldError("granted_on")}</div>
      <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm" role="status">
        {assessment.guidance.map(line => <p key={line}>{line}</p>)}
        {assessment.wasSkip ? <p className="font-medium">Salto no catálogo: justificativa obrigatória para rastreabilidade Casca.</p> : null}
        {assessment.exceptions.map(line => <p key={line} className="font-medium">{line} Registre a justificativa da exceção.</p>)}
      </div>
      <div className="space-y-2"><Label htmlFor="promotion-reason">Justificativa {reasonRequired ? "(obrigatória)" : "(opcional)"}</Label><Textarea id="promotion-reason" value={reason} onChange={e => setReason(e.target.value)} maxLength={2000} required={reasonRequired} aria-invalid={!!errors.reason} aria-describedby={errors.reason ? "promotion-reason-error" : undefined} />{fieldError("reason")}</div>
      <ReferencedGraduationReference modality={modality} />
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button><Button type="submit" disabled={busy || !rankCode}>{busy ? "Salvando…" : "Registrar promoção"}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
