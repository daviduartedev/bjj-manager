import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");

export const weightKgSchema = z
  .union([
    z.literal(""),
    z.literal(null),
    z.undefined(),
    z.coerce.number().min(20, "Mínimo 20,0 kg.").max(250, "Máximo 250,0 kg."),
  ])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return null;
    return Math.round(Number(v) * 10) / 10;
  });

const graduationEventFields = z
  .object({
    resulting_belt_id: z.string().uuid("Escolha a faixa."),
    resulting_degree: z.coerce.number().int(),
    graduated_at: isoDate,
    was_skip: z.boolean().default(false),
    skip_reason: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().trim().max(2000).nullable().optional(),
    ),
    weight_kg: weightKgSchema.optional(),
  })
  .strict();

function refineGraduationSkip(
  data: z.infer<typeof graduationEventFields>,
  ctx: z.RefinementCtx,
) {
  if (data.was_skip && !data.skip_reason?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Justificativa obrigatória para pulo de faixa.",
      path: ["skip_reason"],
    });
  }
  if (!data.was_skip && data.skip_reason) {
    ctx.addIssue({
      code: "custom",
      message: "Justificativa só se aplica a pulo de faixa.",
      path: ["skip_reason"],
    });
  }
}

export const graduationEventSchema = graduationEventFields.superRefine(
  refineGraduationSkip,
);

export const addGraduationSchema = graduationEventSchema;

export const updateGraduationSchema = graduationEventFields
  .extend({
    graduationId: z.string().uuid(),
  })
  .strict()
  .superRefine(refineGraduationSkip);

export type GraduationEventFormValues = z.infer<typeof graduationEventFields>;
