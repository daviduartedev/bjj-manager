/**
 * Mensagem segura para UI / `generated_documents.error_message` quando o render PDF falha.
 * Não expõe caminhos de binários nem mensagens de motor técnico (**REC-7**, **REC-3**).
 */
export function sanitizePdfRenderFailureForUser(raw: string | undefined): string {
  const message = (raw ?? "").trim();
  if (!message) {
    return "Não foi possível gerar o PDF neste momento. Utilize «Tentar gerar novamente».";
  }
  const lower = message.toLowerCase();
  if (
    lower.includes("executable") ||
    lower.includes("doesn't exist") ||
    lower.includes("browser") ||
    lower.includes("chromium") ||
    lower.includes("playwright") ||
    lower.includes("puppeteer") ||
    lower.includes("spawn") ||
    lower.includes("enoent") ||
    lower.includes("/tmp") ||
    lower.includes("c:\\") ||
    lower.includes(":\\")
  ) {
    return "Não foi possível gerar o PDF neste momento. Utilize «Tentar gerar novamente».";
  }
  return message.length > 400 ? `${message.slice(0, 397)}…` : message;
}
