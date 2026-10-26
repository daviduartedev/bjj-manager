/** Ano de entrada (faixa branca) e data de entrada (faixas coloridas). */

export function academyStartStored(
  whiteBelt: boolean,
  year: string,
  entryDate: string,
): string {
  if (whiteBelt) return `${year}-01-01`;
  return entryDate;
}

const YEAR = /^\d{4}$/;

export function whiteBeltEntryYearError(
  year: string,
  todayYmd: string,
): string | null {
  if (!YEAR.test(year) || Number(year) === 0) {
    return "Informe o ano de entrada.";
  }
  const currentYear = Number(todayYmd.slice(0, 4));
  if (Number(year) > currentYear) {
    return "O ano de entrada não pode ser no futuro.";
  }
  return null;
}

export function coloredBeltEntryDateError(
  entryDate: string,
  todayYmd: string,
): string | null {
  if (entryDate > todayYmd) {
    return "A data de entrada não pode ser no futuro.";
  }
  return null;
}
