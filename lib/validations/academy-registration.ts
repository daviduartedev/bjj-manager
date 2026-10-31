import { z } from "zod";

import { newPasswordField } from "@/lib/auth/password-policy";
import { ACADEMY_MODALITIES, type AcademyModality } from "@/lib/modalities/catalog";
import { DEFAULT_SUBSCRIPTION_PLAN_ID, OFFERED_SUBSCRIPTION_PLAN_IDS } from "@/lib/subscriptions/catalog";

const academyNameMessage = "O nome da academia precisa ter entre 2 e 80 caracteres.";
const displayNameMessage = "O seu nome precisa ter entre 2 e 80 caracteres.";

export const BRAZIL_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;

/** Prefixo IBGE da UF, usado para rejeitar pares estado/município inconsistentes. */
export const BRAZIL_STATE_IBGE_CODES: Record<(typeof BRAZIL_STATES)[number], string> = {
  RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
  MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27", SE: "28", BA: "29",
  MG: "31", ES: "32", RJ: "33", SP: "35",
  PR: "41", SC: "42", RS: "43",
  MS: "50", MT: "51", GO: "52", DF: "53",
};

export const BRAZIL_STATE_NAMES: Record<(typeof BRAZIL_STATES)[number], string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

/** Descrição informativa da academia; nunca usada como fonte de autorização. */
export const academyOnboardingSchema = z.object({
  city: z.string().trim().min(2, "Informe a cidade.").max(80),
  cityId: z.string().regex(/^\d{7}$/, "Selecione uma cidade válida."),
  state: z.enum(BRAZIL_STATES, { errorMap: () => ({ message: "Selecione o estado." }) }),
  stage: z.enum(["planning", "operating"], { errorMap: () => ({ message: "Selecione a fase da academia." }) }),
  studentRange: z.enum(["starting", "1-30", "31-100", "101-200", "201+"], { errorMap: () => ({ message: "Selecione o número aproximado de alunos." }) }),
  audiences: z.array(z.enum(["baby", "kids", "adult"])).min(1, "Selecione pelo menos um público.").max(3),
  priorities: z.array(z.enum(["students", "attendance", "graduation", "billing"])).min(1, "Selecione pelo menos uma prioridade.").max(4),
}).strict().superRefine((value, context) => {
  if (!value.cityId.startsWith(BRAZIL_STATE_IBGE_CODES[value.state])) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["cityId"],
      message: "A cidade selecionada não pertence ao estado informado.",
    });
  }
});

export type AcademyOnboarding = z.infer<typeof academyOnboardingSchema>;

export function registrationAudienceIssue(value: {
  modality: AcademyModality;
  onboarding?: { audiences: readonly string[] } | null;
}): string | null {
  if (value.modality === "jiu_jitsu" || !value.onboarding) return null;
  if (value.onboarding.audiences.every((audience) => audience === "adult")) return null;
  return "Esta modalidade atende adultos de 18 anos ou mais.";
}

/** Payload do cadastro público. Rejeita papel, id e redirect enviados pelo cliente. */
export const academyRegistrationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail.")
      .email("Digite um e-mail válido.")
      .transform((value) => value.toLowerCase()),
    password: newPasswordField,
    academyName: z.string().trim().min(2, academyNameMessage).max(80, academyNameMessage),
    displayName: z.string().trim().min(2, displayNameMessage).max(80, displayNameMessage),
    modality: z.enum(ACADEMY_MODALITIES, { errorMap: () => ({ message: "Selecione a modalidade da academia." }) }),
    subscriptionPlanId: z.enum(OFFERED_SUBSCRIPTION_PLAN_IDS, {
      errorMap: () => ({ message: "Selecione um plano válido do Casca." }),
    }).default(DEFAULT_SUBSCRIPTION_PLAN_ID),
    onboarding: academyOnboardingSchema.optional(),
  })
  .strict();

export type AcademyRegistrationInput = z.infer<typeof academyRegistrationSchema>;
