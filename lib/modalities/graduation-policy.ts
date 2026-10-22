import { validateStep } from "@/lib/graduation/belt-order";

import type { AcademyModality } from "./catalog";

/** Expansão do contrato; os campos e IDs legados de Jiu-Jitsu permanecem intactos. */
export type GraduationState =
  | { mode: "none"; modality: "boxing" }
  | {
      mode: "jiu_jitsu";
      modality: "jiu_jitsu";
      beltId: string;
      degree: number;
      graduatedAt: string | null;
    }
  | {
      mode: "referenced";
      modality: "judo" | "muay_thai";
      referenceId: string;
      rankCode: string;
      graduatedAt: string | null;
    };

export type GraduationPolicy =
  | { mode: "none"; modality: "boxing" }
  | { mode: "jiu_jitsu"; modality: "jiu_jitsu"; validateStep: typeof validateStep }
  | {
      mode: "referenced";
      modality: "judo" | "muay_thai";
      referenceId: "cbj-2023" | "cbmtt-19-khan";
    };

/** Adaptador de JJ delega às regras atuais; os novos catálogos entram nas fatias próprias. */
export function getGraduationPolicy(modality: AcademyModality): GraduationPolicy {
  switch (modality) {
    case "jiu_jitsu":
      return { mode: "jiu_jitsu", modality, validateStep };
    case "boxing":
      return { mode: "none", modality };
    case "judo":
      return { mode: "referenced", modality, referenceId: "cbj-2023" };
    case "muay_thai":
      return { mode: "referenced", modality, referenceId: "cbmtt-19-khan" };
  }
}
