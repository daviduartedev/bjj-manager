"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routeMatriculaTermoNovo } from "@/lib/routes";

type Student = {
  id: string;
  full_name: string;
  birth_date: string | null;
};

export function StudentPicker({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <p className="text-crm-sm text-muted-foreground">
        Nenhum aluno encontrado.{" "}
        <Link href="/alunos/novo" className="text-primary underline-offset-4 hover:underline">
          Cadastre um aluno
        </Link>{" "}
        primeiro.
      </p>
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
