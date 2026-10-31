import { z } from "zod";

import { newPasswordField } from "@/lib/auth/password-policy";

const SERVER_APP_FALLBACK = "http://localhost:3000";

export const PASSWORD_RECOVERY_SENT_MESSAGE =
  "Se existir uma conta com este e-mail, enviaremos as instruções para redefinir a senha.";

export const PASSWORD_RECOVERY_LINK_FAILED_MESSAGE =
  "Este link não pôde ser usado. Peça outro e-mail de recuperação neste navegador.";

export const PASSWORD_UPDATED_MESSAGE =
  "Senha atualizada. Entre com a nova senha.";

export function passwordRecoveryCallbackUrl(env: { NEXT_PUBLIC_APP_URL?: string | null }): string {
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() || SERVER_APP_FALLBACK;
  return `${appUrl.replace(/\/$/, "")}/auth/recovery`;
}

export function recoveryCallbackPath(input: { code: string | null; exchangeFailed: boolean }): string {
  if (!input.code || input.exchangeFailed) return "/recuperar-senha?erro=link";
  return "/redefinir-senha";
}

export function recoveryRequestErrorMessage(token: string | null | undefined): string | null {
  if (token === "link") return PASSWORD_RECOVERY_LINK_FAILED_MESSAGE;
  return null;
}

export const recoveryEmailSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("Digite um e-mail válido.").transform((value) => value.toLowerCase()),
}).strict();

export const newPasswordSchema = z.object({
  password: newPasswordField,
}).strict();

export async function requestPasswordRecovery(
  input: unknown,
  deps: {
    redirectTo: string;
    resetPasswordForEmail: (email: string, redirectTo: string) => Promise<{ error: { message: string; code?: string } | null }>;
  },
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const parsed = recoveryEmailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Informe um e-mail válido." };
  try {
    await deps.resetPasswordForEmail(parsed.data.email, deps.redirectTo);
  } catch {
    // A resposta pública permanece a mesma para não enumerar contas.
  }
  return { ok: true, message: PASSWORD_RECOVERY_SENT_MESSAGE };
}
