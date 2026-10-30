import { Check } from "lucide-react";

import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const HISTORY = [
  { date: "08 out", title: "Uma nova conquista", body: "Graduação registrada com data e responsável.", kind: "graduacao" },
  { date: "06 out", title: "Mais um treino na conta", body: "Presença confirmada na turma da noite.", kind: "aula" },
  { date: "01 out", title: "Mês organizado", body: "Recebimento da mensalidade confirmado.", kind: "mensalidade" },
] as const;

export function LpBelts() {
  return (
    <LpSection id="faixas" className="scroll-mt-24 bg-white">
      <div className="grid items-center gap-12 border-t border-border pt-12 lg:grid-cols-2 lg:gap-24">
        <LpReveal>
          <h2 className="max-w-[16ch] text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
            Cada aluno tem uma história. <span className="text-brand-green">Acompanhe de perto.</span>
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">Da matrícula aos próximos treinos, os registros ajudam você a conhecer o caminho de quem faz parte da academia.</p>
          <ul className="mt-7 space-y-4 text-muted-foreground">
            {["Cadastro, aulas e presença para acompanhar a rotina.", "Mensalidades organizadas ao longo dos meses.", "Histórico de graduação nas modalidades que a utilizam."].map((point) => (
              <li key={point} className="flex items-start gap-3"><Check className="mt-0.5 size-5 shrink-0 text-brand-green" aria-hidden /><span className="leading-relaxed">{point}</span></li>
            ))}
          </ul>
          <p className="mt-6 max-w-[45ch] text-sm leading-relaxed text-muted-foreground">No Boxe, o acompanhamento segue com alunos, aulas, presenças e mensalidades. Faixa e grau não são obrigatórios.</p>
        </LpReveal>
        <LpReveal direction="right">
          <figure aria-label="Exemplo de histórico de uma aluna de Jiu-Jitsu" className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <figcaption className="border-b border-border pb-5">
              <p className="text-sm text-muted-foreground">Histórico do aluno</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">Marina Alves</p>
              <p className="mt-1 text-sm text-brand-blue">Exemplo de Jiu-Jitsu</p>
            </figcaption>
            <ol className="mt-6">
              {HISTORY.map(({ date, title, body, kind }, index) => (
                <li key={title} className="relative grid grid-cols-[3.5rem_1fr] gap-4 pb-7 last:pb-0">
                  <span className="pt-1 text-xs text-muted-foreground">{date}</span>
                  <div className="relative border-l border-border pl-5">
                    <span aria-hidden className={`absolute -left-[4px] top-2 size-[7px] rounded-full ${index === 0 ? "bg-brand-green" : "bg-brand-blue"}`} />
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                    {kind === "graduacao" ? <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-brand-green"><Check className="size-3.5" aria-hidden />Faixa roxa registrada</span> : null}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Demonstração com dados de exemplo.</p>
          </figure>
        </LpReveal>
      </div>
    </LpSection>
  );
}
