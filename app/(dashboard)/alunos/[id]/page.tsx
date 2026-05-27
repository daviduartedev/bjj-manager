import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StudentProfileClient } from "@/components/students/student-profile-client";
import { listStudentAttendancesForProfessor } from "@/lib/data/student-attendances";
import { getStudentProfileById } from "@/lib/data/students-profile";
import { STUDENT_ATTENDANCE_PAGE_SIZE } from "@/lib/constants/classes";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getStudentProfileById(id);
  return {
    title: profile ? `${profile.full_name}, Aluno` : "Aluno",
  };
}

export default async function AlunoPerfilPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab, page: pageParam } = await searchParams;
  const profile = await getStudentProfileById(id);
  if (!profile) notFound();

  const attendancePage = Math.max(1, Number(pageParam) || 1);
  const attendanceResult = await listStudentAttendancesForProfessor(id, attendancePage);

  return (
    <StudentProfileClient
      profile={profile}
      defaultTab={tab === "presenca" ? "presenca" : undefined}
      attendance={
        attendanceResult.ok
          ? attendanceResult.data
          : {
              rows: [],
              total: 0,
              page: 1,
              pageSize: STUDENT_ATTENDANCE_PAGE_SIZE,
              totalPages: 1,
            }
      }
      attendanceError={attendanceResult.ok ? null : attendanceResult.error}
    />
  );
}
