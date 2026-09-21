import Image from "next/image";

import {
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Pain data
// ---------------------------------------------------------------------------

const PAINS = [
  {
    n: "01",
    title: "Planilha desatualizada",
    body: "A lista de alunos vive em três arquivos. Nenhum com a faixa atual.",
  },
  {
    n: "02",
    title: "Mensalidade esquecida",
    body: "Quem atrasou some no meio do mês. O caixa sente semanas depois.",
  },
  {
    n: "03",
    title: "Graduação no caderno",
    body: "Grau e data anotados a lápis. O histórico do aluno morre na gaveta.",
  },
  {
    n: "04",
    title: "Cobrança no WhatsApp pessoal",
    body: "Lembrete manual, um a um, sem registro do que foi cobrado.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpProblem
// ---------------------------------------------------------------------------

export function LpProblem() {
  return (
    <LpSection
      id="problema"
      className="border-y border-white/10 bg-white/[0.03]"
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

      {/* Editorial split: photo collage + numbered pain list */}
      <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Photo collage */}
        <LpReveal className="relative">
          <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 lg:aspect-[4/5]">
            <Image
              src="/marketing/lp-stock-tatame.jpg"
              alt="Tatame de academia de jiu-jitsu"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              aria-hidden
            />
            <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-bjj-red" aria-hidden />
              A rotina real da secretaria
            </p>
          </div>
          <div className="absolute -bottom-6 -right-3 hidden w-40 overflow-hidden rounded-xl border border-white/15 shadow-[0_16px_40px_rgb(0_0_0/0.6)] min-[420px]:block sm:-right-6 sm:w-48">
            <div className="relative aspect-[4/3]">
              <Image
                src="/marketing/lp-stock-desk-laptop.jpg"
                alt="Notebook com planilha em uma mesa de academia"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>
        </LpReveal>

        {/* Numbered pain list */}
        <ol>
          {PAINS.map((pain, i) => (
            <li key={pain.n} className="group border-t border-white/10 first:border-t-0">
              <LpReveal delay={i * 0.08} className="flex gap-5 py-6 sm:gap-7 sm:py-7">
                <span className="font-lp text-sm font-bold tracking-[0.2em] text-bjj-red pt-1.5">
                  {pain.n}
                </span>
                <div>
                  <p className="font-lp text-2xl font-extrabold uppercase tracking-[-0.01em] text-white/90 transition-colors group-hover:text-white sm:text-3xl">
                    {pain.title}
                  </p>
                  <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/55 sm:text-base">
                    {pain.body}
                  </p>
                </div>
              </LpReveal>
            </li>
          ))}
        </ol>
      </div>

      {/* Closing line */}
      <div className="mt-16 text-center">
        <p className="font-lp text-2xl sm:text-3xl font-extrabold uppercase text-white/85">
          O Casca existe para esse intervalo.
        </p>
      </div>
    </LpSection>
  );
}
