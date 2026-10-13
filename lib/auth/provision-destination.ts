export type ProvisionDestination = "/painel" | "/portal" | "/login";

/**
 * Destino depois de `provision_academy_for_current_user`.
 * E-mail pendente, inelegível ou papel fora de professor/aluno fica em /login:
 * uma sessão sem perfil não pode ir ao /painel, senão o middleware devolve-a
 * para /login e o ciclo não acaba.
 */
export function destinationForProvision(data: unknown): ProvisionDestination {
  const row = firstProvisionRow(data);
  if (row.outcome === "created") return "/painel";
  if (row.outcome === "existing" && row.role === "professor") return "/painel";
  if (row.outcome === "existing" && row.role === "student") return "/portal";
  return "/login";
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
