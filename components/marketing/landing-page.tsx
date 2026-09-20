"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { LpEnterLink, LpFooter, LpHeader } from "@/components/marketing/lp-chrome";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    q: "Para que tipo de academia o Casca serve?",
    a: "Para academias de jiu-jitsu que cadastram alunos adulto e kids, registram faixa e grau, acompanham mensalidades e precisam de um painel com o que importa no dia. O foco é quem ensina e quem administra a escola.",
  },
  {
    q: "Os dados da minha academia ficam misturados com outras?",
    a: "Não. O ambiente é multi-academia com isolamento por academia. Você vê só os seus alunos, registros e configurações.",
  },
  {
    q: "Alunos acessam o sistema?",
    a: "O professor trabalha na área operacional. Quando a academia libera o portal, o aluno entra no próprio espaço para aulas, presença e financeiro. Sem portal, o Casca continua só com a equipe interna.",
  },
  {
    q: "Integra com gateway ou cobrança automática por PIX?",
    a: "Não. Pagamentos e status são registrados manualmente quando você confirma na vida real. O controle fica na operação da escola.",
  },
  {
    q: "Posso exportar planilha ou relatório em Excel?",
    a: "Exportação em arquivo não está no escopo atual. O trabalho acontece dentro das telas do Casca.",
  },
  {
    q: "Como obtenho login?",
    a: "O primeiro usuário costuma ser criado por provisionamento junto à equipe que mantém o sistema. Use as credenciais recebidas na página Entrar.",
  },
] as const;

const impact = [
  { kicker: "Adulto e kids", label: "O mesmo cadastro cobre as duas linhas da escola." },
  { kicker: "Faixa e grau", label: "Histórico com data. Pulo de ordem pede justificativa." },
  { kicker: "O mês", label: "Pago, pendente, atrasado, bolsista ou outro. Você confirma." },
  { kicker: "Sua academia", label: "Isolamento por conta. Cada escola vê só os seus dados." },
] as const;

const modules = [
  {
    title: "Alunos",
    body: "Lista e ficha completa. Tipo adulto ou kids, contato, status, observações. Cada aluno carrega faixa atual, grau, histórico e a situação financeira do mês.",
    src: "/marketing/lp-real-alunos.png",
    alt: "Lista de alunos no Casca",
  },
  {
    title: "Graduação",
    body: "Promoção de grau ou faixa com data e histórico. Se houver pulo de ordem, o sistema pede justificativa antes de concluir.",
    src: "/marketing/lp-real-graduacao.png",
    alt: "Histórico de graduação no Casca",
  },
  {
    title: "Mensalidades",
    body: "Preço efetivo e dia de vencimento por aluno. Status explícito. Você confirma o pagamento quando ele acontece na vida real.",
    src: "/marketing/lp-real-mensalidades.png",
    alt: "Resumo de mensalidades no Casca",
  },
  {
    title: "Painel",
    body: "Alunos ativos, mensalidades em atraso, aniversariantes do mês, distribuição por faixa. Atalhos para agir no mesmo dia.",
    src: "/marketing/lp-real-painel.png",
    alt: "Painel do Casca com indicadores do dia",
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Entrar",
    body: "Acesso autenticado. A academia opera no próprio espaço, isolada das outras.",
  },
  {
    n: "02",
    title: "Cadastrar",
    body: "Perfis com faixa, grau, histórico de graduação e observações no mesmo lugar.",
  },
  {
    n: "03",
    title: "Fechar o mês",
    body: "Painel e mensalidades mostram quem está em dia e quem precisa de cobrança hoje.",
  },
] as const;

function Display({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-lp font-extrabold uppercase tracking-[-0.02em] text-white",
        className,
        "!leading-[1.08]",
      )}
    >
      {children}
    </p>
  );
}

