import { ChevronDown } from "lucide-react";

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
      <LpReveal>
        <h2 className="text-balance text-[clamp(2.25rem,4.2vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.04em] text-foreground">
          Ficou com alguma dúvida, mestrão? <span className="text-brand-blue">O Casca responde.</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">Sobre a academia, os alunos e a assinatura. Tudo explicado para você decidir.</p>
      </LpReveal>
      <div className="mt-12 border-t border-black/10">
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="group border-b border-black/10">
            <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-6 text-[clamp(1.125rem,2vw,1.5rem)] font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden">
              <span>{q}</span>
              <ChevronDown aria-hidden className="size-6 shrink-0 stroke-[1.5] text-foreground transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="max-w-[70ch] pb-7 pr-12 text-base leading-relaxed text-muted-foreground sm:text-lg">{a}</p>
          </details>
        ))}
      </div>
    </LpSection>
  );
}
