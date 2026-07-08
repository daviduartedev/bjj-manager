"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateGraduationWeight } from "@/actions/graduations";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  studentId: string;
  graduationEventId: string | null;
  weightKg: number | null;
  className?: string;
};

function formatDraft(weightKg: number | null): string {
  if (weightKg == null || !Number.isFinite(weightKg)) return "";
  return String(weightKg).replace(".", ",");
}

function normalizeDraft(raw: string): string {
  return raw.trim().replace(",", ".");
}

function draftsMatch(a: string, b: string): boolean {
  const na = normalizeDraft(a);
  const nb = normalizeDraft(b);
  if (na === "" && nb === "") return true;
  if (na === "" || nb === "") return false;
  const va = Math.round(Number(na) * 10) / 10;
  const vb = Math.round(Number(nb) * 10) / 10;
  return Number.isFinite(va) && Number.isFinite(vb) && va === vb;
}

export function StudentWeightInlineEdit({
  studentId,
  graduationEventId,
  weightKg,
  className,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(formatDraft(weightKg));
  const [saving, setSaving] = useState(false);
  const savedDraftRef = useRef(formatDraft(weightKg));

  useEffect(() => {
    const next = formatDraft(weightKg);
    setDraft(next);
    savedDraftRef.current = next;
  }, [weightKg]);

  if (!graduationEventId) {
    return (
      <span
        className={cn("text-muted-foreground", className)}
        title="Sem graduação registada para este grau"
      >
        –
      </span>
    );
  }

  async function save(nextDraft: string) {
    if (draftsMatch(nextDraft, savedDraftRef.current)) return;

    setSaving(true);
    try {
      const normalized = normalizeDraft(nextDraft);
      const result = await updateGraduationWeight(studentId, {
        graduationId: graduationEventId,
        weight_kg: normalized === "" ? null : normalized,
      });
      if (!result.ok) {
        toast.error(result.error);
        setDraft(savedDraftRef.current);
        return;
      }
      savedDraftRef.current = nextDraft.trim() === "" ? "" : nextDraft.trim();
      toast.success("Peso actualizado.");
      router.refresh();
    } catch {
      toast.error("Não foi possível guardar o peso.");
      setDraft(savedDraftRef.current);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label="Peso em kg"
      placeholder="kg"
      disabled={saving}
      value={draft}
      className={cn(
        "h-9 w-[5.5rem] tabular-nums-crm border-border/80 bg-background/80 px-2 text-crm-sm shadow-none",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        void save(draft);
      }}
    />
  );
}
