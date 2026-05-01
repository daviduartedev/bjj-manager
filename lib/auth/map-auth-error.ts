import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduz erros do Supabase Auth para mensagens em pt-BR (AUTH-5.1).
 */
export function mapAuthErrorToMessage(error: AuthError): string {
  const code = error.code ?? "";
  if (code === "invalid_credentials" || code === "invalid_grant") {
    return "E-mail ou senha incorretos.";
  }
  if (code === "email_not_confirmed") {
    return "Confirme o e-mail antes de entrar.";
  }
  if (code === "too_many_requests" || code === "over_request_rate_limit") {
    return "Muitas tentativas. Tente novamente em instantes.";
  }
  if (code === "user_banned") {
    return "Esta conta não pode entrar no momento.";
  }

  const m = error.message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme o e-mail antes de entrar.";
  if (m.includes("too many requests")) return "Muitas tentativas. Tente novamente em instantes.";

  return "Não foi possível entrar. Verifique os dados e tente de novo.";
}
