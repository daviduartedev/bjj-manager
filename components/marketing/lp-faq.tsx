import { LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const FAQ_ITEMS = [
  { q: "O Casca é para a minha modalidade?", a: "O Casca atende academias de Muay Thai, Boxe, Jiu-Jitsu e Judô. Você organiza alunos, turmas, aulas e mensalidades, com o acompanhamento de graduação quando ele faz parte da modalidade." },
  { q: "No Boxe também dá para usar?", a: "Sim. No Boxe, você acompanha alunos, aulas, presenças e mensalidades, sem precisar cadastrar faixa ou grau." },
  { q: "O Casca recebe as mensalidades dos meus alunos?", a: "A academia continua recebendo dos alunos. Você acompanha os vencimentos e confirma no Casca quando o pagamento acontece." },
  { q: "Meus alunos podem acessar?", a: "Podem, se você liberar o portal do aluno. Cada um entra no próprio espaço para consultar aulas, presença e informações financeiras. A equipe continua cuidando da operação da academia." },
  { q: "Os dados da minha academia ficam separados?", a: "Sim. Cada academia acessa os próprios alunos, registros e configurações. As informações de uma academia não aparecem para outra." },
  { q: "Quando começo a pagar pelo Casca?", a: "Você escolhe o plano, cadastra a academia, confirma seu e-mail e conclui a adesão com cartão. A primeira mensalidade da assinatura é cobrada na adesão. Depois, a cobrança segue o ciclo mensal." },
  { q: "E se eu precisar cancelar?", a: "Você pode cancelar a assinatura. O acesso continua até o fim do período já pago. Se houver pagamento em aberto, a academia passa para somente leitura, com dados e históricos preservados." },
] as const;

export function LpFaq() {
  return (
    <LpSection id="faq" className="scroll-mt-24 bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <LpReveal>
          <h2 className="max-w-[17ch] text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.045em] text-foreground">
            Ficou alguma dúvida? <span className="text-brand-blue">Vamos por partes.</span>
          </h2>
          <p className="mt-6 max-w-[35ch] text-lg leading-relaxed text-muted-foreground">Sobre a academia, os alunos e a assinatura. Tudo explicado para você decidir.</p>
        </LpReveal>
        <div className="space-y-2">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden">
                <span>{q}</span><span aria-hidden className="shrink-0 text-2xl font-normal text-brand-blue"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span>
              </summary>
              <p className="max-w-[57ch] pb-6 leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </LpSection>
  );
}
