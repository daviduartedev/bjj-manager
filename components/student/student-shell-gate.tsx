"use client";

import { usePathname } from "next/navigation";

import { StudentShell } from "@/components/student/student-shell";
import { isPortalExemptFromOnboardingPath } from "@/lib/routes";

type StudentShellGateProps = {
  academyName: string | null;
  userLabel: string;
  children: React.ReactNode;
};

export function StudentShellGate({ academyName, userLabel, children }: StudentShellGateProps) {
  const pathname = usePathname();
  const showShell = !isPortalExemptFromOnboardingPath(pathname);

  if (!showShell) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <StudentShell academyName={academyName} userLabel={userLabel}>
      {children}
    </StudentShell>
  );
}
