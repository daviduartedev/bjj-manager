import { destinationForProvision } from "@/lib/auth/provision-destination";

export const CONFIRMATION_RECOVERY_PATH = "/login?confirmacao=link";

export const CONFIRMATION_LINK_FAILED_MESSAGE =
  "Este link não pôde ser usado. Peça outro e-mail de confirmação neste navegador.";

/** Mensagem do login quando o callback chegou com `confirmacao=link`. */
export function confirmationRecoveryMessage(token: string | null | undefined): string | null {
  if (token === "link") return CONFIRMATION_LINK_FAILED_MESSAGE;
  return null;
}

/**
 * Um único destino do callback. Código ausente ou troca falhada (link expirado
 * ou aberto noutro aparelho) vai ao login com a recuperação. `next` não é seguido.
 */
export function academyCallbackPath(input: {
  code: string | null;
  next: string | null;
  exchangeFailed: boolean;
  provisionFailed: boolean;
  provisionData: unknown;
}): string {
  // `next` chega na query e fica de fora: o destino não pode ser escolhido pelo pedido.
  if (!input.code || input.exchangeFailed) return CONFIRMATION_RECOVERY_PATH;
  if (input.provisionFailed) return "/login";
  return destinationForProvision(input.provisionData);
}
