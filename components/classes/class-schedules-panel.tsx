"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addRecurringSchedule, deleteRecurringSchedule } from "@/actions/classes";
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
import type { ScheduleRow } from "@/lib/data/classes-page";

const DAY_LABELS: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

type Props = {
  classId: string;
  schedules: ScheduleRow[];
};

export function ClassSchedulesPanel({ classId, schedules }: Props) {
  const [isPending, startTransition] = useTransition();
  const [dayOfWeek, setDayOfWeek] = useState<string>("1");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("20:30");
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await addRecurringSchedule({
        classId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("Horário adicionado. Sessões geradas para os próximos 14 dias.");
      setDayOfWeek("1");
      setStartTime("19:00");
      setEndTime("20:30");
    });
  }

  function handleDelete(scheduleId: string) {
    startTransition(async () => {
      const result = await deleteRecurringSchedule({ scheduleId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Horário removido.");
    });
  }

  return (
    <div className="space-y-6">
      {schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum horário recorrente cadastrado.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {schedules.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">
                <span className="font-medium">{DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek}</span>
                {" · "}
                {s.startTime} – {s.endTime}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(s.id)}
                disabled={isPending}
                aria-label="Remover horário"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-4 rounded-lg border p-4">
        <p className="text-sm font-medium">Adicionar horário recorrente</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sched-day">Dia da semana</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek} disabled={isPending}>
              <SelectTrigger id="sched-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sched-start">Início</Label>
            <Input
              id="sched-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sched-end">Fim</Label>
            <Input
              id="sched-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          {isPending ? "Salvando…" : "Adicionar horário"}
        </Button>
      </form>
    </div>
  );
}
