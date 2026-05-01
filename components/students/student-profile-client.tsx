"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";

import { Section } from "@/components/layout/section";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudentProfilePayload } from "@/lib/data/students-profile.shared";
import { profileFormatPaidAt } from "@/lib/data/students-profile.shared";
import {
  formatDateBR,
  formatRelativeBR,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { ROUTES, routeAlunoEditar } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { beltLabelPt } from "@/lib/students/belt-labels";
import { maskCpfInput, maskPhoneBrInput } from "@/lib/students/input-masks";
import {
  formatMoneyBrFromCents,
  paymentStatusLabelPt,
} from "@/lib/students/payment-ui";

type Props = {
  profile: StudentProfilePayload;
};

function kindLabel(kind: "adult" | "kids"): string {
  return kind === "adult" ? "Adulto" : "Kids";
}

function ProfileSurfaceCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "border-border/90 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="type-meta-label">{label}</p>
      <p className="text-crm-sm text-foreground">{value}</p>
    </div>
  );
}

export function StudentProfileClient({ profile }: Props) {
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const beltSlug = profile.currentBelt?.slug;
  const beltKind = profile.currentBelt?.kind;
  const beltTitle =
    beltSlug && beltKind
      ? `${beltLabelPt(beltSlug, beltKind)} · grau ${profile.current_degree}`
      : `Grau ${profile.current_degree}`;

  const showKidsAdultBanner =
    profile.kind === "kids" &&
    profile.ageYears !== null &&
    profile.ageYears >= 16;

  const ageDisplay =
    profile.ageYears === null ? "—" : `${profile.ageYears} anos`;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Perfil do aluno"
        intro={<DashboardBackLink href={ROUTES.alunos}>Alunos</DashboardBackLink>}
        title={profile.full_name}
        description={`${beltTitle} · ${kindLabel(profile.kind)} · ${ageDisplay}`}
      />

      <ProfileSurfaceCard>
        <CardContent className="flex flex-col gap-6 p-6 pt-6 sm:flex-row sm:items-start">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
            <UserRound className="size-10" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{beltTitle}</Badge>
              <Badge variant="outline">{kindLabel(profile.kind)}</Badge>
              <StudentStatusBadge status={profile.status} />
              <span className="text-sm text-muted-foreground">{ageDisplay}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="min-h-11" asChild>
                <Link href={routeAlunoEditar(profile.id)}>Editar</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setPromoteOpen(true)}
              >
                Promover
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setPaymentOpen(true)}
              >
                Registrar pagamento
              </Button>
            </div>
          </div>
        </CardContent>
      </ProfileSurfaceCard>

      {showKidsAdultBanner ? (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          <p className="font-medium">Transição para faixa adulta</p>
          <p className="mt-1 text-muted-foreground">
            Este aluno está classificado como Kids e já tem 16 anos ou mais. Revise
            a faixa adulta aplicável (decisão do professor, conforme IBJJF).
          </p>
        </div>
      ) : null}

      <Tabs defaultValue="dados" className="w-full">
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex w-max min-w-full justify-start sm:w-auto">
            <TabsTrigger value="dados" className="min-h-11 shrink-0">
              Dados pessoais
            </TabsTrigger>
            <TabsTrigger value="graduacao" className="min-h-11 shrink-0">
              Graduação
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="min-h-11 shrink-0">
              Financeiro
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dados" className="space-y-4">
          <Section title="Identificação e contactos">
            <ProfileSurfaceCard>
              <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                <Field
                  label="Data de nascimento"
                  value={formatDateBR(profile.birth_date) ?? "—"}
                />
                <Field
                  label="Entrada na academia"
                  value={formatDateBR(profile.academy_start_date) ?? "—"}
                />
                <Field
                  label="Documento"
                  value={
                    profile.document
                      ? maskCpfInput(profile.document)
                      : "—"
                  }
                />
                <Field
                  label="Telefone"
                  value={
                    profile.phone ? maskPhoneBrInput(profile.phone) : "—"
                  }
                />
                <Field label="E-mail" value={profile.email ?? "—"} />
              </CardContent>
            </ProfileSurfaceCard>
          </Section>
          <Section title="Observações">
            <ProfileSurfaceCard>
              <CardContent className="p-6">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {profile.notes?.trim() ? profile.notes : "—"}
                </p>
              </CardContent>
            </ProfileSurfaceCard>
          </Section>
        </TabsContent>

        <TabsContent value="graduacao" className="space-y-4">
          <Section title="Estado actual">
            <ProfileSurfaceCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  {beltTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    Tempo na faixa e no grau actuais:{" "}
                  </span>
                  {profile.timeAtBeltPhrase ?? "—"}
                  {profile.timeAtDegreePhrase &&
                  profile.timeAtDegreePhrase !== profile.timeAtBeltPhrase ? (
                    <> · grau: {profile.timeAtDegreePhrase}</>
                  ) : null}
                </p>
                {profile.academy_start_date ? (
                  <p>
                    <span className="font-medium text-foreground">
                      Tempo na academia:{" "}
                    </span>
                    {profile.timeSinceJoinedPhrase ?? "—"}
                  </p>
                ) : null}
                {profile.durationBasisNote ? (
                  <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
                    {profile.durationBasisNote}
                  </p>
                ) : null}
              </CardContent>
            </ProfileSurfaceCard>
          </Section>
          <Section title="Histórico">
            {profile.graduations.length === 0 ? (
              <ProfileSurfaceCard>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Ainda não há graduações registadas.
                </CardContent>
              </ProfileSurfaceCard>
            ) : (
              <div className="flex flex-col gap-3">
                {profile.graduations.map((g) => {
                  const gradDay = toCalendarDateStringInAppTZ(
                    new Date(g.graduated_at),
                  );
                  return (
                  <ProfileSurfaceCard key={g.id}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {g.belt
                            ? `${beltLabelPt(g.belt.slug, g.belt.kind)} · grau ${g.resulting_degree}`
                            : `Grau ${g.resulting_degree}`}
                        </span>
                        <Badge variant="outline" className="font-normal">
                          {formatDateBR(gradDay) ?? "—"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeBR(gradDay, profile.todayYmd) ?? ""}
                      </p>
                      {g.was_skip && g.skip_reason ? (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Justificativa (pulo):{" "}
                          </span>
                          {g.skip_reason}
                        </p>
                      ) : null}
                    </CardContent>
                  </ProfileSurfaceCard>
                  );
                })}
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Section title="Plano e vínculo">
            {profile.billing ? (
              <ProfileSurfaceCard>
                <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                  <Field label="Plano" value={profile.billing.plan_name} />
                  <Field
                    label="Valor"
                    value={
                      profile.billing.effective_price_cents !==
                      profile.billing.price_cents ? (
                        <>
                          {formatMoneyBrFromCents(
                            profile.billing.effective_price_cents,
                          )}
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Preço personalizado (padrão do plano:{" "}
                            {formatMoneyBrFromCents(profile.billing.price_cents)})
                          </span>
                        </>
                      ) : (
                        formatMoneyBrFromCents(profile.billing.price_cents)
                      )
                    }
                  />
                  <Field
                    label="Dia de vencimento"
                    value={`Dia ${profile.billing.due_day}`}
                  />
                </CardContent>
              </ProfileSurfaceCard>
            ) : (
              <ProfileSurfaceCard>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Sem plano ativo associado. Associe um plano na ficha completa.
                </CardContent>
              </ProfileSurfaceCard>
            )}
          </Section>
          <Section
            title="Mês corrente"
            description={
              formatDateBR(profile.currentMonthFirstDay) ?? profile.currentMonthFirstDay
            }
          >
            <ProfileSurfaceCard>
              <CardContent className="flex flex-wrap items-center gap-3 p-6">
                <span className="text-lg font-semibold text-foreground">
                  {profile.currentMonthStatusLabel}
                </span>
                {profile.currentMonthOverdue ? (
                  <Badge variant="destructive">Atrasado</Badge>
                ) : null}
              </CardContent>
            </ProfileSurfaceCard>
          </Section>
          <Section title="Últimos pagamentos">
            {profile.paymentsRecent.length === 0 ? (
              <ProfileSurfaceCard>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Nenhum pagamento registado ainda.
                </CardContent>
              </ProfileSurfaceCard>
            ) : (
              <ProfileSurfaceCard className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pago em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.paymentsRecent.map((p) => (
                      <TableRow key={p.reference_month}>
                        <TableCell className="font-medium">
                          {formatDateBR(p.reference_month)}
                        </TableCell>
                        <TableCell>{paymentStatusLabelPt(p.status)}</TableCell>
                        <TableCell>
                          {formatMoneyBrFromCents(p.amount_cents)}
                        </TableCell>
                        <TableCell>{profileFormatPaidAt(p.paid_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ProfileSurfaceCard>
            )}
          </Section>
        </TabsContent>
      </Tabs>

      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promover graduação</DialogTitle>
            <DialogDescription>
              O registo completo de graduações (grau e faixa, com regras de pulo)
              será disponibilizado numa próxima entrega. Por agora não há alterações
              na base de dados a partir deste ecrã.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => setPromoteOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              O fluxo de mensalidades e estados por mês será integrado numa próxima
              entrega. Este botão ainda não grava pagamentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => setPaymentOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
