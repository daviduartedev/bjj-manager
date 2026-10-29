import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpMark, LpReveal, LpScrollDrift } from "@/components/marketing/lp-primitives";

const steps = [
  {
    title: "Cadastre quem treina",
    body: "Comece pela ficha do aluno: turma, plano, faixa, grau, contato e vencimento.",
  },
  {
    title: "Registre o que acontece",
    body: "Aulas, presença, graduação e mensalidade entram no histórico quando a rotina acontece.",
  },
  {
    title: "Abra o painel e decida",
    body: "Veja o que venceu, quem faz aniversário e quais graduações pedem atenção.",
  },
] as const;

export function LpHowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-white px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
      <LpScrollDrift distance={48} rotate={1.2} scaleFrom={0.97} className="mx-auto max-w-7xl">
      <div className="overflow-hidden rounded-[2.25rem] bg-brand-green px-6 py-12 text-white sm:rounded-[3rem] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <LpReveal direction="left" duration={1.05}>
          <p className="text-sm font-semibold text-white/75">Como funciona</p>
          <LpDisplay surface="dark" className="mt-4 max-w-[17ch] text-[clamp(2.25rem,5vw,4rem)]">
            Da matrícula ao fim do mês, <LpMark className="text-neutral-950">sem perder o fio</LpMark>.
          </LpDisplay>
          <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-white/80 sm:text-lg">
            O Casca segue a ordem natural da academia. Você registra uma vez e usa a mesma informação na
            rotina, no histórico e no painel.
          </p>
        </LpReveal>

        <LpReveal direction="scale" className="mt-12 sm:mt-16" duration={1.05}>
          <ol className="grid gap-8 border-t border-white/25 pt-10 lg:grid-cols-3 lg:gap-12">
            {steps.map(({ title, body }) => (
              <li key={title} className="ease-lp-expo transition-transform duration-300 hover:-translate-y-2">
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-white">{title}</h3>
                <p className="mt-3 max-w-[35ch] leading-relaxed text-white/75">{body}</p>
              </li>
            ))}
          </ol>
        </LpReveal>

        <LpReveal direction="right" className="mt-12 sm:mt-14">
          <LpPillCta tone="yellow" align="center">
            Organizar minha academia
          </LpPillCta>
        </LpReveal>
      </div>
      </LpScrollDrift>
    </section>
  );
}
