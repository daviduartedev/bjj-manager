"use client";

import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES, routeMatriculaTermoNovo } from "@/lib/routes";
import { Users } from "lucide-react";

type Student = {
  id: string;
  full_name: string;
  birth_date: string | null;
};

export function StudentPicker({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum aluno encontrado"
        description="Cadastre um aluno primeiro para iniciar a matrícula/termo."
        className="rounded-none border-0 bg-transparent shadow-none"
      >
        <Button asChild className="min-h-11">
          <Link href={ROUTES.alunosNovo}>Cadastrar aluno</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {students.map((s) => (
        <li key={s.id}>
          <Button
            variant="ghost"
            className="h-auto min-h-11 w-full justify-start rounded-none px-4 py-3"
            asChild
          >
            <Link href={routeMatriculaTermoNovo(s.id)}>{s.full_name}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}
