import { z } from "zod";

const lessonPlanIdSchema = z.string().uuid("Identificador de plano inválido.");

export const planKindSchema = z.enum(["adult", "kids_1", "kids_2"]);

export const lessonPlanItemSchema: z.ZodType<{
  id: string;
  text: string;
  children?: { id: string; text: string }[];
}> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      text: z.string().trim().min(1, "Item vazio.").max(500, "Item demasiado longo."),
      children: z.array(z.object({ id: z.string().min(1), text: z.string().trim().min(1).max(500) })).optional(),
    })
    .strict(),
);

export const lessonPlanTopicSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().trim().min(1, "Indique o título do tópico.").max(160),
    kind: z.enum(["section", "techniques", "drills", "live", "general"]).default("section"),
    summary: z.string().trim().max(2000).optional().nullable(),
    items: z.array(lessonPlanItemSchema).default([]),
  })
  .strict();

export const lessonPlanContentSchema = z
  .object({
    summary: z.string().trim().max(4000).optional().nullable(),
    topics: z.array(lessonPlanTopicSchema).max(40),
  })
  .strict();

export type LessonPlanContent = z.infer<typeof lessonPlanContentSchema>;
export type LessonPlanTopic = z.infer<typeof lessonPlanTopicSchema>;
export type LessonPlanItem = z.infer<typeof lessonPlanItemSchema>;

export const createLessonPlanSchema = z
  .object({
    planKind: planKindSchema,
    referenceMonth: z
      .string()
      .regex(/^\d{4}-\d{2}-01$/, "Mês de referência inválido (use YYYY-MM-01)."),
    title: z.string().trim().min(1, "Indique o título.").max(160),
    internalNotes: z
      .union([z.string().trim().max(2000), z.literal("")])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : v)),
    content: lessonPlanContentSchema,
  })
  .strict();

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanSchema>;

export const updateLessonPlanSchema = z
  .object({
    lessonPlanId: lessonPlanIdSchema,
    title: z.string().trim().min(1).max(160).optional(),
    internalNotes: z
      .union([z.string().trim().max(2000), z.literal("")])
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : v)),
    content: lessonPlanContentSchema.optional(),
    changeSummary: z.string().trim().max(500).optional().nullable(),
  })
  .strict()
  .refine(
    (d) => d.title !== undefined || d.internalNotes !== undefined || d.content !== undefined,
    { message: "Nada para atualizar.", path: ["lessonPlanId"] },
  );

export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanSchema>;

export const publishLessonPlanSchema = z
  .object({
    lessonPlanId: lessonPlanIdSchema,
    /** Quando há outro plano publicado para o mesmo (kind, mês), exigir confirmação. */
    archiveExisting: z.boolean().default(false),
  })
  .strict();

export type PublishLessonPlanInput = z.infer<typeof publishLessonPlanSchema>;

export const archiveLessonPlanSchema = z
  .object({ lessonPlanId: lessonPlanIdSchema })
  .strict();

export type ArchiveLessonPlanInput = z.infer<typeof archiveLessonPlanSchema>;

export const restoreLessonPlanSchema = z
  .object({ lessonPlanId: lessonPlanIdSchema })
  .strict();

export type RestoreLessonPlanInput = z.infer<typeof restoreLessonPlanSchema>;

export const duplicateLessonPlanSchema = z
  .object({
    lessonPlanId: lessonPlanIdSchema,
    targetReferenceMonth: z
      .string()
      .regex(/^\d{4}-\d{2}-01$/, "Mês de referência inválido (use YYYY-MM-01)."),
    targetPlanKind: planKindSchema.optional(),
    title: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export type DuplicateLessonPlanInput = z.infer<typeof duplicateLessonPlanSchema>;