function SplitBlock({
  src,
  alt,
  reverse = false,
  children,
  className,
}: {
  src: string;
  alt: string;
  reverse?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid bg-black lg:grid-cols-2", className)}>
      <figure
        className={cn(
          "group relative min-h-[52vh] overflow-hidden bg-black lg:min-h-[72vh]",
          reverse && "lg:order-2",
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
        />
      </figure>
      <div className="flex flex-col justify-center border-white/15 px-5 py-16 sm:px-10 lg:border-l lg:px-16">
        {children}
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <main className="bg-black text-white">
      <LpHeader />
      <h1 className="sr-only">
        Casca. Alunos, faixa e mensalidade na mesma ficha, para academias de jiu-jitsu.
      </h1>

      <section className="group relative min-h-[100svh] overflow-hidden bg-black">
        <Image
          src="/marketing/lp-real-login.png"
          alt="Tela de entrada do Casca"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-black/55 transition-colors duration-700 group-hover:bg-black/35 motion-reduce:transition-none" />
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-end px-5 pb-16 pt-24 sm:px-10 sm:pb-20 lg:px-14">
          <Display className="max-w-[18ch] text-[clamp(2.75rem,8vw,7rem)]">
            Alunos, faixa
            <br />
            e mensalidade
            <br />
            na mesma ficha.
          </Display>
          <p className="mt-8 max-w-[38ch] text-base leading-relaxed text-white/80 sm:text-lg">
            Casca é o sistema da academia de jiu-jitsu. Professor e dono cadastram quem sobe no tatame, registram graduação e fecham o mês no mesmo lugar.
          </p>
          <LpEnterLink className="mt-10 h-12 px-10 text-base" />
        </div>
      </section>

      <SplitBlock
        src="/marketing/lp-real-painel.png"
        alt="Painel do Casca com o resumo operacional do dia"
      >
        <Display className="max-w-[12ch] text-[clamp(2.25rem,5vw,4.25rem)]">
          O tatame tem hora.
          <br />
          O caixa também.
        </Display>
        <p className="mt-8 max-w-[42ch] text-base leading-relaxed text-white/70 sm:text-lg">
          A secretaria da escola vive no notebook, na beira do tatame, entre uma aula e outra. O Casca cabe nesse intervalo: ficha do aluno, faixa, vencimento e o que está atrasado hoje.
        </p>
      </SplitBlock>

      <section className="border-y border-white/15 bg-[#0a0a0a]" aria-label="O que o Casca cobre">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((item) => (
            <div
              key={item.kicker}
              className="border-white/15 px-6 py-10 sm:px-8 sm:py-14 lg:border-r lg:last:border-r-0"
            >
              <p className="font-lp text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold uppercase !leading-tight tracking-[-0.02em]">
                {item.kicker}
              </p>
              <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-white/60">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="bg-black">
        <header className="border-b border-white/15 px-5 py-16 sm:px-10 sm:py-20 lg:px-14">
          <Display className="max-w-[16ch] text-[clamp(2.25rem,5.5vw,4.75rem)]">
            O que você faz
            <br />
            dentro do Casca
          </Display>
          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/65 sm:text-lg">
            Cadastro de alunos adulto e kids, ficha com faixa e grau, histórico de graduação, planos Kids 1, Kids 2 e Adulto, mensalidade do mês e o painel do dia.
          </p>
        </header>
        <div>
          {modules.map((mod, i) => (
            <article
              key={mod.title}
              className="group grid border-b border-white/15 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              <figure
                className={cn(
                  "relative min-h-[42vh] overflow-hidden bg-black lg:min-h-[28rem]",
                  i % 2 === 1 && "lg:order-2",
                )}
              >
                <Image
                  src={mod.src}
                  alt={mod.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </figure>
              <div
                className={cn(
                  "flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16",
                  "transition-colors duration-500 group-hover:bg-[#141414] motion-reduce:transition-none",
                )}
              >
                <p className="font-lp text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold uppercase !leading-[1.08] tracking-[-0.02em]">
                  {mod.title}
                </p>
                <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-white/70 sm:text-lg">
                  {mod.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a]">
        <div className="border-b border-white/15 px-5 py-16 sm:px-10 lg:px-14">
          <Display className="max-w-[14ch] text-[clamp(2.25rem,5vw,4.25rem)]">
            Entrar.
            <br />
            Cadastrar.
            <br />
            Fechar o mês.
          </Display>
        </div>
        <ol>
          {steps.map((step) => (
            <li
              key={step.n}
              className="grid border-b border-white/15 px-5 py-10 sm:px-10 sm:py-12 lg:grid-cols-[8rem_minmax(0,18rem)_minmax(0,1fr)] lg:items-baseline lg:gap-10 lg:px-14"
            >
              <span className="font-lp text-4xl font-extrabold leading-none text-white/35">{step.n}</span>
              <p className="mt-4 font-lp text-3xl font-extrabold uppercase !leading-tight tracking-[-0.02em] sm:text-4xl lg:mt-0">
                {step.title}
              </p>
              <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-white/65 lg:mt-0">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="border-t border-white/15 bg-black px-5 py-16 sm:px-10 sm:py-24 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <Display className="max-w-[10ch] text-[clamp(2.25rem,5vw,4.25rem)] lg:sticky lg:top-24 lg:self-start">
            Perguntas
            <br />
            frequentes
          </Display>
          <div className="divide-y divide-white/15 border-y border-white/15">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-left text-lg text-white outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-white sm:text-xl [&::-webkit-details-marker]:hidden">
                  <span className="max-w-[40ch]">{q}</span>
                  <span aria-hidden className="font-lp text-2xl leading-none text-white/40 group-open:hidden">
                    +
                  </span>
                  <span
                    aria-hidden
                    className="hidden font-lp text-2xl leading-none text-white/40 group-open:inline"
                  >
                    −
                  </span>
                </summary>
                <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="grid bg-black lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        aria-labelledby="cta-feito-para-heading"
      >
        <div className="flex flex-col justify-center px-5 py-16 sm:px-10 sm:py-24 lg:px-14">
          <Image
            src="/uf.png"
            alt="Casca"
            width={240}
            height={72}
            className="mb-8 h-12 w-auto object-contain object-left sm:h-14"
            data-testid="landing-cta-logo"
          />
          <h2
            id="cta-feito-para-heading"
            className="font-lp max-w-[16ch] text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold uppercase !leading-[1.08] tracking-[-0.02em] text-white"
          >
            Feito para quem ensina e para quem administra a escola
          </h2>
          <p className="mt-8 max-w-[44ch] text-base leading-relaxed text-white/70 sm:text-lg">
            Cadastro e histórico do aluno, regras de graduação da rotina, financeiro do mês com status explícitos e painel que responde o que está em dia.
          </p>
          <LpEnterLink className="mt-10 h-12 w-auto self-start px-10 text-base" />
        </div>
        <figure className="group relative min-h-[42vh] overflow-hidden lg:min-h-full">
          <Image
            src="/marketing/lp-real-aulas.png"
            alt="Tela de aulas no Casca"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
          />
        </figure>
      </section>

      <LpFooter />
    </main>
  );
}
