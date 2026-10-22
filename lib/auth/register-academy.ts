import { academyRegistrationSchema, type AcademyOnboarding } from "@/lib/validations/academy-registration";

export const ACADEMY_REGISTRATION_WAITING_MESSAGE =
  "Abra o link de confirmação que enviamos, neste navegador, para entrar no painel.";

export const REGISTRATION_FAILED_MESSAGE =
  "Não foi possível concluir o cadastro. Tente novamente.";
export const REGISTRATION_RATE_LIMIT_MESSAGE =
  "O envio de confirmações atingiu o limite temporário. Aguarde alguns minutos e tente novamente.";

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
  validateMunicipality?: (selection: Pick<AcademyOnboarding, "state" | "cityId" | "city">) => Promise<boolean>;
  signUp: (args: {
    email: string;
    password: string;
    emailRedirectTo: string;
    onboarding?: AcademyOnboarding;
  }) => Promise<SignupCallResult>;
  recordIntent: (args: {
    userId: string;
    academyName: string;
    displayName: string;
  }) => Promise<{ ok: true } | { ok: false }>;
};

/** Mesma base do convite de aluno quando `NEXT_PUBLIC_APP_URL` não está definida. */
const SERVER_APP_FALLBACK = "http://localhost:3000";

/**
 * Callback de confirmação. A base é `NEXT_PUBLIC_APP_URL` lida no servidor,
 * como o convite de aluno. O navegador não escolhe o destino.
 */
export function academySignupCallbackUrl(env: {
  NEXT_PUBLIC_APP_URL?: string | null;
}): string {
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() || SERVER_APP_FALLBACK;
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

function indicatesEmailRateLimit(result: SignupCallResult): boolean {
  const code = result.error?.code ?? "";
  const message = result.error?.message.toLowerCase() ?? "";
  return code === "over_email_send_rate_limit" || message.includes("email rate limit");
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

  if (parsed.data.onboarding) {
    if (!deps.validateMunicipality) {
      return {
        ok: false,
        fieldErrors: { "onboarding.city": ["Não foi possível validar a cidade agora. Tente novamente."] },
      };
    }

    try {
      const valid = await deps.validateMunicipality(parsed.data.onboarding);
      if (!valid) {
        return {
          ok: false,
          fieldErrors: { "onboarding.city": ["Selecione uma cidade válida para o estado informado."] },
        };
      }
    } catch {
      return {
        ok: false,
        fieldErrors: { "onboarding.city": ["Não foi possível validar a cidade agora. Tente novamente."] },
      };
    }
  }

  const emailRedirectTo = academySignupCallbackUrl({
    NEXT_PUBLIC_APP_URL: deps.appUrl,
  });

  const signup = await deps.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    emailRedirectTo,
    ...(parsed.data.onboarding ? { onboarding: parsed.data.onboarding } : {}),
  });

  if (indicatesEmailRateLimit(signup)) {
    return { ok: false, message: REGISTRATION_RATE_LIMIT_MESSAGE };
  }

  if (signup.error?.code === "weak_password") {
    return {
      ok: false,
      fieldErrors: { password: ["A senha foi recusada pelos controles de segurança. Escolha outra senha."] },
    };
  }

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
