"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogIn,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Títulos Section legíveis sobre fundo escuro (tokens globais são claros por defeito). */
const sectionDarkIntro =
  "[&_.type-section-title]:text-white [&_.type-section-title]:text-2xl [&_.type-section-title]:font-bold [&_.type-section-title]:sm:text-3xl [&_.type-lead]:text-base [&_.type-lead]:leading-relaxed [&_.type-lead]:text-white/60 [&_.type-lead]:sm:text-crm-lg";
const spring = { type: "spring" as const, stiffness: 520, damping: 26, mass: 0.72 };
const springSoft = { type: "spring" as const, stiffness: 360, damping: 30, mass: 0.88 };

const viewport = { once: true, amount: 0.1, margin: "0px 0px -12% 0px" } as const;

const featureItems = [
  {
    icon: LayoutDashboard,
    title: "Painel operacional",
    body:
      "Números do dia: alunos ativos, mensalidades atrasadas, aniversariantes do mês, lembretes de quem precisa de atenção, distribuição por faixa em adulto e kids, com atalhos para agir rápido.",
  },
  {
    icon: Users,
    title: "Alunos e perfil completo",
    body:
      "Cadastro, edição, tipo adulto ou kids, status, dados de contato e observações. Cada aluno tem ficha com faixa e grau atuais, histórico de graduação e situação financeira do mês.",
  },
  {
    icon: Award,
    title: "Graduações registradas",
    body:
      "Registro de promoção de grau ou faixa com histórico e datas. Quando houver pulo de ordem o sistema exige justificativa antes de concluir.",
  },
  {
    icon: CreditCard,
    title: "Planos e mensalidades",
    body:
      "Planos Kids 1, Kids 2 e Adulto com valores base. Por aluno você define preço efetivo, dia de vencimento e acompanha status: pago, pendente, atrasado, bolsista ou outro. Lista mensal e registro de pagamento quando confirmado.",
  },
  {
    icon: ClipboardList,
    title: "Rotina financeira do mês",
    body:
      "Visão por aluno e por competência para revisar cobrança, filtrar por situação e registrar pagamento com data e observações. Adequado para o professor que fecha o mês com checklist objetivo.",
  },
  {
    icon: Settings2,
    title: "Configurações da academia",
    body:
      "Ajustes dos dados da academia e parâmetros que sustentam o cadastro e o financeiro no mesmo ambiente em que você trabalha todos os dias.",
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Entrar com segurança",
    body: "Acesso autenticado. Cada academia opera no seu espaço isolado no sistema.",
  },
  {
    step: "02",
    title: "Cadastrar e manter alunos",
    body: "Perfis completos, faixa e grau, histórico de graduação e observações em um só lugar.",
  },
  {
    step: "03",
    title: "Fechar o mês com clareza",
    body: "Painel e mensalidades mostram quem está em dia, quem precisa de cobrança e o que fazer hoje.",
  },
] as const;

const highlightBullets = [
  "Interface pensada para uso rápido entre treinos e atendimento.",
  "Financeiro manual e transparente: você confirma pagamento e status, sem surpresa.",
  "Graduação amarrada ao histórico: menos erro e mais consistência na escola.",
  "Um fluxo só para professor e gestor: lista de alunos, perfil, mensalidades e painel.",
] as const;

