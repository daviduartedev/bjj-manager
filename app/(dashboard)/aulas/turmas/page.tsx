import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus, Users } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listClasses } from "@/lib/data/classes-page";
import { studentKindLabels } from "@/lib/i18n/domain-enums";
import { routeAulasTurma, ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Turmas",
};

export default async function TurmasPage() {
  const classes = await listClasses();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DashboardPageHero
        badge="Aulas"
        title="Turmas"
        description="Gerencie turmas, horários recorrentes e inscrições de alunos."
        aside={
          <Button asChild className="shrink-0">
            <Link href={ROUTES.aulasTurmasNova}>
              <Plus className="mr-2 size-4" aria-hidden />
              Nova turma
            </Link>
          </Button>
        }
      />

      <DashboardPanel icon={CalendarDays} title="Turmas cadastradas">
        {classes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma turma cadastrada.{" "}
            <Link href={ROUTES.aulasTurmasNova} className="underline underline-offset-4">
              Crie a primeira turma
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y">
            {classes.map((c) => (
              <li key={c.id}>
                <Link
                  href={routeAulasTurma(c.id)}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.instructorName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-4" aria-hidden />
                      {c.enrollmentCount}
                    </span>
                    <Badge variant="secondary">{studentKindLabels[c.kind]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  );
}
