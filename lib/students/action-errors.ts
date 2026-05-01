/**
 * Mensagens genéricas (**STU-2.2**), sem detalhes internos.
 */

import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";

const GENERIC =
  "Não foi possível completar o pedido. Tente novamente ou atualize a página.";
const NETWORK =
  "Não foi possível contactar o servidor. Verifique a ligação e tente novamente.";
const PERMISSION = "Não tem permissão para esta operação.";

export function mapStudentServerError(error: unknown): string {
  const mappedDb = mapDatabaseErrorToUserMessage(error);
  if (mappedDb) return mappedDb;

  if (error && typeof error === "object") {
    const o = error as { code?: string; message?: string; name?: string };
    const msg = (o.message ?? "").toLowerCase();
    if (o.name === "AbortError" || msg.includes("network") || msg.includes("fetch")) {
      return NETWORK;
    }
    if (
      o.code === "42501" &&
      (msg.includes("row-level security") || msg.includes("rls"))
    ) {
      return "Não foi possível salvar os dados nesta academia. Confirme o vínculo da sua conta ou tente novamente.";
    }
    if (
      o.code === "42501" ||
      o.code === "PGRST301" ||
      msg.includes("permission denied") ||
      msg.includes("jwt")
    ) {
      return PERMISSION;
    }
    if (o.code === "PGRST116") {
      return "Registo não encontrado.";
    }
  }
  return GENERIC;
}
