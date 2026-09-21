import Image from "next/image";

import {
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Card data
// ---------------------------------------------------------------------------

const CARDS = [
  {
    src: "/marketing/lp-stock-desk-laptop.jpg",
    alt: "Notebook com planilha em uma mesa de academia",
    title: "Planilha desatualizada",
    body: "A lista de alunos vive em três arquivos. Nenhum com a faixa atual.",
    delay: 0,
  },
  {
    src: "/marketing/lp-stock-reception.jpg",
    alt: "Recepção de academia",
    title: "Mensalidade esquecida",
    body: "Quem atrasou some no meio do mês. O caixa sente semanas depois.",
    delay: 0.08,
  },
  {
    src: "/marketing/lp-stock-tatame.jpg",
    alt: "Tatame de academia de jiu-jitsu",
    title: "Graduação no caderno",
    body: "Grau e data anotados a lápis. O histórico do aluno morre na gaveta.",
    delay: 0.16,
  },
  {
    src: "/marketing/lp-stock-coach-tablet.jpg",
    alt: "Professor com tablet na beira do tatame",
    title: "Cobrança no WhatsApp pessoal",
    body: "Lembrete manual, um a um, sem registro do que foi cobrado.",
    delay: 0.24,
  },
] as const;

// ---------------------------------------------------------------------------
// LpProblem
// ---------------------------------------------------------------------------

export function LpProblem() {
  return (
    <LpSection
      id="problema"
      className="bg-[#0a0a0a] border-y border-white/10"
    >
      {/* Section header */}
      <LpReveal>
        <LpEyebrow>O problema</LpEyebrow>

        <LpDisplay className="mt-6 max-w-[20ch] text-[clamp(2.25rem,5vw,4rem)]">
          A secretaria vive no intervalo entre uma aula e outra.
        </LpDisplay>

        <p className="mt-6 max-w-[52ch] text-white/60 leading-relaxed">
          Quem toca academia de jiu-jitsu conhece a rotina: a ficha do aluno, o vencimento e a
          graduação disputam atenção com o tatame. E a operação escorre para ferramentas que não
          conversam.
        </p>
      </LpReveal>

      {/* Pain cards grid */}
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <LpReveal key={card.title} delay={card.delay}>
            <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25">
              {/* Photo */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
                />
                <div className="absolute inset-0 bg-black/20" aria-hidden />
              </div>

              {/* Text */}
              <div className="p-5">
                <p className="font-lp text-xl font-extrabold uppercase tracking-[-0.01em]">
                  {card.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{card.body}</p>
              </div>
            </div>
          </LpReveal>
        ))}
      </div>

      {/* Closing line */}
      <div className="mt-12 text-center">
        <p className="font-lp text-2xl sm:text-3xl font-extrabold uppercase text-white/85">
          O Casca existe para esse intervalo.
        </p>
      </div>
    </LpSection>
  );
}
