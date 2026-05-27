import { z } from "zod";

export const convertCheckInsSchema = z
  .object({
    classSessionId: z.string().uuid("Sessão inválida."),
    /** Se omitido ou vazio, converte todos os check-ins pendentes. */
    studentIds: z.array(z.string().uuid("Aluno inválido.")).optional(),
  })
  .strict();

export type ConvertCheckInsInput = z.infer<typeof convertCheckInsSchema>;

export const manualAttendanceSchema = z
  .object({
    classSessionId: z.string().uuid("Sessão inválida."),
    studentId: z.string().uuid("Aluno inválido."),
  })
  .strict();

export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;

export const removeAttendanceSchema = z
  .object({
    classSessionId: z.string().uuid("Sessão inválida."),
    studentId: z.string().uuid("Aluno inválido."),
  })
  .strict();

export type RemoveAttendanceInput = z.infer<typeof removeAttendanceSchema>;
