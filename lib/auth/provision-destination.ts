import { postLoginPathForRole, type AuthRole } from "@/lib/auth/roles";

export type ProvisionDestination = "/painel" | "/portal" | "/login" | "/conta/assinatura";

export type ProvisionLoginDecision = { path: "/painel" | "/portal" | "/conta/assinatura" } | { message: string };

const INELIGIBLE_LOGIN_MESSAGE = "Esta conta não abre o painel da academia.";
const EMAIL_NOT_CONFIRMED_LOGIN_MESSAGE = "Confirme o e-mail antes de entrar no painel.";
const PROVISION_FAILED_LOGIN_MESSAGE = "Não foi possível entrar no painel. Tente novamente.";

/**
 * Destino depois de `provision_academy_for_current_user`.
 * E-mail pendente, inelegível ou papel fora de professor/aluno fica em /login:
 * uma sessão sem perfil não pode ir ao /painel, senão o middleware devolve-a
 * para /login e o ciclo não acaba.
 */
export function destinationForProvision(data: unknown): ProvisionDestination {
  const decision = loginDecisionForProvision(data);
  return "path" in decision ? decision.path : "/login";
}

/**
 * Decisão do login com senha depois da provisão.
 * Inelegível e e-mail por confirmar ficam fora do painel, com mensagem.
 */
export function loginDecisionForProvision(data: unknown): ProvisionLoginDecision {
  const row = firstProvisionRow(data);
  if (row.outcome === "created") return { path: "/conta/assinatura" };
  if (row.outcome === "existing" && row.role === "professor") return { path: "/painel" };
  if (row.outcome === "existing" && row.role === "student") return { path: "/portal" };
  if (row.outcome === "email_not_confirmed") return { message: EMAIL_NOT_CONFIRMED_LOGIN_MESSAGE };
  return { message: INELIGIBLE_LOGIN_MESSAGE };
}

/**
 * Quem já tem papel entra no destino desse papel.
 * Quem não tem perfil chama a provisão uma vez e obedece o resultado.
 */
export async function completePasswordLogin(input: {
  role: AuthRole | null;
  provision: () => Promise<{ data: unknown; error: boolean }>;
}): Promise<ProvisionLoginDecision> {
  if (input.role) return { path: postLoginPathForRole(input.role) };

  const provisioned = await input.provision();
  if (provisioned.error) return { message: PROVISION_FAILED_LOGIN_MESSAGE };
  return loginDecisionForProvision(provisioned.data);
}

function firstProvisionRow(data: unknown): { outcome: string | null; role: string | null } {
  const source = Array.isArray(data) ? data[0] : data;
  if (!source || typeof source !== "object") return { outcome: null, role: null };

  const record = source as Record<string, unknown>;
  return {
    outcome: typeof record.outcome === "string" ? record.outcome : null,
    role: typeof record.role === "string" ? record.role : null,
  };
}
