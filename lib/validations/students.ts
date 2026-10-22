import { z } from "zod";
import { findReferencedRank, type ReferencedGraduationFields } from "@/lib/modalities/referenced-ranks";
import { validateGraduatedAtNotFuture } from "@/lib/graduation/graduated-at";

import type { AcademyModality } from "@/lib/modalities/catalog";
import { getGraduationPolicy } from "@/lib/modalities/graduation-policy";
import { calculateAge } from "@/lib/dates/age";
import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";
import { isValidCpfDigits, onlyDigits } from "@/lib/students/input-masks";
import { isValidDegreeForBelt } from "@/lib/students/degree";
import type { PlanKind } from "@/lib/students/plan-kind";
import {
  BABY_MAX_AGE_YEARS,
  BABY_MIN_AGE_YEARS,
} from "@/lib/students/baby-age";
import {
  beltMatchesStudentKindForBeltRow,
  planKindMatchesStudentContext,
} from "@/lib/students/plan-kind";
import type { StudentKind } from "@/lib/students/degree";
import { weightKgSchema } from "@/lib/validations/graduations";

const referencedFields = {
  graduation_reference_id: z.string().nullish(),
  current_rank_code: z.string().nullish(),
  current_rank_date: z.string().nullable().optional(),
};
function validateReferencedFields(data: ReferencedGraduationFields & { current_belt_id?: string | null; current_degree?: number | null }, modality: AcademyModality, ctx: z.RefinementCtx) {
  const policy = getGraduationPolicy(modality);
  if (policy.mode === "referenced") {
    const rank = findReferencedRank(data.graduation_reference_id, data.current_rank_code);
    if (!rank || rank.modality !== modality || rank.referenceId !== policy.referenceId) ctx.addIssue({ code: "custom", message: "Escolha uma graduação válida desta modalidade.", path: ["current_rank_code"] });
    if (data.current_belt_id != null || data.current_degree != null) ctx.addIssue({ code: "custom", message: "Esta modalidade não usa faixa/grau de Jiu-Jitsu.", path: ["current_rank_code"] });
    if (data.current_rank_date !== null) {
      const error = data.current_rank_date === undefined ? "Informe a data ou selecione data desconhecida." : validateGraduatedAtNotFuture(data.current_rank_date);
      if (error) ctx.addIssue({ code: "custom", message: error, path: ["current_rank_date"] });
    }
  } else if (data.graduation_reference_id != null || data.current_rank_code != null || data.current_rank_date != null) {
    ctx.addIssue({ code: "custom", message: "Graduação de outra modalidade.", path: ["current_rank_code"] });
  }
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");

export const studentKindSchema = z.enum(["adult", "kids", "baby"]);

/** Status manipulável na UI deste ciclo (**STU-3**). */
export const studentUiStatusSchema = z.enum(["active", "inactive", "paused"]);

export const listSortSchema = z.enum(["name", "academy_start", "updated_at"]);
export type ListSortKey = z.infer<typeof listSortSchema>;

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export function buildStudentFullFormSchema(
  belts: { id: string; slug: string; kind: "adult" | "kids" }[],
  plans: { id: string; kind: PlanKind }[],
  modality: AcademyModality = "jiu_jitsu",
) {
  const policy = getGraduationPolicy(modality);
  const ungraded = policy.mode === "none";
  const legacyGraduation = policy.mode === "jiu_jitsu";
  const beltIds = new Set(belts.map((b) => b.id));
  const planById = new Map(plans.map((p) => [p.id, p] as const));

  return z
    .object({
      ...referencedFields,
      full_name: z.string().trim().min(2, "Informe o nome."),
      birth_date: isoDate,
      academy_start_date: isoDate,
      kind: studentKindSchema,
      current_belt_id: z.string().uuid("Escolha a faixa.").nullish(),
      current_degree: z.coerce.number().int().nullish(),
      is_exempt: z.boolean().default(false),
      plan_id: z.preprocess(emptyToUndef, z.string().uuid("Escolha o plano.").optional()),
      due_day: z.coerce.number().int().min(1).max(28).optional(),
      document: z.preprocess(emptyToUndef, z.string().trim().optional()),
      phone: z.preprocess(emptyToUndef, z.string().trim().optional()),
      guardian_phone: z.preprocess(emptyToUndef, z.string().trim().optional()),
      email: z.preprocess(emptyToUndef, z.string().trim().optional()),
      notes: z.preprocess(emptyToUndef, z.string().trim().optional()),
      weight_kg: weightKgSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      validateReferencedFields(data, modality, ctx);
      if (ungraded && (data.current_belt_id != null || data.current_degree != null)) {
        ctx.addIssue({ code: "custom", message: "Boxe não possui graduação.", path: ["current_belt_id"] });
      }
      if (legacyGraduation && !beltIds.has(data.current_belt_id ?? "")) {
        ctx.addIssue({
          code: "custom",
          message: "Faixa inválida.",
          path: ["current_belt_id"],
        });
        return;
      }
      const belt = belts.find((b) => b.id === data.current_belt_id);
      if (belt && !beltMatchesStudentKindForBeltRow(belt, data.kind as StudentKind)) {
        ctx.addIssue({
          code: "custom",
          message: "A faixa não corresponde ao tipo de aluno.",
          path: ["current_belt_id"],
        });
      }
      if (legacyGraduation && (!belt || data.current_degree == null || !isValidDegreeForBelt(belt.slug, belt.kind, data.current_degree))) {
        ctx.addIssue({
          code: "custom",
          message: "Grau inválido para esta faixa.",
          path: ["current_degree"],
        });
      }

      if (modality !== "jiu_jitsu") {
        const age = calculateAge(data.birth_date, toCalendarDateStringInAppTZ(new Date()));
        if (age == null || age < 18) ctx.addIssue({ code: "custom", message: "Esta modalidade atende pessoas de 18 anos ou mais.", path: ["birth_date"] });
        if (data.kind !== "adult") ctx.addIssue({ code: "custom", message: "Selecione Adulto nesta modalidade.", path: ["kind"] });
      }
      if (data.kind === "baby") {
        const today = toCalendarDateStringInAppTZ(new Date());
        const age = calculateAge(data.birth_date, today);
        if (
          age == null ||
          age < BABY_MIN_AGE_YEARS ||
          age > BABY_MAX_AGE_YEARS
        ) {
          ctx.addIssue({
            code: "custom",
            message: `Baby: idade entre ${BABY_MIN_AGE_YEARS} e ${BABY_MAX_AGE_YEARS} anos.`,
            path: ["birth_date"],
          });
        }
      }

      if (!data.is_exempt) {
        if (!data.plan_id) {
          ctx.addIssue({
            code: "custom",
            message: "Escolha o plano.",
            path: ["plan_id"],
          });
        }
        if (data.due_day == null) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o dia de vencimento.",
            path: ["due_day"],
          });
        }
      }

      if (data.plan_id) {
        const plan = planById.get(data.plan_id);
        if (
          !plan ||
          !planKindMatchesStudentContext({
            planKind: plan.kind,
            studentKind: data.kind as StudentKind,
            beltSlug: belt?.slug,
          })
        ) {
          ctx.addIssue({
            code: "custom",
            message: modality !== "jiu_jitsu" ? "Escolha um plano Adulto." : "Plano incompatível com o tipo e a faixa do aluno.",
            path: ["plan_id"],
          });
        }
      }

      if (data.document != null) {
        const d = onlyDigits(data.document);
        if (d.length > 0 && !isValidCpfDigits(d)) {
          ctx.addIssue({
            code: "custom",
            message: "CPF inválido.",
            path: ["document"],
          });
        }
      }
      if (data.phone != null) {
        const d = onlyDigits(data.phone);
        if (d.length > 0 && d.length < 10) {
          ctx.addIssue({
            code: "custom",
            message: "Telefone inválido.",
            path: ["phone"],
          });
        }
      }
      if (data.guardian_phone != null) {
        const d = onlyDigits(data.guardian_phone);
        if (d.length > 0 && d.length < 10) {
          ctx.addIssue({
            code: "custom",
            message: "Telefone do responsável inválido.",
            path: ["guardian_phone"],
          });
        }
      }
      if (data.email != null && data.email.length > 0) {
        const r = z.string().email("E-mail inválido.").safeParse(data.email);
        if (!r.success) {
          ctx.addIssue({
            code: "custom",
            message: r.error.errors[0]?.message ?? "E-mail inválido.",
            path: ["email"],
          });
        }
      }
    });
}

