import { academyRegistrationSchema } from "@/lib/validations/academy-registration";

export const ACADEMY_REGISTRATION_WAITING_MESSAGE =
  "Abra o link de confirmação que enviamos, neste navegador, para entrar no painel.";

export const REGISTRATION_FAILED_MESSAGE =
  "Não foi possível concluir o cadastro. Tente novamente.";

export type AcademyRegistrationResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors: Record<string, string[]> }
  | { ok: false; message: string };

export type SignupUser = {
  id: string;
  identities?: { id: string }[] | null;
};

export type SignupCallResult = {
  user: SignupUser | null;
  error: { message: string; code?: string } | null;
};

type RegistrationDeps = {
  appUrl: string;
  signUp: (args: {
    email: string;
    password: string;
    emailRedirectTo: string;
  }) => Promise<SignupCallResult>;
  recordIntent: (args: {
    userId: string;
    academyName: string;
    displayName: string;
  }) => Promise<{ ok: true } | { ok: false }>;
};

/**
 * Callback de confirmação. Só `APP_URL` entra aqui — o cliente não escolhe o destino.
 */
export function academySignupCallbackUrl(env: { APP_URL?: string | null }): string | null {
  const appUrl = env.APP_URL?.trim();
  if (!appUrl) return null;
  return `${appUrl.replace(/\/$/, "")}/auth/callback`;
}

function fieldErrorsFromZod(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.length) out[key] = messages;
  }
  return out;
}

function indicatesCreatedUser(user: SignupUser | null): user is SignupUser {
  return Boolean(user?.id && Array.isArray(user.identities) && user.identities.length > 0);
}

function indicatesExistingEmail(result: SignupCallResult): boolean {
  if (result.error) {
    const code = result.error.code ?? "";
    const message = result.error.message.toLowerCase();
    return (
      code === "user_already_exists" ||
      code === "email_exists" ||
      message.includes("already registered") ||
      message.includes("already been registered") ||
      message.includes("user already exists")
    );
  }

  return Boolean(result.user?.id) && !indicatesCreatedUser(result.user);
}

/**
 * Cadastro público. A frase de espera é a mesma para e-mail novo e e-mail já
 * usado, para a resposta não dizer se a conta existe. A intenção só é gravada
 * quando o GoTrue devolve identidades — o id é o dessa resposta.
 */
export async function submitAcademyRegistration(
  input: unknown,
  deps: RegistrationDeps,
): Promise<AcademyRegistrationResult> {
  const parsed = academyRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error);
    if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
    return { ok: false, message: REGISTRATION_FAILED_MESSAGE };
  }

  const emailRedirectTo = academySignupCallbackUrl({ APP_URL: deps.appUrl });
  if (!emailRedirectTo) {
    return { ok: false, message: REGISTRATION_FAILED_MESSAGE };
  }

  const signup = await deps.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    emailRedirectTo,
  });

  if (indicatesCreatedUser(signup.user)) {
    const recorded = await deps.recordIntent({
      userId: signup.user.id,
      academyName: parsed.data.academyName,
      displayName: parsed.data.displayName,
    });
    if (!recorded.ok) return { ok: false, message: REGISTRATION_FAILED_MESSAGE };
    return { ok: true, message: ACADEMY_REGISTRATION_WAITING_MESSAGE };
  }

  if (indicatesExistingEmail(signup)) {
    return { ok: true, message: ACADEMY_REGISTRATION_WAITING_MESSAGE };
  }

  return { ok: false, message: REGISTRATION_FAILED_MESSAGE };
}