const faqItems = [
  {
    q: "Para que tipo de academia o Casca serve?",
    a: "Para academias de jiu-jitsu que precisam cadastrar alunos adulto e kids, registrar faixa e grau, acompanhar mensalidades e ver um painel com o que importa no dia. O foco é quem ensina e quem administra a escola.",
  },
  {
    q: "Os dados da minha academia ficam misturados com outras?",
    a: "Não. O ambiente é multi-academia com isolamento por academia. Você vê só os seus alunos, registros e configurações.",
  },
  {
    q: "Alunos acessam o sistema?",
    a: "No momento o produto é para uso interno da equipe. Portal ou aplicativo do aluno não faz parte do escopo atual.",
  },
  {
    q: "Integra com gateway ou cobrança automática por PIX?",
    a: "Não. Pagamentos e status são registrados manualmente quando você confirma na vida real. Isso mantém o controle direto na sua operação.",
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

function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const reduce = useReducedMotion();

  const offset =
    direction === "up"
      ? { y: 72 }
      : direction === "down"
        ? { y: -72 }
        : direction === "left"
          ? { x: 112 }
          : { x: -112 };

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <main className="flex min-h-screen flex-col bg-bjj-black text-white">
      {/* Hero: preto sólido (#000). Logo só aqui. */}
      <section className="relative flex flex-col overflow-hidden bg-black text-white">
        <div className="relative border-b border-white/[0.07]">
          <header className="container flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
              <CascaNavLogo />
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.06 }}
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 border-white/20 bg-white/[0.06] text-white backdrop-blur-sm hover:bg-white/12 hover:text-white"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </motion.div>
          </header>
        </div>

        <div className="relative container py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="max-w-xl lg:max-w-none">
              <motion.span
                className="inline-flex rounded-md border border-white/25 bg-white/[0.06] px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/90"
                initial={reduce ? false : { opacity: 0, y: -52 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 }}
              >
                Gestão da sua academia de jiu-jitsu
              </motion.span>
              <motion.h1
                className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]"
                initial={reduce ? false : { opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.12 }}
              >
                Menos planilha e mais tatame:{" "}
                <span className="text-bjj-red">alunos, graduação e caixa</span> no mesmo sistema.
              </motion.h1>
              <motion.p
                className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 sm:text-crm-lg sm:leading-relaxed"
                initial={reduce ? false : { opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.2 }}
              >
                Casca é o painel web para o professor e o dono da academia controlarem cadastro de alunos, evolução de
                faixa e grau, planos, vencimentos e status de mensalidade, com visão resumida no painel e segurança por
                sessão. Tudo direto, pensado para o ritmo do dia a dia da escola.
              </motion.p>
              <motion.div
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
                initial={reduce ? false : { opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.28 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="min-h-12 w-full border-0 bg-bjj-red px-8 text-base font-semibold shadow-[0_0_0_1px_hsl(357_73%_38%/0.35)] hover:bg-bjj-red/90 sm:w-auto"
                >
                  <Link href="/login">Acessar a plataforma</Link>
                </Button>
              </motion.div>
              <motion.p
                className="mt-6 flex items-start gap-2 text-sm text-white/45"
                initial={reduce ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.36 }}
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bjj-green" aria-hidden />
                <span>
                  Cada academia vê só os seus dados. Acesso apenas autenticado, isolamento multi-academia e sessão
                  protegida.
                </span>
              </motion.p>
            </div>

            <motion.div
              className="relative mx-auto flex w-full max-w-xl justify-center lg:mx-0 lg:max-w-none"
              initial={reduce ? false : { opacity: 0, x: 120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.15 }}
            >
              <div className="w-full px-2">
                <Image
                  src="/logo_sem_fundo_preto__1_-removebg-preview.png"
                  alt="Casca"
                  width={1440}
                  height={495}
                  quality={100}
                  priority
                  sizes="(max-width: 1024px) min(96vw, 36rem), min(42vw, 40rem)"
                  className="mx-auto h-auto w-full max-w-lg object-contain object-center"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="border-t border-white/10 bg-bjj-black py-16 sm:py-20 lg:py-24">
        <div className="container">
          <Reveal direction="down" className={cn("will-change-transform", sectionDarkIntro)}>
            <Section
              title="O que você faz dentro do Casca"
              description="Funcionalidades do produto hoje, descritas de forma objetiva para quem precisa decidir se vale para a própria academia."
              className="space-y-10"
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map(({ icon: Icon, title, body }, i) => {
              const fromLeft = i % 2 === 0;
              return (
                <Reveal
                  key={title}
                  direction={fromLeft ? "left" : "right"}
                  delay={i * 0.05}
                  className="will-change-transform"
                >
                  <Card className="h-full border-white/10 bg-white/[0.04] text-white shadow-none backdrop-blur-[2px] transition-colors hover:bg-white/[0.06]">
                    <CardHeader className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-bjj-red/15 text-bjj-red">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="text-lg text-white">{title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed text-white/65">
                        {body}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="border-t border-white/10 bg-[#070707] py-16 sm:py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal direction="left" className="space-y-4 will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-bjj-red/35 bg-bjj-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bjj-red">
                <Sparkles className="size-3.5" aria-hidden />
                Por que usar
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Operação de academia sem dispersão entre ferramentas soltas
              </h2>
              <p className="text-base leading-relaxed text-white/65 sm:text-crm-lg">
                Casca concentra cadastro, graduação, cobrança do mês e leitura rápida do negócio no painel. Menos troca de
                contexto, mais tempo no tatame e com o aluno.
              </p>
            </Reveal>
            <ul className="space-y-4">
              {highlightBullets.map((text, i) => (
                <Reveal
                  key={i}
                  direction="right"
                  delay={i * 0.07}
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 will-change-transform"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-bjj-red/15 text-bjj-red">
                    <Check className="size-4" aria-hidden />
                  </span>
                  <span className="text-sm leading-relaxed text-white/85 sm:text-base">{text}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Passo a passo */}
      <section className="border-t border-white/10 bg-bjj-black py-16 sm:py-20 lg:py-24">
        <div className="container">
          <Reveal direction="up" className={cn("will-change-transform", sectionDarkIntro)}>
            <Section
              title="Do acesso ao painel em três passos"
              description="Fluxo simples para quem já vive a rotina da academia e quer sistema alinhado a ela."
              className="space-y-12"
            />
          </Reveal>
          <div className="mt-2 grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, body }, i) => (
              <Reveal
                key={step}
                direction="up"
                delay={i * 0.12}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 will-change-transform"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-bjj-red text-lg font-bold text-white shadow-inner">
                  {step}
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-[#070707] py-16 sm:py-20">
        <div className="container max-w-3xl">
          <Reveal direction="down" className="will-change-transform">
            <h2 className="text-center font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Perguntas frequentes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-white/60 sm:text-crm-lg">
              Respostas diretas sobre o que o Casca oferece hoje e o que ainda não está no produto.
            </p>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqItems.map(({ q, a }, i) => (
              <Reveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.04} className="will-change-transform">
                <details
                  className={cn(
                    "group rounded-xl border border-white/10 bg-white/[0.04] px-4 shadow-none backdrop-blur-[2px] transition-[box-shadow] open:bg-white/[0.06]",
                    "py-3 sm:px-5",
                  )}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-medium text-white outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-bjj-red focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707] sm:text-base">
                    <span>{q}</span>
                    <ChevronDown className="size-5 shrink-0 text-white/45 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                    {a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco de confiança + CTA */}
      <section className="border-t border-white/10 bg-bjj-black py-14 text-white sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal direction="up" className="will-change-transform">
              <UserCircle2 className="mx-auto size-10 text-bjj-red opacity-90" aria-hidden />
            </Reveal>
            <Reveal direction="left" delay={0.06} className="will-change-transform">
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Feito para quem ensina e para quem administra a escola
              </h2>
            </Reveal>
            <Reveal direction="right" delay={0.1} className="will-change-transform">
              <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-crm-lg">
                O foco do Casca é o professor e o gestor que precisam de clareza sem abrir cinco ferramentas. Cadastro e
                histórico do aluno, regras de graduação coerentes com a rotina, financeiro do mês com status explícitos e
                painel que responde em segundos o que está em dia e o que não está.
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.14} className="mt-10 will-change-transform">
              <Button
                asChild
                size="lg"
                className="min-h-12 border-0 bg-bjj-red px-10 text-base font-semibold shadow-[0_0_0_1px_hsl(357_73%_38%/0.35)] hover:bg-bjj-red/90"
              >
                <Link href="/login" className="inline-flex items-center gap-2">
                  <LogIn className="size-4" aria-hidden />
                  Entrar agora
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050505] text-white">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-center text-sm text-white/60 sm:flex-row sm:text-left">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={springSoft}
          >
            <CascaNavLogo asLink={false} imgClassName="sm:h-9" />
          </motion.div>
          <span className="max-w-md text-white/55">
            Software web para gestão de academia de jiu-jitsu. Produto em evolução com base no uso real em tatame e
            balcão.
          </span>
        </div>
      </footer>
    </main>
  );
}
