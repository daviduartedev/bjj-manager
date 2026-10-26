"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import type { StudentProfilePayload } from "@/lib/data/students-profile.shared";
import { referencedGraduationSummary } from "@/lib/modalities/referenced-graduation-summary";
import { routeAlunoPerfil } from "@/lib/routes";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { PageFrame } from "@/components/prototype/page-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReferencedRankDisplay } from "./referenced-rank-display";
import { ReferencedPromotionHistory } from "./referenced-promotion-history";
import { ReferencedPromotionDialog } from "./referenced-promotion-dialog";
import { ReferencedGraduationReference } from "./referenced-graduation-reference";

export function ReferencedGraduationsPageClient({ profile }: { profile: StudentProfilePayload }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const summary = referencedGraduationSummary(profile, profile.todayYmd);
  const modality = summary.rank?.modality ?? "judo";
  return <PageFrame title={`Graduações — ${profile.full_name}`} emoji="🥋" icon={Award} tone="rose" context={`${modality === "judo" ? "Judô" : "Muay Thai"} · graduação concedida`}>
    <div className="space-y-5">
      <DashboardBackLink href={routeAlunoPerfil(profile.id)}>Perfil do aluno</DashboardBackLink>
      <Card><CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium">Graduação atual</p>
        {summary.rank ? <ReferencedRankDisplay rank={summary.rank} /> : null}
        <p className="text-sm text-muted-foreground">{summary.dateLabel} · {summary.durationLabel}</p>
        <Button onClick={() => setOpen(true)}>Promover</Button>
      </CardContent></Card>
      <ReferencedGraduationReference modality={modality} />
      <ReferencedPromotionHistory events={profile.rankPromotions ?? []} current={profile} />
      {profile.current_rank_code && profile.birth_date ? <ReferencedPromotionDialog modality={modality} open={open} onOpenChange={setOpen} onSuccess={() => router.refresh()}
        studentId={profile.id} currentCode={profile.current_rank_code} currentDate={profile.current_rank_date ?? null} birthDate={profile.birth_date} today={profile.todayYmd} /> : null}
    </div>
  </PageFrame>;
}
