import {
  calculateAge,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";

export function formatStudentAge(
  birthDate: string | null,
  today: string,
): string {
  const age = calculateAge(birthDate, today);
  if (age === null) return "—";
  return `${age} anos`;
}

type Props = {
  birthDate: string | null;
  /** Para testes ou quando `today` vem do servidor (DATE-1.3). */
  today?: string;
};

export function StudentAgeLabel({ birthDate, today }: Props) {
  const todayResolved = today ?? toCalendarDateStringInAppTZ(new Date());
  return <span>{formatStudentAge(birthDate, todayResolved)}</span>;
}
