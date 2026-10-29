import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const faqItems = [
  {
    q: "O Casca serve para quais artes marciais?",
    a: "O sistema atende academias que trabalham com alunos de diferentes idades, turmas, presença, mensalidades e graduação. Faixas e graus fazem parte da rotina desde o cadastro.",
  },
  {
    q: "Os dados da minha academia ficam misturados com outras?",
    a: "Não. Cada academia acessa apenas os próprios alunos, registros e configurações. Uma operação não aparece para outra.",
  },
  {
    q: "Meus alunos também podem acessar?",
    a: "Podem, se a academia liberar o portal. A equipe continua na área operacional; o aluno entra no próprio espaço para consultar aulas, presença e financeiro.",
  },
  {
    q: "Como entram as mensalidades dos alunos?",
    a: "O Casca não recebe a mensalidade no lugar da academia. Você acompanha o mês e confirma o pagamento quando o recebimento acontece na sua operação.",
  },
  {
    q: "Quando a assinatura do Casca é cobrada?",
    a: "Depois de escolher o plano, cadastrar a academia e confirmar o e-mail, você conclui a adesão com cartão. A primeira mensalidade é cobrada na adesão e as próximas seguem o ciclo mensal.",
  },
  {
    q: "O que acontece se eu cancelar ou não pagar?",
    a: "Ao cancelar, o acesso continua até o fim do período já pago. Sem pagamento regularizado, a academia passa para o modo somente leitura, com dados e históricos preservados.",
  },
] as const;

export function LpFaq() {
  return (
    <LpSection id="faq" className="relative z-10 bg-[#f4f6f8]">
      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        <LpReveal direction="left" duration={1.05}>
          <div className="mb-12 lg:sticky lg:top-28 lg:mb-0">
            <LpDisplay surface="light" className="max-w-[13ch] text-[clamp(2.25rem,5vw,4rem)]">
              Perguntas de quem vai colocar a academia no Casca.
            </LpDisplay>
            <p className="mt-6 max-w-[38ch] leading-relaxed text-muted-foreground">
              Respostas diretas sobre operação, acesso e cobrança.
            </p>
          </div>
        </LpReveal>

        <LpReveal direction="right" duration={1.05}>
          <div className="flex flex-col divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="ease-lp-expo group transition-transform duration-300 hover:translate-x-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#f4f6f8]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground outline-none sm:gap-6 sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-blue font-sans text-xl font-semibold leading-none text-white"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-[58ch] pb-5 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
