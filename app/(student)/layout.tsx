import { getCurrentAccount } from "@/lib/auth";
import { getStudentForCurrentUser } from "@/lib/auth/student-context";

import { StudentShellGate } from "@/components/student/student-shell-gate";

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ctx = await getCurrentAccount();
  const student = await getStudentForCurrentUser();

  const academyName = ctx?.account.name ?? null;
  const userLabel = student?.full_name ?? ctx?.profile.display_name ?? ctx?.user.email ?? "Aluno";

  return (
    <StudentShellGate academyName={academyName} userLabel={userLabel}>
      {children}
    </StudentShellGate>
  );
}
