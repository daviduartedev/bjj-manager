import { BillingDomainError } from "./domain-error";

const NOT_AVAILABLE =
  "Registo não encontrado ou não disponível para a sua academia.";
const GENERIC_SAVE =
  "Não foi possível guardar a alteração. Verifique os dados e tente novamente.";

/**
 * Mensagens para **`actions/billing.ts`** (**BLM-3**): específicas o suficiente para toast,
 * sem expor detalhes internos nem confirmar existência noutras contas.
 */
export function mapBillingActionError(error: unknown): string {
  if (error instanceof BillingDomainError) {
    switch (error.code) {
      case "PLAN_NOT_AVAILABLE":
        return "Plano não encontrado ou já não está disponível nesta academia.";
      case "PLAN_INACTIVE":
        return "Este plano está inativo e não pode ser associado a novos vínculos.";
      case "PLAN_KIND_MISMATCH":
        return "Este plano não é compatível com o tipo de aluno (adulto vs kids).";
      case "STUDENT_NOT_AVAILABLE":
        return NOT_AVAILABLE;
      default:
        return NOT_AVAILABLE;
    }
  }

  if (error && typeof error === "object") {
    const o = error as { code?: string; message?: string; name?: string };
    const msg = (o.message ?? "").toLowerCase();
    if (o.name === "AbortError" || msg.includes("network") || msg.includes("fetch")) {
      return "Não foi possível ligar ao servidor. Verifique a rede e tente novamente.";
    }
    if (
      o.code === "42501" &&
      (msg.includes("row-level security") || msg.includes("rls"))
    ) {
      return "Não foi possível concluir a operação nesta academia. Confirme o vínculo da sua conta ou tente novamente.";
    }
    if (
      o.code === "42501" ||
      o.code === "PGRST301" ||
      msg.includes("permission denied") ||
      msg.includes("jwt")
    ) {
      return "Não tem permissão para esta operação.";
    }
  }

  return GENERIC_SAVE;
}
