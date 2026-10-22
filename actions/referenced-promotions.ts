"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { validateGraduatedAtNotFuture } from "@/lib/graduation/graduated-at";
import { findReferencedRank } from "@/lib/modalities/referenced-ranks";
import { routeAlunoGraduacoes, routeAlunoPerfil, ROUTES } from "@/lib/routes";
import type { GraduationActionResult } from "./graduations";

const promotionSchema = z.object({
  reference_id: z.literal("cbj-2023"),
  rank_code: z.string().refine(code => !!findReferencedRank("cbj-2023", code), "Escolha uma graduação válida de Judô."),
  granted_on: z.string().superRefine((date, ctx) => {
    const error = validateGraduatedAtNotFuture(date);
    if (error) ctx.addIssue({ code: "custom", message: error });
  }),
  reason: z.string().trim().max(2000, "Use até 2.000 caracteres.").optional(),
}).strict();

export async function promoteReferencedStudent(studentId: string, values: unknown): Promise<GraduationActionResult> {
  try {
    const context = await getCurrentAccount();
    if (context?.profile.role !== "professor" || context.account.modality !== "judo") return { ok: false, error: "Não foi possível registrar esta promoção." };
    if (!z.string().uuid().safeParse(studentId).success) return { ok: false, error: "Aluno não encontrado." };
    const parsed = promotionSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Corrija os campos destacados.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    const { data } = parsed;
    const supabase = await createClient();
    const { error } = await supabase.rpc("promote_referenced_student", {
      p_student_id: studentId, p_reference_id: data.reference_id, p_rank_code: data.rank_code,
      p_granted_on: data.granted_on, p_reason: data.reason || null,
    });
    if (error) {
      if (error.message === "promotion reason required") return { ok: false, error: "Informe a justificativa.", fieldErrors: { reason: ["Justifique o salto Casca ou a exceção à orientação CBJ."] } };
      if (error.message === "promotion must advance") return { ok: false, error: "Escolha uma graduação superior à atual. Atualize a página se outro registro foi feito.", fieldErrors: { rank_code: ["A promoção deve avançar a graduação atual."] } };
      if (error.message === "invalid promotion date") return { ok: false, error: "Revise a data.", fieldErrors: { granted_on: ["Use uma data concedida, sem futuro e a partir da graduação atual conhecida."] } };
      return { ok: false, error: "Não foi possível registrar esta promoção. Atualize a página e tente novamente." };
    }
    for (const path of [ROUTES.alunos, routeAlunoPerfil(studentId), routeAlunoGraduacoes(studentId), ROUTES.painel]) revalidatePath(path);
    return { ok: true };
  } catch { return { ok: false, error: "Não foi possível registrar esta promoção. Tente novamente." }; }
}
