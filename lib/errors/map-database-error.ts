/**
 * Mensagens para erros PostgREST / Postgres frequentes, sem expor nomes internos (**BLM-3**, **STU-2.2**).
 * Devolve `null` se não for um caso conhecido — os chamadores aplicam fallback genérico.
 */
export function mapDatabaseErrorToUserMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const o = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  const msg = (o.message ?? "").toLowerCase();
  const details = (o.details ?? "").toLowerCase();

  if (
    o.code === "42703" ||
    (msg.includes("column") && msg.includes("does not exist")) ||
    msg.includes("undefined_column")
  ) {
    return "Falta uma atualização na base de dados (contacte o suporte técnico ou o administrador).";
  }

  if (o.code === "23505") {
    return "Este registo já existe ou está em conflito. Atualize a página e tente novamente.";
  }

  if (o.code === "23503") {
    return "Não é possível apagar ou alterar este dado porque está em uso.";
  }

  if (
    msg.includes("jwt expired") ||
    msg.includes("jwt") && msg.includes("invalid")
  ) {
    return "Sessão expirada. Entre novamente.";
  }

  if (details.includes("violates foreign key")) {
    return "Referência inválida ou registo já não existe. Atualize a página.";
  }

  return null;
}
