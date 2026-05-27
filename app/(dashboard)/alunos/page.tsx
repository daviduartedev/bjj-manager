import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

import { StudentsList } from "@/components/students/students-list";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardStatTile } from "@/components/layout/dashboard-stat-tile";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Gestão operacional"
        title="Alunos"
        description="Cadastro e filtros. Abra uma linha para o perfil ou use a edição rápida."
        aside={
          <>
            <DashboardStatTile label="Total na conta" value={list.total} icon={Users} accent="primary" />
            <Button
              className="min-h-11 shrink-0 shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25"
              asChild
            >
              <Link href={ROUTES.alunosNovo} className="gap-2">
                <UserPlus className="size-4" aria-hidden />
                Novo aluno
              </Link>
            </Button>
          </>
        }
      />

      <StudentsList
        rows={list.rows}
        total={list.total}
        urlState={urlState}
        belts={belts}
        plans={plans}
      />
    </div>
  );
}
