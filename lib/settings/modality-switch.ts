import { MODALITY_LABELS, type AcademyModality } from "@/lib/modalities/catalog";

export type ModalitySwitchDraft = { target: AcademyModality | null };

export function selectSwitchTarget(target: AcademyModality): ModalitySwitchDraft {
  return { target };
}

export function cancelSwitch(): ModalitySwitchDraft {
  return { target: null };
}

export function modalitySwitchEffects(current: AcademyModality, target: AcademyModality): string[] {
  return [
    `A academia deixa de ser ${MODALITY_LABELS[current]} e passa a ser ${MODALITY_LABELS[target]}.`,
    audienceEffect(target),
    graduationEffect(target),
    "Nomes e preços dos planos comerciais permanecem. Nenhum aluno nem mensalidade é criado.",
    "Aluno, turma, aula, pagamento ou documento impedem a troca. Cancelar mantém a modalidade atual.",
  ];
}

function audienceEffect(target: AcademyModality): string {
  if (target === "jiu_jitsu") return "Os públicos Kids e Baby voltam a ficar disponíveis.";
  return "O público passa a ser só adulto, de 18 anos ou mais.";
}

function graduationEffect(target: AcademyModality): string {
  if (target === "boxing") return "Não há faixa, grau nem prontidão de graduação.";
  if (target === "judo") return "A graduação passa ao catálogo CBJ, sem prontidão automática.";
  if (target === "muay_thai") return "A graduação passa aos 19 khan da CBMTT, sem prontidão automática.";
  return "A graduação volta a ser por faixa e grau, com a prontidão já usada no Jiu-Jitsu.";
}
