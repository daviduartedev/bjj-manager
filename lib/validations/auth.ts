import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail.")
    .email("Digite um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
