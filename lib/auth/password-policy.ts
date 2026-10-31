import { z } from "zod";

/** Mínimo de caracteres de uma senha nova (padrão NIST/Google/Microsoft), sem exigir símbolos ou números. */
export const PASSWORD_MIN_LENGTH = 8;
/** Limite em bytes aceito pelo Supabase Auth (bcrypt). */
export const PASSWORD_MAX_BYTES = 72;

export const PASSWORD_TOO_SHORT_MESSAGE = `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
export const PASSWORD_TOO_LONG_MESSAGE = "A senha excede o limite aceito pelo provedor de autenticação.";

/** Regra única para senhas novas: cadastro, redefinição e acesso de teste do admin. */
export const newPasswordField = z.string()
  .refine((value) => Array.from(value).length >= PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE)
  .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES, PASSWORD_TOO_LONG_MESSAGE);
