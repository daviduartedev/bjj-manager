import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";

export function mapDocumentActionError(error: unknown): string {
  if (error && typeof error === "object") {
    const o = error as { code?: string; message?: string; name?: string };
    const msg = (o.message ?? "").toLowerCase();
    if (msg.includes("idempotency_key")) {
      return "Já existe um documento gerado para esta operação.";
    }
    if (
      o.code === "42501" ||
      o.code === "PGRST301" ||
      msg.includes("permission denied") ||
      msg.includes("row-level security")
    ) {
      return "Não foi possível concluir a operação nesta academia.";
    }
    if (o.name === "AbortError" || msg.includes("network") || msg.includes("fetch")) {
      return "Não foi possível ligar ao servidor. Verifique a rede e tente novamente.";
    }
  }
  const mapped = mapDatabaseErrorToUserMessage(error);
  if (mapped) return mapped;
  return "Não foi possível gerar o documento. Tente novamente em instantes.";
}
