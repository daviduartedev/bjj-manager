import { ReferencedGraduationReference } from "@/components/graduation/referenced-graduation-reference";
import { ReferencedRankDisplay } from "@/components/graduation/referenced-rank-display";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import type { OwnStudentPortalProfile } from "@/lib/data/student-portal-profile";
import { formatDateBR, toCalendarDateStringInAppTZ } from "@/lib/dates";
import { studentKindLabels } from "@/lib/i18n/domain-enums";
import { MODALITY_LABELS } from "@/lib/modalities/catalog";
import { referencedGraduationSummary } from "@/lib/modalities/referenced-graduation-summary";
import { beltWithDegreeLine } from "@/lib/students/belt-labels";

export function StudentProfileSummary({ profile }: { profile: OwnStudentPortalProfile }) {
  const referenced = profile.modality === "judo" || profile.modality === "muay_thai";
  const rank = referencedGraduationSummary(profile, toCalendarDateStringInAppTZ(new Date()));
  return <div className="space-y-6">
    <DashboardPanel title="Minha ficha" subtitle={profile.academyName}>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" value={profile.full_name} />
        <Field label="Modalidade" value={MODALITY_LABELS[profile.modality]} />
        <Field label="Público" value={studentKindLabels[profile.kind]} />
        <Field label="Nascimento" value={formatDateBR(profile.birth_date) ?? "Não informado"} />
        <Field label="Entrada na academia" value={formatDateBR(profile.academy_start_date) ?? "Não informada"} />
        <Field label="Telefone" value={profile.phone ?? "Não informado"} />
        <Field label="E-mail" value={profile.email ?? "Não informado"} />
        <Field label="Peso" value={profile.weight_kg == null ? "Não informado" : `${profile.weight_kg} kg`} />
      </dl>
      <p className="mt-5 text-sm text-muted-foreground">Para atualizar sua ficha, fale com o professor.</p>
    </DashboardPanel>
    {profile.modality !== "boxing" ? <DashboardPanel title={profile.modality === "muay_thai" ? "Graduação — khan/prajied" : "Graduação atual"}>
      {referenced ? <div className="space-y-3">
        {rank.rank ? <ReferencedRankDisplay rank={rank.rank} /> : <p>Graduação não informada</p>}
        <p className="text-sm">Data da graduação: {rank.dateLabel}</p>
        <p className="text-sm text-muted-foreground">{rank.durationLabel}</p>
        <ReferencedGraduationReference modality={profile.modality} />
      </div> : <p>{profile.currentBelt ? beltWithDegreeLine(profile.currentBelt.slug, profile.currentBelt.kind, profile.current_degree ?? 0) : "Graduação não informada"}</p>}
    </DashboardPanel> : null}
  </div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>;
}
