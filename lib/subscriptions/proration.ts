/** Diferença proporcional do ciclo vigente. Nunca usa valor enviado pelo navegador. */
export function proratedUpgradeCents(input: {
  fromCents: number;
  toCents: number;
  periodStart: string;
  paidUntil: string;
  now: Date;
}): number | null {
  if (input.toCents <= input.fromCents) return null;
  const start = Date.parse(input.periodStart);
  const end = Date.parse(input.paidUntil);
  const now = input.now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || now >= end) return null;
  const cents = Math.round((input.toCents - input.fromCents) * ((end - now) / (end - start)));
  return Math.max(100, cents);
}
