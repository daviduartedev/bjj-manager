"use client";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferencedRankDisplay } from "@/components/graduation/referenced-rank-display";
import { getGraduationPolicy } from "@/lib/modalities/graduation-policy";
import { getReferencedRanks, JUDO_REFERENCE } from "@/lib/modalities/referenced-ranks";
import type { AcademyModality } from "@/lib/modalities/catalog";
import type { ReferencedGraduationFields as GraduationFields } from "@/lib/modalities/referenced-ranks";

/** Mesmo controle para cadastro e edição; a seleção da data desconhecida grava null real. */
export function ReferencedGraduationFields({ modality, disabled }: {
  modality: AcademyModality; disabled: boolean;
}) {
  const rankForm = useFormContext<GraduationFields>();
  const unknown = rankForm.watch("current_rank_date") === null;
  const policy = getGraduationPolicy(modality);
  if (policy.mode !== "referenced") return null;
  return <div className="space-y-4">
    <FormField control={rankForm.control} name="current_rank_code" render={({ field }) => <FormItem>
      <FormLabel>Graduação atual</FormLabel>
      <Select disabled={disabled} value={field.value ?? undefined} onValueChange={code => {
        field.onChange(code);
        rankForm.setValue("graduation_reference_id", policy.referenceId, { shouldDirty: true });
      }}>
        <FormControl><SelectTrigger><SelectValue placeholder="Escolha a graduação" /></SelectTrigger></FormControl>
        <SelectContent>{getReferencedRanks(modality).map(rank => <SelectItem key={rank.code} value={rank.code} textValue={rank.label}>
          <ReferencedRankDisplay rank={rank} compact />
        </SelectItem>)}</SelectContent>
      </Select>
      <FormDescription>Graduação concedida anteriormente pode ser cadastrada diretamente, sem reconstruir o histórico.</FormDescription>
      <FormMessage />
    </FormItem>} />
    <FormField control={rankForm.control} name="current_rank_date" render={({ field }) => <FormItem>
      <FormLabel>Data da graduação atual</FormLabel>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
        <Checkbox disabled={disabled} checked={unknown} onCheckedChange={checked => field.onChange(checked === true ? null : "")} />
        Data não informada
      </label>
      {!unknown ? <FormControl><Input type="date" disabled={disabled} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} onBlur={field.onBlur} name={field.name} ref={field.ref} /></FormControl> : null}
      <FormDescription>A entrada na academia é independente desta data. Sem data, o tempo na graduação fica indisponível.</FormDescription>
      <FormMessage />
    </FormItem>} />
    {modality === "judo" ? <p className="text-xs text-muted-foreground"><a href={JUDO_REFERENCE.sourceUrl} target="_blank" rel="noreferrer" className="underline">Catálogo CBJ 2023</a>. {JUDO_REFERENCE.limitation}</p> : null}
  </div>;
}
