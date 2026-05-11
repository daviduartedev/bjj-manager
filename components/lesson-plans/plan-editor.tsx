"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createLessonPlan,
  publishLessonPlan,
  updateLessonPlan,
} from "@/actions/lesson-plans";
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
import { Textarea } from "@/components/ui/textarea";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import { routePedagogicoPlano } from "@/lib/routes";
import type {
  LessonPlanContent,
  LessonPlanItem,
  LessonPlanTopic,
} from "@/lib/validations/lesson-plans";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; lessonPlanId: string; canPublish: boolean };

type Props = {
  mode: Mode;
  initial?: {
    planKind: "adult" | "kids_1" | "kids_2";
    referenceMonth: string;
    title: string;
    internalNotes: string | null;
    content: LessonPlanContent;
  };
};

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyTopic(): LessonPlanTopic {
  return {
    id: genId(),
    title: "Novo tópico",
    kind: "section",
    summary: null,
    items: [],
  };
}

function emptyItem(): LessonPlanItem {
  return { id: genId(), text: "" };
}

export function PlanEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [planKind, setPlanKind] = useState(initial?.planKind ?? "adult");
  const [referenceMonth, setReferenceMonth] = useState(
    initial?.referenceMonth ?? new Date().toISOString().slice(0, 7) + "-01",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes ?? "");
  const [topics, setTopics] = useState<LessonPlanTopic[]>(initial?.content.topics ?? [emptyTopic()]);
  const [summary, setSummary] = useState(initial?.content.summary ?? "");
  const [changeSummary, setChangeSummary] = useState("");

  function updateTopic(idx: number, patch: Partial<LessonPlanTopic>) {
    setTopics((ts) => ts.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function addTopic() {
    setTopics((ts) => [...ts, emptyTopic()]);
  }

  function removeTopic(idx: number) {
    setTopics((ts) => ts.filter((_, i) => i !== idx));
  }

  function moveTopic(idx: number, dir: -1 | 1) {
    setTopics((ts) => {
      const next = [...ts];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return ts;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function setTopicItem(topicIdx: number, itemIdx: number, text: string) {
    setTopics((ts) =>
      ts.map((t, i) =>
        i === topicIdx
          ? { ...t, items: t.items.map((it, j) => (j === itemIdx ? { ...it, text } : it)) }
          : t,
      ),
    );
  }

  function addItem(topicIdx: number) {
    setTopics((ts) =>
      ts.map((t, i) => (i === topicIdx ? { ...t, items: [...t.items, emptyItem()] } : t)),
    );
  }

  function removeItem(topicIdx: number, itemIdx: number) {
    setTopics((ts) =>
      ts.map((t, i) =>
        i === topicIdx ? { ...t, items: t.items.filter((_, j) => j !== itemIdx) } : t,
      ),
    );
  }

  function buildContent(): LessonPlanContent {
    return {
      summary: summary.trim() ? summary.trim() : null,
      topics: topics.map((t) => ({
        ...t,
        title: t.title.trim() || "Tópico sem título",
        summary: t.summary?.trim() ? t.summary.trim() : null,
        items: t.items.filter((it) => it.text.trim().length > 0),
      })),
    };
  }

  function onSave() {
    startTransition(async () => {
      const content = buildContent();
      if (mode.kind === "create") {
        const r = await createLessonPlan({
          planKind,
          referenceMonth,
          title: title.trim(),
          internalNotes,
          content,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        toast.success("Plano criado.");
        router.push(routePedagogicoPlano(r.id));
      } else {
        const r = await updateLessonPlan({
          lessonPlanId: mode.lessonPlanId,
          title: title.trim(),
          internalNotes,
          content,
          changeSummary: changeSummary.trim() || null,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        toast.success(
          r.revisionNumber
            ? `Plano atualizado (revisão #${r.revisionNumber}).`
            : "Plano atualizado.",
        );
        router.refresh();
      }
    });
  }

  function onPublish() {
    if (mode.kind !== "edit") return;
    startTransition(async () => {
      const r = await publishLessonPlan({
        lessonPlanId: mode.lessonPlanId,
        archiveExisting: false,
      });
      if (!r.ok) {
        if (r.error.includes("Já existe")) {
          if (window.confirm("Já existe outro plano publicado para este par. Arquivar e publicar este?")) {
            const retry = await publishLessonPlan({
              lessonPlanId: mode.lessonPlanId,
              archiveExisting: true,
            });
            if (!retry.ok) {
              toast.error(retry.error);
              return;
            }
            toast.success("Plano publicado.");
            router.refresh();
            return;
          }
        }
        toast.error(r.error);
        return;
      }
      toast.success("Plano publicado.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Tipo de plano</Label>
          <Select
            value={planKind}
            onValueChange={(v) => setPlanKind(v as "adult" | "kids_1" | "kids_2")}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">{planKindLabels.adult}</SelectItem>
              <SelectItem value="kids_1">{planKindLabels.kids_1}</SelectItem>
              <SelectItem value="kids_2">{planKindLabels.kids_2}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ref-month">Mês de referência</Label>
          <Input
            id="ref-month"
            type="month"
            value={referenceMonth.slice(0, 7)}
            onChange={(e) => setReferenceMonth(`${e.target.value}-01`)}
            className="min-h-11"
          />
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            className="min-h-11"
          />
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="summary">Resumo (opcional)</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          maxLength={4000}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Tópicos</h3>
          <Button type="button" size="sm" variant="outline" onClick={addTopic}>
            <Plus className="mr-1 size-4" /> Novo tópico
          </Button>
        </div>

        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <div key={topic.id} className="rounded-md border bg-card/40 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={topic.title}
                  onChange={(e) => updateTopic(idx, { title: e.target.value })}
                  className="min-h-11"
                  maxLength={160}
                  placeholder="Título do tópico"
                />
                <Select
                  value={topic.kind}
                  onValueChange={(v) =>
                    updateTopic(idx, { kind: v as LessonPlanTopic["kind"] })
                  }
                >
                  <SelectTrigger className="min-h-11 sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Secção</SelectItem>
                    <SelectItem value="techniques">Técnicas</SelectItem>
                    <SelectItem value="drills">Drills</SelectItem>
                    <SelectItem value="live">Live training</SelectItem>
                    <SelectItem value="general">Generalidades</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTopic(idx, -1)}
                    disabled={idx === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTopic(idx, 1)}
                    disabled={idx === topics.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTopic(idx)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <Textarea
                  value={topic.summary ?? ""}
                  onChange={(e) => updateTopic(idx, { summary: e.target.value })}
                  placeholder="Resumo deste tópico (opcional)"
                  rows={2}
                  maxLength={2000}
                />
                <ul className="space-y-1.5">
                  {topic.items.map((it, j) => (
                    <li key={it.id} className="flex items-center gap-2">
                      <Input
                        value={it.text}
                        onChange={(e) => setTopicItem(idx, j, e.target.value)}
                        placeholder={`Item ${j + 1}`}
                        maxLength={500}
                        className="min-h-11"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(idx, j)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addItem(idx)}
                >
                  <Plus className="mr-1 size-4" /> Adicionar item
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="internal-notes">Notas internas (não saem no PDF)</Label>
        <Textarea
          id="internal-notes"
          value={internalNotes ?? ""}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={3}
          maxLength={2000}
        />
      </section>

      {mode.kind === "edit" ? (
        <section className="space-y-2">
          <Label htmlFor="change-summary">Resumo da alteração (opcional)</Label>
          <Input
            id="change-summary"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            maxLength={500}
            className="min-h-11"
          />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" onClick={onSave} disabled={pending} className="min-h-11">
          {pending ? "Salvando…" : "Salvar"}
        </Button>
        {mode.kind === "edit" && mode.canPublish ? (
          <Button
            type="button"
            variant="outline"
            onClick={onPublish}
            disabled={pending}
            className="min-h-11"
          >
            Publicar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
