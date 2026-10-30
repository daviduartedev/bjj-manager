import { CalendarDays, Check, CheckCheck, CircleUserRound, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal } from "@/components/marketing/lp-primitives";

const STUDENTS = [
  ["MA", "Marina Alves", "Turma da noite", "Adulto"],
  ["LS", "Lucas Santos", "Turma da manhã", "Adulto"],
  ["RC", "Rafael Costa", "Kids", "Kids 1"],
] as const;

function RoutineCard({
  icon: Icon,
  name,
  title,
  body,
  className,
  delay,
  children,
}: {
  icon: LucideIcon;
  name: string;
  title: string;
  body: string;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <LpReveal className={className} delay={delay}>
      <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-[0_10px_60px_-32px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-1 sm:p-9">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green">
          <Icon className="size-4" aria-hidden />
          {name}
        </p>
        <h3 className="mt-5 max-w-[22ch] text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.75rem]">{title}</h3>
        <p className="mt-3 max-w-[44ch] leading-relaxed text-muted-foreground">{body}</p>
        <div aria-hidden className="mt-auto pt-9">{children}</div>
      </article>
    </LpReveal>
  );
}

/** Rotina em grade bento: as quatro tarefas visíveis de uma vez, cada uma com sua prévia. */
export function LpProductOverview() {
  return (
    <section id="funcionalidades" aria-label="A rotina da academia, no seu lugar" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <LpReveal className="grid gap-7 lg:grid-cols-2 lg:items-end lg:gap-20">
          <h2 className="max-w-[16ch] text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">A rotina da academia, <span className="text-brand-green">no seu lugar.</span></h2>
          <p className="max-w-[42ch] text-lg leading-relaxed text-muted-foreground">Quem toca uma academia sabe: o trabalho continua quando a aula termina. Encontre o que precisa para cuidar dessa parte também.</p>
        </LpReveal>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          <RoutineCard className="sm:col-span-2 lg:col-span-4" icon={CircleUserRound} name="Alunos" title="Chegou aluno novo? Pode deixar organizado." body="Nome, contato, turma e plano. A ficha acompanha quem treina desde a matrícula.">
            <ul className="divide-y divide-black/[0.05] rounded-2xl bg-neutral-50 px-4 sm:px-5">
              {STUDENTS.map(([initials, name, group, plan]) => (
                <li key={name} className="flex items-center gap-3 py-3.5 text-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-semibold text-brand-blue">{initials}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                  <span className="hidden text-muted-foreground sm:block sm:w-32">{group}</span>
                  <span className="hidden text-muted-foreground md:block md:w-16">{plan}</span>
                  <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-medium text-brand-green">Ativo</span>
                </li>
              ))}
            </ul>
          </RoutineCard>

          <RoutineCard className="lg:col-span-2" delay={0.08} icon={CalendarDays} name="Aulas" title="O treino começa com a turma em dia." body="Consulte as aulas, registre a presença e acompanhe quem está participando.">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold tracking-[-0.05em] text-foreground">19h</p>
                <p className="mt-2 text-sm text-muted-foreground">Turma da noite</p>
              </div>
              <div className="text-right">
                <div className="flex justify-end -space-x-2">
                  {["MA", "LS", "RC"].map((initials) => (
                    <span key={initials} className="flex size-8 items-center justify-center rounded-full bg-brand-green text-[10px] font-semibold text-white ring-2 ring-white">{initials}</span>
                  ))}
                </div>
                <p className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-brand-green"><Check className="size-4" />12 presentes</p>
              </div>
            </div>
          </RoutineCard>

          <RoutineCard className="lg:col-span-2" icon={CheckCheck} name="Mensalidades" title="Recebeu? Registre. Precisou? Confira." body="Você recebe na academia e confirma o pagamento no Casca.">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Outubro</span>
              <span className="text-muted-foreground">38 de 42 confirmadas</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-[90%] rounded-full bg-brand-green" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Recebimento confirmado pela academia.</p>
          </RoutineCard>

          <RoutineCard className="sm:col-span-2 lg:col-span-4" delay={0.08} icon={LayoutDashboard} name="Painel" title="Abra o dia sabendo por onde começar." body="Alunos ativos, aniversariantes e mensalidades que pedem atenção, juntos no painel.">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                ["42", "alunos ativos", "text-brand-green"],
                ["3", "mensalidades para conferir", "text-brand-blue"],
                ["1", "aniversariante hoje", "text-foreground"],
              ].map(([value, label, tone]) => (
                <div key={label} className="rounded-2xl bg-neutral-50 p-4 sm:p-5">
                  <p className={`text-3xl font-semibold tracking-[-0.05em] sm:text-4xl ${tone}`}>{value}</p>
                  <p className="mt-2 text-xs leading-snug text-muted-foreground sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </RoutineCard>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">Exemplos ilustrativos do Casca.</p>
        <div className="mt-10 flex justify-center"><LpSignupLink>Organizar minha academia</LpSignupLink></div>
      </div>
    </section>
  );
}
