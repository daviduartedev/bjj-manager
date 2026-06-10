"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { GraduationEventDialog } from "@/components/graduation/graduation-event-dialog";
import { BeltIllustration } from "@/components/graduation/belt-illustration";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GraduationsPagePayload } from "@/lib/data/graduations-page";
import {
  formatDateBR,
  formatRelativeBR,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import { routeAlunoPerfil } from "@/lib/routes";
import { beltWithDegreeLine } from "@/lib/students/belt-labels";

type Props = {
  payload: GraduationsPagePayload;
};

function formatWeightKg(w: number | null): string | null {
  if (w == null) return null;
  return `${w.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

export function GraduationsPageClient({ payload }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<
    (typeof payload.graduations)[number] | null
  >(null);

  const beltSlug = payload.currentBelt?.slug;
  const beltKind = payload.currentBelt?.kind;
  const beltTitle =
    beltSlug && beltKind
      ? beltWithDegreeLine(beltSlug, beltKind, payload.current_degree)
      : payload.current_degree > 0
        ? `Grau ${payload.current_degree}`
        : "—";

  function openAdd() {
    setEditTarget(null);
    setDialogMode("add");
    setDialogOpen(true);
  }

  function openEdit(row: (typeof payload.graduations)[number]) {
    setEditTarget(row);
    setDialogMode("edit");
    setDialogOpen(true);
  }

  const editInitial = editTarget
    ? {
        graduationId: editTarget.id,
        resulting_belt_id: editTarget.resulting_belt_id,
        resulting_degree: editTarget.resulting_degree,
        graduated_at: toCalendarDateStringInAppTZ(
          new Date(editTarget.graduated_at),
        ),
        was_skip: editTarget.was_skip,
        skip_reason: editTarget.skip_reason,
        weight_kg: editTarget.weight_kg,
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Graduações"
        intro={
          <DashboardBackLink href={routeAlunoPerfil(payload.studentId)}>
            {payload.full_name}
          </DashboardBackLink>
        }
        title="Histórico completo"
        description={beltTitle}
      />

      <Section title="Estado actual">
        <Card className="border-border shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            {beltSlug && beltKind ? (
              <BeltIllustration
                slug={beltSlug}
                kind={beltKind}
                degree={payload.current_degree}
              />
            ) : null}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{beltTitle}</p>
              <p>
                Tempo na faixa: {payload.timeAtBeltPhrase ?? "—"}
                {payload.timeAtDegreePhrase &&
                payload.timeAtDegreePhrase !== payload.timeAtBeltPhrase
                  ? ` · No grau: ${payload.timeAtDegreePhrase}`
                  : null}
              </p>
              {payload.durationBasisNote ? (
                <p className="text-xs">{payload.durationBasisNote}</p>
              ) : null}
            </div>
            <div className="sm:ml-auto">
              <Button type="button" className="min-h-11" onClick={openAdd}>
                <Plus className="mr-2 size-4" aria-hidden />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Eventos">
        {payload.graduations.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Ainda não há graduações registadas.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {payload.graduations.map((g) => {
              const gradDay = toCalendarDateStringInAppTZ(
                new Date(g.graduated_at),
              );
              const weightLabel = formatWeightKg(g.weight_kg);
              return (
                <Card key={g.id} className="border-border shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      {g.belt ? (
                        <BeltIllustration
                          slug={g.belt.slug}
                          kind={g.belt.kind}
                          degree={g.resulting_degree}
                          compact
                        />
                      ) : null}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">
                            {g.belt
                              ? beltWithDegreeLine(
                                  g.belt.slug,
                                  g.belt.kind,
                                  g.resulting_degree,
                                )
                              : `Grau ${g.resulting_degree}`}
                          </span>
                          <Badge variant="outline" className="font-normal">
                            {formatDateBR(gradDay) ?? "—"}
                          </Badge>
                          {weightLabel ? (
                            <Badge variant="secondary" className="font-normal">
                              {weightLabel}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeBR(gradDay, payload.todayYmd) ?? ""}
                        </p>
                        {g.was_skip && g.skip_reason ? (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Justificativa (pulo):{" "}
                            </span>
                            {g.skip_reason}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 shrink-0"
                        onClick={() => openEdit(g)}
                      >
                        <Pencil className="mr-1 size-3.5" aria-hidden />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={routeAlunoPerfil(payload.studentId)}
          className="underline-offset-4 hover:underline"
        >
          Voltar ao perfil
        </Link>
      </p>

      <GraduationEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        studentId={payload.studentId}
        studentKind={payload.kind}
        ageYears={payload.ageYears}
        currentBeltId={payload.current_belt_id}
        currentDegree={payload.current_degree}
        belts={payload.belts}
        initial={editInitial}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
