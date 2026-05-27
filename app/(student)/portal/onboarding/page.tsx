import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
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
    <div className="mx-auto max-w-lg space-y-6">
      <DashboardPageHero
        badge="Portal do aluno"
        title="Bem-vindo ao portal"
        description="Confirme os termos para aceder às aulas e serviços da academia."
      />
      <DashboardPanel title="Primeiros passos" subtitle="Termos e contacto do responsável">
        <StudentOnboardingForm
          studentName={student.full_name}
          requiresGuardianEmail={requiresGuardianEmail}
        />
      </DashboardPanel>
    </div>
  );
}
