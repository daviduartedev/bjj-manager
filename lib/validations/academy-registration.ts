import { z } from "zod";

const academyNameMessage = "O nome da academia precisa ter entre 2 e 80 caracteres.";
const displayNameMessage = "O seu nome precisa ter entre 2 e 80 caracteres.";

/** Payload do cadastro público. Rejeita papel, id e redirect enviados pelo cliente. */
export const academyRegistrationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail.")
      .email("Digite um e-mail válido.")
      .transform((value) => value.toLowerCase()),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    academyName: z.string().trim().min(2, academyNameMessage).max(80, academyNameMessage),
    displayName: z.string().trim().min(2, displayNameMessage).max(80, displayNameMessage),
  })
  .strict();

export type AcademyRegistrationInput = z.infer<typeof academyRegistrationSchema>;
