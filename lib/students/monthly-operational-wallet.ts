/**
 * Recorte **BR-9.1**: carteira mensal (`/mensalidades` e agregados alinhados).
 */
export type MonthlyOperationalWalletFields = {
  status: string;
  archived_at?: string | null;
  removed_at?: string | null;
  is_exempt?: boolean | null;
};

export function isStudentInMonthlyOperationalWallet(
  student: MonthlyOperationalWalletFields | null | undefined,
): boolean {
  if (!student) return false;
  if (student.is_exempt === true) return false;
  if (student.status !== "active") return false;
  if (student.archived_at != null) return false;
  if (student.removed_at != null) return false;
  return true;
}
