import { z } from "zod";

import { ISO_WEEKDAY_MAX, ISO_WEEKDAY_MIN } from "@/lib/classes/constants";

const TIME_HH_MM_RE = /^\d{2}:\d{2}(:\d{2})?$/;

const timeSchema = z
  .string()
  .regex(TIME_HH_MM_RE, "Horário inválido (HH:MM).")
  .transform((t) => (t.length === 5 ? `${t}:00` : t));

export const classSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome da turma.").max(100, "Nome muito longo."),
    kind: z.enum(["adult", "kids"], { message: "Modalidade inválida." }),
    instructorProfileId: z.string().uuid("Perfil de instrutor inválido."),
  })
  .strict();

export type ClassInput = z.infer<typeof classSchema>;

export const updateClassSchema = classSchema.extend({
  classId: z.string().uuid("Turma inválida."),
});

export type UpdateClassInput = z.infer<typeof updateClassSchema>;

export const recurringScheduleSchema = z
  .object({
    classId: z.string().uuid("Turma inválida."),
    dayOfWeek: z
      .number()
      .int()
      .min(ISO_WEEKDAY_MIN, "Dia inválido.")
      .max(ISO_WEEKDAY_MAX, "Dia inválido."),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .strict()
  .refine((d) => d.startTime < d.endTime, {
    message: "Horário de fim deve ser após o de início.",
    path: ["endTime"],
  });

export type RecurringScheduleInput = z.infer<typeof recurringScheduleSchema>;

export const deleteScheduleSchema = z
  .object({
    scheduleId: z.string().uuid("Horário inválido."),
  })
  .strict();

export type DeleteScheduleInput = z.infer<typeof deleteScheduleSchema>;

export const enrollStudentSchema = z
  .object({
    classId: z.string().uuid("Turma inválida."),
    studentId: z.string().uuid("Aluno inválido."),
  })
  .strict();

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const unenrollStudentSchema = enrollStudentSchema;

export type UnenrollStudentInput = z.infer<typeof unenrollStudentSchema>;
