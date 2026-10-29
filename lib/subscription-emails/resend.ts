import type { NotificationGateway } from "./types";

export function createResendGateway(environment: Record<string, string | undefined>, fetcher: typeof fetch = fetch): NotificationGateway {
  const key = environment.RESEND_API_KEY?.trim();
  if (!key) throw new Error("email_configuration_missing");
  return {
    async send(message, idempotencyKey) {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ from: message.from, to: [message.to], subject: message.subject, text: message.text }),
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      const result = await response.json() as { id?: string };
      if (!response.ok || typeof result.id !== "string" || !result.id) throw new Error("email_provider_unavailable");
      return { id: result.id };
    },
  };
}
