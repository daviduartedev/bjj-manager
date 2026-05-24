"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { enrollStudent, unenrollStudent } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EnrollmentRow } from "@/lib/data/classes-page";

type StudentOption = { id: string; name: string };

type Props = {
  classId: string;
  enrollments: EnrollmentRow[];
  availableStudents: StudentOption[];
};

export function ClassEnrollmentsPanel({ classId, enrollments, availableStudents }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const enrolledIds = new Set(enrollments.map((e) => e.studentId));
  const notEnrolled = availableStudents.filter((s) => !enrolledIds.has(s.id));

  function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedStudentId) return;

    startTransition(async () => {
      const result = await enrollStudent({ classId, studentId: selectedStudentId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Aluno inscrito na turma.");
      setSelectedStudentId("");
    });
  }

  function handleUnenroll(studentId: string, studentName: string) {
    startTransition(async () => {
      const result = await unenrollStudent({ classId, studentId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${studentName} removido da turma.`);
    });
  }

  return (
    <div className="space-y-6">
      {enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum aluno inscrito nesta turma.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {enrollments.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{e.studentName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleUnenroll(e.studentId, e.studentName)}
                disabled={isPending}
                aria-label={`Remover ${e.studentName} da turma`}
              >
                <UserMinus className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {notEnrolled.length > 0 && (
        <form onSubmit={handleEnroll} className="space-y-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Inscrever aluno</p>

          <div className="flex gap-3">
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
              disabled={isPending}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione o aluno…" />
              </SelectTrigger>
              <SelectContent>
                {notEnrolled.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isPending || !selectedStudentId}
              className="shrink-0"
            >
              <UserPlus className="mr-2 size-4" aria-hidden />
              Inscrever
            </Button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
