import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudentOnboardingForm } from "@/components/student/onboarding-form";
import {
  getStudentForCurrentUser,
  isMinorForPortalGuardian,
} from "@/lib/auth/student-context";
import { toCalendarDateStringInAppTZ } from "@/lib/dates";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default async function PortalOnboardingPage() {
  const student = await getStudentForCurrentUser();
  if (!student) redirect(ROUTES.login);

  if (student.portal_terms_accepted_at) {
    redirect(ROUTES.portal);
  }

  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const requiresGuardianEmail = isMinorForPortalGuardian({
    kind: student.kind,
    birth_date: student.birth_date,
    todayYmd,
  });

  return (
    <main className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao portal</h1>
      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <StudentOnboardingForm
          studentName={student.full_name}
          requiresGuardianEmail={requiresGuardianEmail}
        />
      </div>
    </main>
  );
}
