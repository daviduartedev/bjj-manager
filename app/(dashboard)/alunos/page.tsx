import type { Metadata } from "next";
import { UserPlus, Users } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { StudentsList } from "@/components/students/students-list";
import { DashboardStatTile } from "@/components/layout/dashboard-stat-tile";
import { getStudentCatalog } from "@/lib/data/students-catalog";
import { listStudentsQuery } from "@/lib/data/students-list";
import { ROUTES } from "@/lib/routes";
import { parseAlunosSearchParams } from "@/lib/students/alunos-url";

export const metadata: Metadata = {
  title: "Alunos",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AlunosPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const urlState = parseAlunosSearchParams(raw);

  const [{ belts, plans }, list] = await Promise.all([
    getStudentCatalog(),
    listStudentsQuery({
      q: urlState.q || undefined,
      plan: urlState.plan === "all" ? undefined : urlState.plan,
      status: urlState.status === "all" ? undefined : urlState.status,
      lista: urlState.lista,
      sort: urlState.sort,
      page: urlState.page,
    }),
  ]);

  return (
    <PageFrame
      title="Quem treina aqui"
      icon={Users}
      tone="sky"
      primary={{
        label: "Novo aluno",
        href: ROUTES.alunosNovo,
        icon: <UserPlus className="size-5" aria-hidden />,
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
          <DashboardStatTile
            label="Total na conta"
            value={list.total}
            icon={Users}
            accent="primary"
          />
        </div>
        <StudentsList
          rows={list.rows}
          total={list.total}
          urlState={urlState}
          belts={belts}
          plans={plans}
        />
      </div>
    </PageFrame>
  );
}