export type StudentFullFormValues = z.infer<
  ReturnType<typeof buildStudentFullFormSchema>
>;

/** Inclui `trial` só para leitura/submissão quando o registo já está em trial (DB). */
const quickEditStatusSchema = z.enum([
  "active",
  "inactive",
  "paused",
  "trial",
]);

export function buildQuickEditFormSchema(
  belts: { id: string; slug: string; kind: "adult" | "kids" }[],
  plans: { id: string; kind: PlanKind }[],
  studentKind: StudentKind,
  modality: AcademyModality = "jiu_jitsu",
) {
  const policy = getGraduationPolicy(modality);
  const ungraded = policy.mode === "none";
  const legacyGraduation = policy.mode === "jiu_jitsu";
  const beltIds = new Set(
    belts
      .filter((b) => beltMatchesStudentKindForBeltRow(b, studentKind))
      .map((b) => b.id),
  );
  const planById = new Map(plans.map((p) => [p.id, p] as const));

  return z
    .object({
      ...referencedFields,
      status: quickEditStatusSchema,
      is_exempt: z.boolean().default(false),
      plan_id: z.preprocess(emptyToUndef, z.string().uuid().optional()),
      due_day: z.coerce.number().int().min(1).max(28).optional(),
      current_belt_id: z.string().uuid().nullish(),
      current_degree: z.coerce.number().int().nullish(),
      weight_kg: weightKgSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      validateReferencedFields(data, modality, ctx);
      if (modality !== "jiu_jitsu" && studentKind !== "adult") ctx.addIssue({ code: "custom", message: "Esta modalidade atende apenas Adulto.", path: ["plan_id"] });
      if (ungraded && (data.current_belt_id != null || data.current_degree != null)) {
        ctx.addIssue({ code: "custom", message: "Boxe não possui graduação.", path: ["current_belt_id"] });
      }
      if (legacyGraduation && !beltIds.has(data.current_belt_id ?? "")) {
        ctx.addIssue({
          code: "custom",
          message: "Faixa inválida.",
          path: ["current_belt_id"],
        });
        return;
      }
      const belt = belts.find((b) => b.id === data.current_belt_id);
      if (legacyGraduation && (!belt || data.current_degree == null || !isValidDegreeForBelt(belt.slug, belt.kind, data.current_degree))) {
        ctx.addIssue({
          code: "custom",
          message: "Grau inválido para esta faixa.",
          path: ["current_degree"],
        });
      }

      if (!data.is_exempt) {
        if (!data.plan_id) {
          ctx.addIssue({
            code: "custom",
            message: "Escolha o plano.",
            path: ["plan_id"],
          });
        }
        if (data.due_day == null) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o dia de vencimento.",
            path: ["due_day"],
          });
        }
      }

      if (!data.plan_id) {
        return;
      }

      const plan = planById.get(data.plan_id);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind,
          beltSlug: belt?.slug,
        })
      ) {
        ctx.addIssue({
          code: "custom",
          message: modality !== "jiu_jitsu" ? "Escolha um plano Adulto." : "Plano incompatível com a faixa do aluno.",
          path: ["plan_id"],
        });
      }
    });
}

export type QuickEditFormValues = z.infer<
  ReturnType<typeof buildQuickEditFormSchema>
>;
