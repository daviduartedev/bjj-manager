import { z } from "zod";

import { isValidCpfDigits, onlyDigits } from "@/lib/students/input-masks";
import { isValidDegreeForBelt } from "@/lib/students/degree";
import type { PlanKind } from "@/lib/students/plan-kind";
import {
  beltMatchesStudentKindForBeltRow,
  planKindMatchesStudentContext,
} from "@/lib/students/plan-kind";
import type { StudentKind } from "@/lib/students/degree";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");

export const studentKindSchema = z.enum(["adult", "kids"]);

/** Status manipulável na UI deste ciclo (**STU-3**). */
export const studentUiStatusSchema = z.enum(["active", "inactive", "paused"]);

export const listSortSchema = z.enum(["name", "academy_start", "updated_at"]);
export type ListSortKey = z.infer<typeof listSortSchema>;

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export function buildStudentFullFormSchema(
  belts: { id: string; slug: string; kind: "adult" | "kids" }[],
  plans: { id: string; kind: PlanKind }[],
) {
  const beltIds = new Set(belts.map((b) => b.id));
  const planById = new Map(plans.map((p) => [p.id, p] as const));

  return z
    .object({
      full_name: z.string().trim().min(2, "Informe o nome."),
      birth_date: isoDate,
      academy_start_date: isoDate,
      kind: studentKindSchema,
      current_belt_id: z.string().uuid("Escolha a faixa."),
      current_degree: z.coerce.number().int(),
      plan_id: z.string().uuid("Escolha o plano."),
      due_day: z.coerce.number().int().min(1).max(28),
      document: z.preprocess(emptyToUndef, z.string().trim().optional()),
      phone: z.preprocess(emptyToUndef, z.string().trim().optional()),
      email: z.preprocess(emptyToUndef, z.string().trim().optional()),
      notes: z.preprocess(emptyToUndef, z.string().trim().optional()),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (!beltIds.has(data.current_belt_id)) {
        ctx.addIssue({
          code: "custom",
          message: "Faixa inválida.",
          path: ["current_belt_id"],
        });
        return;
      }
      const belt = belts.find((b) => b.id === data.current_belt_id)!;
      if (!beltMatchesStudentKindForBeltRow(belt, data.kind as StudentKind)) {
        ctx.addIssue({
          code: "custom",
          message: "A faixa não corresponde ao tipo de aluno.",
          path: ["current_belt_id"],
        });
      }
      if (!isValidDegreeForBelt(belt.slug, belt.kind, data.current_degree)) {
        ctx.addIssue({
          code: "custom",
          message: "Grau inválido para esta faixa.",
          path: ["current_degree"],
        });
      }

      const plan = planById.get(data.plan_id);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind: data.kind as StudentKind,
          beltSlug: belt.slug,
        })
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Plano incompatível com o tipo e a faixa do aluno.",
          path: ["plan_id"],
        });
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
) {
  const beltIds = new Set(
    belts
      .filter((b) => beltMatchesStudentKindForBeltRow(b, studentKind))
      .map((b) => b.id),
  );
  const planById = new Map(plans.map((p) => [p.id, p] as const));

  return z
    .object({
      status: quickEditStatusSchema,
      plan_id: z.string().uuid(),
      due_day: z.coerce.number().int().min(1).max(28),
      current_belt_id: z.string().uuid(),
      current_degree: z.coerce.number().int(),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (!beltIds.has(data.current_belt_id)) {
        ctx.addIssue({
          code: "custom",
          message: "Faixa inválida.",
          path: ["current_belt_id"],
        });
        return;
      }
      const belt = belts.find((b) => b.id === data.current_belt_id)!;
      if (!isValidDegreeForBelt(belt.slug, belt.kind, data.current_degree)) {
        ctx.addIssue({
          code: "custom",
          message: "Grau inválido para esta faixa.",
          path: ["current_degree"],
        });
      }
      const plan = planById.get(data.plan_id);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind,
          beltSlug: belt.slug,
        })
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Plano incompatível com a faixa do aluno.",
          path: ["plan_id"],
        });
      }
    });
}

export type QuickEditFormValues = z.infer<
  ReturnType<typeof buildQuickEditFormSchema>
>;
