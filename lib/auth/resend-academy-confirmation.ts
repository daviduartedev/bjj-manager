import { z } from "zod";

import { academySignupCallbackUrl } from "@/lib/auth/register-academy";

export const RESEND_CONFIRMATION_MESSAGE =
  "Se houver um cadastro pendente, enviamos outro link de confirmação.";

export type ResendConfirmationResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors: Record<string, string[]> };

const resendSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Digite um e-mail válido.")
    .transform((value) => value.toLowerCase()),
});

type ResendDeps = {
  appUrl: string;
  resendSignup: (args: {
    type: "signup";
    email: string;
    emailRedirectTo: string;
  }) => Promise<void>;
};

/**
 * Reenvio da confirmação. A frase é a mesma se a conta existe ou não.
 * O redirect sai de `NEXT_PUBLIC_APP_URL` no servidor; um URL do cliente é ignorado.
 */
export async function resendAcademyConfirmation(
  input: unknown,
  deps: ResendDeps,
): Promise<ResendConfirmationResult> {
  const parsed = resendSchema.safeParse(input);
  if (!parsed.success) {
    const emailErrors = parsed.error.flatten().fieldErrors.email?.filter(Boolean);
    return {
      ok: false,
      fieldErrors: {
        email: emailErrors?.length ? emailErrors : ["Digite um e-mail válido."],
      },
    };
  }

  const emailRedirectTo = academySignupCallbackUrl({
    NEXT_PUBLIC_APP_URL: deps.appUrl,
  });

  try {
    await deps.resendSignup({
      type: "signup",
      email: parsed.data.email,
      emailRedirectTo,
    });
  } catch {
    // Sucesso e falha devolvem a mesma frase para não revelar se a conta existe.
  }

  return { ok: true, message: RESEND_CONFIRMATION_MESSAGE };
}
