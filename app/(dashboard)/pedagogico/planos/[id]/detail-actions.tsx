"use client";

import { Copy, FileDown } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { duplicateLessonPlan, exportLessonPlanPdf } from "@/actions/lesson-plans";
import { Button } from "@/components/ui/button";
import { routePedagogicoPlano } from "@/lib/routes";

type Props = {
  planId: string;
  status: "draft" | "published" | "archived";
  planKind: "adult" | "kids_1" | "kids_2";
  referenceMonth: string;
  title: string;
};

function nextMonth(refMonth: string): string {
  const [y, m] = refMonth.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function PlanDetailActions({ planId, referenceMonth, title }: Props) {
  const [pending, startTransition] = useTransition();

  function onExport() {
    startTransition(async () => {
      const r = await exportLessonPlanPdf({ lessonPlanId: planId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
    });
  }

  function onDuplicate() {
    startTransition(async () => {
      const target = nextMonth(referenceMonth);
      const r = await duplicateLessonPlan({
        lessonPlanId: planId,
        targetReferenceMonth: target,
        title: `${title} (cópia)`,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Plano duplicado.");
      window.location.assign(routePedagogicoPlano(r.id));
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onExport}
        disabled={pending}
        className="min-h-11"
      >
        <FileDown className="mr-2 size-4" /> Exportar PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDuplicate}
        disabled={pending}
        className="min-h-11"
      >
        <Copy className="mr-2 size-4" /> Duplicar
      </Button>
    </>
  );
}
