import { z } from "zod";

/** Só cliente — autenticação via Supabase no browser; não é payload de Server Action. */
export const loginSchema = z
  .object({
    email: z
      .string()
      .min(1, "Informe o e-mail.")
      .email("Digite um e-mail válido."),
    password: z.string().min(1, "Informe a senha."),
  })
  .strict();

export type LoginFormValues = z.infer<typeof loginSchema>;
