/** Junção verbal com " e " (DATE-3.3). */
export function joinWithE(parts: string[]): string {
  return parts.filter(Boolean).join(" e ");
}

export function pluralUnitPT(n: number, one: string, many: string): string {
  return n === 1 ? `${n} ${one}` : `${n} ${many}`;
}
