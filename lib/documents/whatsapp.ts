/**
 * Normaliza para padrão E.164 (sem `+`) — mínimo 10 dígitos. Brasil: prefixa `55`
 * quando o número estiver em formato local (DDD+ número).
 */
export function normalizePhoneE164(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = String(input).replace(/\D+/g, "");
  if (digits.length === 0) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = `55${digits}`;
  }
  if (digits.length < 10) return null;
  return digits;
}

export function buildWhatsAppShareUrl(args: {
  phoneE164: string;
  message: string;
}): string {
  const text = encodeURIComponent(args.message);
  return `https://wa.me/${args.phoneE164}?text=${text}`;
}

export function composeDocumentWhatsAppMessage(args: {
  documentNumber: string;
  documentTypeLabel: string;
  signedUrl: string;
  academyName: string;
  studentFirstName?: string | null;
}): string {
  const greeting = args.studentFirstName ? `Olá, ${args.studentFirstName}!` : "Olá!";
  return [
    greeting,
    `${args.academyName} segue com o seu ${args.documentTypeLabel.toLowerCase()} (${args.documentNumber}).`,
    `Acesse pelo link: ${args.signedUrl}`,
    "",
    "Qualquer dúvida, fale com a gente. 🙏",
  ].join("\n");
}

export function composeEnrollmentLiabilityWhatsAppMessage(args: {
  documentNumber: string;
  academyName: string;
  signingUrl: string;
  recipientFirstName?: string | null;
}): string {
  const greeting = args.recipientFirstName
    ? `Olá, ${args.recipientFirstName}!`
    : "Olá!";
  return [
    greeting,
    `Segue sua Matrícula e Termo de Responsabilidade (${args.documentNumber}) da ${args.academyName}.`,
    `Assine aqui: ${args.signingUrl}`,
  ].join("\n");
}
