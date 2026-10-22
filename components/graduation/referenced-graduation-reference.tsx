import type { AcademyModality } from "@/lib/modalities/catalog";
import { formatDateBR } from "@/lib/dates/format-br";
import { JUDO_REFERENCE, MUAY_THAI_REFERENCE } from "@/lib/modalities/referenced-ranks";

/** Identifica a referência adotada e seus limites junto à graduação esportiva. */
export function ReferencedGraduationReference({ modality }: { modality: AcademyModality }) {
  const reference = modality === "judo" ? JUDO_REFERENCE : modality === "muay_thai" ? MUAY_THAI_REFERENCE : null;
  if (!reference) return null;
  return <p className="text-xs text-muted-foreground">
    <a href={reference.sourceUrl} target="_blank" rel="noreferrer" className="underline">{reference.title}</a>.
    {" "}Consulta: {formatDateBR(reference.consultedAt)}. {reference.limitation}
  </p>;
}
