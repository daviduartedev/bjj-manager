"use client";

import { Archive, CheckCircle2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  archiveLessonPlan,
  publishLessonPlan,
  restoreLessonPlan,
} from "@/actions/lesson-plans";
import { PlanStatusBadge } from "@/components/lesson-plans/plan-status-badge";
import { Button } from "@/components/ui/button";

export type PlanStatus = "draft" | "published" | "archived";

type Props = {
  planId: string;
  status: PlanStatus;
  /** Quando true, oculta o badge e a microcopy (modo compacto para listas). */
  compact?: boolean;
  /** Ao mudar de estado, recarrega a página por defeito. Pode-se passar callback custom. */
  onChanged?: () => void;
};

const HINT: Record<PlanStatus, string> = {
  draft: "Rascunho — ainda em construção. Publique para entrar em uso.",
  published: "Plano em uso este mês. Pode ser arquivado quando o ciclo terminar.",
  archived: "Arquivado — fora de uso. Restaure como rascunho se precisar reabrir.",
};

export function PlanStatusSwitcher({
  planId,
  status,
  compact = false,
  onChanged,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    if (onChanged) onChanged();
    else router.refresh();
  }

  function onPublish() {
    startTransition(async () => {
      let r = await publishLessonPlan({
        lessonPlanId: planId,
        archiveExisting: false,
      });
      if (!r.ok) {
        if (
          r.error.includes("Já existe") &&
          window.confirm(
            "Já existe outro plano publicado para este par (tipo + mês). Arquivar o anterior e publicar este?",
          )
        ) {
          r = await publishLessonPlan({
            lessonPlanId: planId,
            archiveExisting: true,
          });
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
        } else {
          toast.error(r.error);
          return;
        }
      }
      toast.success("Plano publicado.");
      refresh();
    });
  }

  function onArchive() {
    if (!window.confirm("Arquivar este plano?")) return;
    startTransition(async () => {
      const r = await archiveLessonPlan({ lessonPlanId: planId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Plano arquivado.");
      refresh();
    });
  }

  function onRestore() {
    startTransition(async () => {
      const r = await restoreLessonPlan({ lessonPlanId: planId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Plano restaurado como rascunho.");
      refresh();
    });
  }

  const buttons: React.ReactNode[] = [];
  if (status === "draft") {
    buttons.push(
      <Button
        key="publish"
        type="button"
        size={compact ? "sm" : "default"}
        onClick={onPublish}
        disabled={pending}
        className={compact ? "h-8 px-2 text-[11px]" : "min-h-11"}
      >
        <CheckCircle2 className="mr-1.5 size-4" />
        Publicar
      </Button>,
      <Button
        key="archive-draft"
        type="button"
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={onArchive}
        disabled={pending}
        className={compact ? "h-8 px-2 text-[11px]" : "min-h-11"}
      >
        <Archive className="mr-1.5 size-4" />
        Arquivar
      </Button>,
    );
  } else if (status === "published") {
    buttons.push(
      <Button
        key="archive-published"
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={onArchive}
        disabled={pending}
        className={compact ? "h-8 px-2 text-[11px]" : "min-h-11"}
      >
        <Archive className="mr-1.5 size-4" />
        Arquivar
      </Button>,
    );
  } else {
    buttons.push(
      <Button
        key="restore"
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={onRestore}
        disabled={pending}
        className={compact ? "h-8 px-2 text-[11px]" : "min-h-11"}
      >
        <RotateCcw className="mr-1.5 size-4" />
        Restaurar
      </Button>,
    );
  }

  if (compact) {
    return <div className="inline-flex flex-wrap gap-1">{buttons}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card/50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-crm-xs font-medium text-muted-foreground uppercase tracking-wider">
          Estado
        </span>
        <PlanStatusBadge status={status} />
      </div>
      <p className="basis-full text-crm-xs text-muted-foreground sm:basis-auto sm:flex-1">
        {HINT[status]}
      </p>
      <div className="flex flex-wrap gap-2">{buttons}</div>
    </div>
  );
}
