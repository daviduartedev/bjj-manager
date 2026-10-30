import { CalendarDays, Check, CheckCheck, CircleUserRound, LayoutDashboard, Users } from "lucide-react";

import { LpSignupLink } from "@/components/marketing/lp-chrome";
import { LpReveal, LpScrollDrift } from "@/components/marketing/lp-primitives";

const ROUTINES = [
  {
    id: "alunos",
    title: "Chegou aluno novo? Pode deixar organizado.",
    body: "Nome, contato, turma e plano. A ficha reúne o que você precisa para conhecer quem treina e acompanhar sua história desde a matrícula.",
    icon: CircleUserRound,
  },
  {
    id: "aulas",
    title: "O treino começa com a turma em dia.",
    body: "Consulte as aulas e registre quem veio treinar. Assim, a presença faz parte da rotina e você acompanha quem está participando.",
    icon: CalendarDays,
  },
  {
    id: "mensalidades",
    title: "Recebeu? Registre. Precisou? Confira.",
    body: "Veja os vencimentos e acompanhe a situação de cada aluno no mês. Você recebe na academia e confirma o pagamento no Casca.",
    icon: CheckCheck,
  },
  {
    id: "painel",
    title: "Abra o dia sabendo por onde começar.",
    body: "Alunos ativos, aniversariantes e mensalidades que pedem atenção. Um olhar no painel ajuda você a organizar as próximas tarefas.",
    icon: LayoutDashboard,
  },
] as const;

type RoutineId = (typeof ROUTINES)[number]["id"];

function RoutinePreview({ id }: { id: RoutineId }) {
  if (id === "alunos") {
    return (
      <div className="p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-blue/10 font-semibold text-brand-blue">MA</span>
          <div><p className="font-semibold">Marina Alves</p><p className="mt-1 text-sm text-muted-foreground">Aluno ativo</p></div>
          <Check className="ml-auto size-5 text-brand-green" aria-hidden />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-5 text-sm">
          <div><dt className="text-muted-foreground">Turma</dt><dd className="mt-1 font-medium">Noite · 19h</dd></div>
          <div><dt className="text-muted-foreground">Plano</dt><dd className="mt-1 font-medium">Adulto</dd></div>
          <div><dt className="text-muted-foreground">Matrícula</dt><dd className="mt-1 font-medium">08 de outubro</dd></div>
          <div><dt className="text-muted-foreground">Mensalidade</dt><dd className="mt-1 font-medium text-brand-green">Em dia</dd></div>
        </dl>
      </div>
    );
  }
  if (id === "aulas") {
    return (
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Aula de hoje</p><p className="mt-1 text-2xl font-semibold tracking-tight">Turma da noite</p></div><span className="text-lg font-semibold text-brand-blue">19h</span></div>
        <ul className="mt-5 divide-y divide-border">
          {["Marina Alves", "Lucas Santos", "Rafael Costa"].map((name) => (
            <li key={name} className="flex items-center justify-between py-3 text-sm"><span>{name}</span><span className="flex items-center gap-2 text-brand-green"><Check className="size-4" aria-hidden />Presente</span></li>
          ))}
        </ul>
      </div>
    );
  }
  if (id === "mensalidades") {
    return (
      <div className="p-5 sm:p-7">
        <p className="text-sm text-muted-foreground">Mensalidades · Outubro</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">Cada aluno, uma situação clara.</p>
        <dl className="mt-6 divide-y divide-border text-sm">
          <div className="flex items-center justify-between gap-3 py-3"><dt>Marina Alves</dt><dd className="font-medium text-brand-green">Pago</dd></div>
          <div className="flex items-center justify-between gap-3 py-3"><dt>Lucas Santos</dt><dd className="font-medium">Pendente</dd></div>
          <div className="flex items-center justify-between gap-3 py-3"><dt>Rafael Costa</dt><dd className="font-medium text-brand-green">Pago</dd></div>
        </dl>
        <p className="mt-3 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><CheckCheck className="size-4 shrink-0 text-brand-green" aria-hidden />Recebimento confirmado pela academia.</p>
      </div>
    );
  }
  return (
    <div className="p-5 sm:p-7">
      <p className="text-sm text-muted-foreground">Seu painel</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">Vamos organizar o dia?</p>
      <div className="mt-6 flex items-center gap-4 border-y border-border py-5"><Users className="size-6 text-brand-blue" aria-hidden /><span className="text-4xl font-semibold tracking-tight">42</span><span className="text-sm text-muted-foreground">alunos ativos</span></div>
      <ul className="mt-5 space-y-4 text-sm">
        <li className="flex justify-between gap-3"><span>Mensalidades para conferir</span><span className="font-semibold text-brand-blue">3</span></li>
        <li className="flex justify-between gap-3"><span>Aniversariante do dia</span><span className="font-medium">Marina</span></li>
      </ul>
    </div>
  );
}

export function LpProductOverview() {
  return (
    <section id="funcionalidades" aria-label="A rotina da academia, no seu lugar" className="scroll-mt-24 bg-white px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="self-start lg:sticky lg:top-32">
          <LpReveal>
            <h2 className="max-w-[13ch] text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
              A rotina da academia, <span className="text-brand-blue">no seu lugar.</span>
            </h2>
            <p className="mt-6 max-w-[35ch] text-lg leading-relaxed text-muted-foreground">
              Quem toca uma academia sabe: o trabalho continua quando a aula termina. O Casca ajuda a cuidar dessa parte também.
            </p>
            <div className="mt-8"><LpSignupLink className="normal-case tracking-normal">Organizar minha academia</LpSignupLink></div>
          </LpReveal>
        </div>
        <div className="min-w-0">
          {ROUTINES.map(({ id, title, body, icon: Icon }, index) => (
            <article key={id} className={`min-w-0 border-t border-border pb-14 pt-8 ${index > 0 ? "sm:pt-10" : ""}`}>
              <LpReveal>
                <Icon className="mb-5 size-6 text-brand-blue" strokeWidth={1.6} aria-hidden />
                <h3 className="max-w-[23ch] text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-3xl">{title}</h3>
                <p className="mt-4 max-w-[48ch] leading-relaxed text-muted-foreground">
                  {id === "mensalidades" ? <>Veja os vencimentos e acompanhe a situação de cada aluno no mês. <span>Você recebe na academia e confirma o pagamento no Casca.</span></> : body}
                </p>
              </LpReveal>
              <LpScrollDrift distance={16} className="mt-7">
                <figure aria-label={`Exemplo de ${id === "alunos" ? "ficha de aluno" : id === "aulas" ? "presença na aula" : id === "mensalidades" ? "controle de mensalidades" : "painel da academia"}`} className="overflow-hidden rounded-2xl border border-border bg-white">
                  <RoutinePreview id={id} />
                  <figcaption className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-7">Exemplo ilustrativo do Casca.</figcaption>
                </figure>
              </LpScrollDrift>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
