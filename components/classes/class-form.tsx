"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createClass, updateClass } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentKindLabels } from "@/lib/i18n/domain-enums";
import { routeAulasTurma, ROUTES } from "@/lib/routes";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; classId: string };

type Props = {
  mode: Mode;
  instructorProfileId: string;
  initial?: {
    name: string;
    kind: "adult" | "kids";
  };
};

export function ClassForm({ mode, instructorProfileId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<"adult" | "kids">(initial?.kind ?? "adult");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = { name, kind, instructorProfileId };

      const result =
        mode.kind === "create"
          ? await createClass(payload)
          : await updateClass({ ...payload, classId: mode.classId });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success(mode.kind === "create" ? "Turma criada." : "Turma atualizada.");

      if (mode.kind === "create" && result.id) {
        router.push(routeAulasTurma(result.id));
      } else if (mode.kind === "edit") {
        router.push(routeAulasTurma(mode.classId));
      } else {
        router.push(ROUTES.aulasTurmas);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="class-name">Nome da turma</Label>
        <Input
          id="class-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Turma Adulto Noite"
          required
          maxLength={100}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="class-kind">Modalidade</Label>
        <Select
          value={kind}
          onValueChange={(v) => setKind(v as "adult" | "kids")}
          disabled={isPending}
        >
          <SelectTrigger id="class-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["adult", "kids"] as const).map((k) => (
              <SelectItem key={k} value={k}>
                {studentKindLabels[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending
          ? mode.kind === "create"
            ? "Criando…"
            : "Salvando…"
          : mode.kind === "create"
            ? "Criar turma"
            : "Salvar alterações"}
      </Button>
    </form>
  );
}
