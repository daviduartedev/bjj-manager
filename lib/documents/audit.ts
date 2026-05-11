/**
 * Mascaramento de PII para auditoria (DOC-7.5 / SEC-LGPD).
 * Nenhum log do motor documental deve ter nomes completos, telefones ou CPFs.
 */

export function maskPhone(input: string | null | undefined): string {
  if (!input) return "";
  const digits = input.replace(/\D+/g, "");
  if (digits.length < 4) return "***";
  return `${digits.slice(0, 2)}*****${digits.slice(-2)}`;
}

export function maskName(input: string | null | undefined): string {
  if (!input) return "";
  const parts = input.trim().split(/\s+/);
  if (parts.length === 1) return `${parts[0].slice(0, 2)}***`;
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last.slice(0, 1)}***`;
}

export function maskDocument(input: string | null | undefined): string {
  if (!input) return "";
  const digits = input.replace(/\D+/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

type AuditableValue = string | number | boolean | null | undefined;

export type DocumentAuditEvent = {
  level: "info" | "warn" | "error";
  event: string;
  documentId?: string;
  documentType?: string;
  accountId?: string;
  payload?: Record<string, AuditableValue>;
};

export function logDocumentEvent(ev: DocumentAuditEvent): void {
  const payload = {
    ts: new Date().toISOString(),
    ...ev,
  };
  if (process.env.NODE_ENV === "test") return;
  // Futuro: enviar para sink estruturado. Por agora console com nível.
  if (ev.level === "error") {
    console.error("[doc-engine]", payload);
  } else if (ev.level === "warn") {
    console.warn("[doc-engine]", payload);
  } else {
    console.log("[doc-engine]", payload);
  }
}
