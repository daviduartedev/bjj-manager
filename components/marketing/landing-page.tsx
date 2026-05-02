"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Award,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LineChart,
  LogIn,
  Quote,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCircle2,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { ProductFooter } from "@/components/layout/product-footer";
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

const metrics = [
  { icon: Users, value: "100%", label: "Alunos centralizados", hint: "Adulto e kids no mesmo lugar" },
  { icon: Wallet, value: "1 clique", label: "Registrar pagamento", hint: "Status sem ambiguidade" },
  { icon: Gauge, value: "Tempo real", label: "Visão do mês", hint: "Painel atualizado por sessão" },
  { icon: ShieldCheck, value: "Multi", label: "Academia isolada", hint: "Cada espaço, seus dados" },
] as const;

const pillars = [
  {
    icon: Target,
    title: "Foco operacional",
    body: "Cada tela responde uma pergunta concreta da rotina, sem dispersão visual ou menus profundos.",
  },
  {
    icon: Activity,
    title: "Continuidade do aluno",
    body: "Faixa, grau, histórico e financeiro do aluno conversam entre si para sustentar decisão de graduação.",
  },
  {
    icon: TrendingUp,
    title: "Leitura do negócio",
    body: "O painel resume saúde da escola para o gestor: quem está em dia, quem atrasou, quem chega em data de aniversário.",
  },
] as const;

const comparison = [
  {
    label: "Cadastro de aluno",
    casca: "Ficha completa com faixa, grau, histórico e observações em um só perfil.",
    planilha: "Abas separadas, fórmulas frágeis e copiar e colar entre arquivos.",
  },
  {
    label: "Graduação",
    casca: "Registro com data, histórico e exigência de justificativa em pulo de ordem.",
    planilha: "Anotação livre sem amarração ao histórico do aluno.",
  },
  {
    label: "Mensalidades",
    casca: "Status explícito por aluno e competência, com registro manual confiável.",
    planilha: "Status pintado à mão e linhas que se perdem entre meses.",
  },
  {
    label: "Painel do dia",
    casca: "Resumo operacional com atalhos de ação e lembretes do mês.",
    planilha: "Necessidade de montar uma planilha auxiliar para enxergar o todo.",
  },
] as const;

const testimonials = [
  {
    quote:
      "A ficha do aluno conversa com a graduação e com o financeiro. Reduziu retrabalho na hora de avaliar promoção e cobrança no mesmo aluno.",
    author: "Professor responsável pela escola",
    role: "Operação de tatame",
  },
  {
    quote:
      "Bater o olho no painel e saber o que está em dia mudou a forma como fecho o mês. Status na cara, sem precisar abrir planilha.",
    author: "Gestor da academia",
    role: "Administração e caixa",
  },
  {
    quote:
      "O registro de graduação com data e histórico deu consistência ao critério da escola. Os alunos sentem mais clareza nas etapas.",
    author: "Coordenador técnico",
    role: "Acompanhamento de faixa e grau",
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

/** Fundo decorativo: grid sutil + blobs de cor para dar atmosfera Framer. */
function AmbientBackdrop({ variant = "default" }: { variant?: "default" | "soft" | "vivid" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
        }}
      />
      {variant !== "soft" ? (
        <>
          <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-bjj-red/25 blur-[120px]" />
          <div className="absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-bjj-blue/20 blur-[120px]" />
          {variant === "vivid" ? (
            <div className="absolute top-1/3 left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-bjj-yellow/10 blur-[110px]" />
          ) : null}
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bjj-red/15 blur-[140px]" />
      )}
    </div>
  );
}

function SectionDivider() {
  return (
    <div aria-hidden className="relative h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
  );
}

function MockDashboard() {
  const reduce = useReducedMotion();
  return (
    <div className="relative w-full">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-bjj-red/30 via-bjj-blue/15 to-transparent blur-2xl" />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={viewport}
        transition={{ ...springSoft, delay: 0.05 }}
        className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur"
      >
        <div className="flex items-center justify-between border-b border-white/8 bg-black/20 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-bjj-red/80" />
            <span className="size-2.5 rounded-full bg-bjj-yellow/70" />
            <span className="size-2.5 rounded-full bg-bjj-green/70" />
          </div>
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-white/40">
            casca.app/painel
          </span>
          <span className="size-4" />
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {[
            { label: "Alunos ativos", value: "138", trend: "+6", color: "text-bjj-green", icon: Users },
            { label: "Em atraso", value: "9", trend: "vencidos", color: "text-bjj-red", icon: CalendarClock },
            { label: "Aniversariantes", value: "4", trend: "no mês", color: "text-bjj-yellow", icon: Sparkles },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ ...springSoft, delay: 0.12 + i * 0.06 }}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-medium uppercase tracking-wider text-white/55">
                  {card.label}
                </span>
                <card.icon className={cn("size-3.5", card.color)} aria-hidden />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-white">{card.value}</span>
                <span className={cn("text-[0.65rem] font-semibold", card.color)}>{card.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ ...springSoft, delay: 0.32 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">
                Alunos por faixa
              </span>
              <LineChart className="size-3.5 text-white/40" aria-hidden />
            </div>
            <div className="mt-3 flex items-end gap-2">
              {[
                { h: 28, c: "bg-white/85" },
                { h: 50, c: "bg-bjj-blue/85" },
                { h: 36, c: "bg-bjj-yellow/85" },
                { h: 64, c: "bg-[#7a4a1e]" },
                { h: 22, c: "bg-bjj-red/90" },
                { h: 12, c: "bg-white/65" },
              ].map((b, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  whileInView={{ height: b.h, opacity: 1 }}
                  viewport={viewport}
                  transition={{ ...springSoft, delay: 0.4 + i * 0.05 }}
                  className={cn("w-full rounded-sm", b.c)}
                  style={{ height: b.h }}
                />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-6 gap-2 text-center text-[0.55rem] font-medium uppercase tracking-wider text-white/45">
              <span>Branca</span>
              <span>Azul</span>
              <span>Amarela</span>
              <span>Marrom</span>
              <span>Preta</span>
              <span>Outras</span>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ ...springSoft, delay: 0.42 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">
              Mensalidades
            </span>
            <ul className="mt-3 space-y-2 text-[0.7rem]">
              {[
                { name: "Bruno Lima", status: "Pago", color: "bg-bjj-green/20 text-bjj-green" },
                { name: "Marina Costa", status: "Pendente", color: "bg-bjj-yellow/20 text-bjj-yellow" },
                { name: "Caio Souza", status: "Atrasado", color: "bg-bjj-red/20 text-bjj-red" },
                { name: "Lia Mendes", status: "Bolsista", color: "bg-bjj-blue/20 text-bjj-blue" },
              ].map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.02] px-2 py-1.5">
                  <span className="truncate text-white/80">{row.name}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold", row.color)}>
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewport}
        transition={{ ...springSoft, delay: 0.55 }}
        className="absolute -bottom-6 -left-4 hidden rounded-xl border border-white/12 bg-black/70 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:gap-2"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-bjj-green/20 text-bjj-green">
          <BadgeCheck className="size-4" aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-[0.7rem] font-semibold text-white">Graduação registrada</p>
          <p className="text-[0.6rem] text-white/55">Faixa azul, grau 2</p>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewport}
        transition={{ ...springSoft, delay: 0.7 }}
        className="absolute -top-5 -right-3 hidden rounded-xl border border-white/12 bg-black/70 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:gap-2"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-bjj-red/20 text-bjj-red">
          <Zap className="size-4" aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-[0.7rem] font-semibold text-white">9 mensalidades</p>
          <p className="text-[0.6rem] text-white/55">Aguardando ação hoje</p>
        </div>
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <main className="relative flex min-h-screen flex-col bg-bjj-black text-white">
      {/* Hero */}
      <section className="relative isolate flex flex-col overflow-hidden bg-black text-white">
        <AmbientBackdrop variant="vivid" />

        <div className="relative z-10 border-b border-white/[0.07] backdrop-blur-md">
          <header className="container flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
              <CascaNavLogo />
            </motion.div>
            <motion.div
              className="hidden items-center gap-7 text-sm text-white/65 md:flex"
              initial={reduce ? false : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.04 }}
            >
              <a href="#funcionalidades" className="transition-colors hover:text-white">
                Funcionalidades
              </a>
              <a href="#fluxo" className="transition-colors hover:text-white">
                Como funciona
              </a>
              <a href="#comparativo" className="transition-colors hover:text-white">
                Comparativo
              </a>
              <a href="#faq" className="transition-colors hover:text-white">
                Perguntas
              </a>
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

        <div className="relative z-10 container py-14 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <div className="max-w-xl lg:max-w-none">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur"
                initial={reduce ? false : { opacity: 0, y: -52 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 }}
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bjj-red opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-bjj-red" />
                </span>
                Gestão da sua academia de jiu-jitsu
              </motion.span>
              <motion.h1
                className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]"
                initial={reduce ? false : { opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.12 }}
              >
                Menos planilha e mais tatame:{" "}
                <span className="relative inline-block text-bjj-red">
                  alunos, graduação e caixa
                  <span aria-hidden className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-bjj-red via-bjj-red/70 to-transparent" />
                </span>{" "}
                no mesmo sistema.
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
                  className="group min-h-12 w-full overflow-hidden border-0 bg-bjj-red px-8 text-base font-semibold shadow-[0_0_0_1px_hsl(357_73%_38%/0.45),0_15px_40px_-12px_hsl(357_73%_38%/0.6)] transition-all hover:bg-bjj-red/90 hover:shadow-[0_0_0_1px_hsl(357_73%_38%/0.55),0_18px_50px_-10px_hsl(357_73%_38%/0.8)] sm:w-auto"
                >
                  <Link href="/login" className="inline-flex items-center gap-2">
                    Acessar a plataforma
                    <span className="transition-transform group-hover:translate-x-0.5">{"→"}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-h-12 w-full border-white/15 bg-white/[0.04] px-8 text-base font-semibold text-white hover:bg-white/[0.08] hover:text-white sm:w-auto"
                >
                  <a href="#funcionalidades">Ver funcionalidades</a>
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
              className="relative mx-auto flex w-full max-w-xl items-center justify-center lg:mx-0 lg:max-w-none"
              initial={reduce ? false : { opacity: 0, x: 120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.15 }}
            >
              <div className="relative w-full px-2">
                <div className="absolute inset-x-8 -top-10 h-32 bg-bjj-red/30 blur-3xl" />
                <Image
                  src="/logo_sem_fundo_preto__1_-removebg-preview.png"
                  alt="Casca"
                  width={1440}
                  height={495}
                  quality={100}
                  priority
                  sizes="(max-width: 1024px) min(96vw, 36rem), min(42vw, 40rem)"
                  className="relative mx-auto h-auto w-full max-w-lg object-contain object-center drop-shadow-[0_30px_60px_rgba(191,30,39,0.25)]"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Faixa de métricas no fim do hero */}
        <div className="relative z-10 border-t border-white/[0.07] bg-black/30 backdrop-blur-md">
          <div className="container grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-4">
            {metrics.map(({ icon: Icon, value, label, hint }, i) => (
              <motion.div
                key={label}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ ...springSoft, delay: i * 0.06 }}
                className="flex items-center gap-3 px-4 py-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-bjj-red ring-1 ring-white/10">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-xl font-bold leading-none text-white">{value}</p>
                  <p className="mt-1 text-xs font-medium text-white/75">{label}</p>
                  <p className="text-[0.65rem] text-white/40">{hint}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase: dashboard mock */}
      <section className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-20 sm:py-24">
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal direction="up" className="will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                <LayoutDashboard className="size-3.5 text-bjj-red" aria-hidden />
                Painel
              </span>
            </Reveal>
            <Reveal direction="up" delay={0.06} className="will-change-transform">
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Uma tela que responde o que importa hoje.
              </h2>
            </Reveal>
            <Reveal direction="up" delay={0.1} className="will-change-transform">
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-crm-lg">
                Alunos ativos, mensalidades em atraso, aniversariantes e distribuição por faixa em adulto e kids no
                mesmo lugar, com atalhos para registrar pagamento e graduar.
              </p>
            </Reveal>
          </div>
          <div className="mx-auto mt-14 max-w-5xl">
            <Reveal direction="up" delay={0.16} className="will-change-transform">
              <MockDashboard />
            </Reveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Funcionalidades */}
      <section
        id="funcionalidades"
        className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-16 sm:py-20 lg:py-24"
      >
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container">
          <Reveal direction="down" className={cn("will-change-transform", sectionDarkIntro)}>
            <Section
              title="O que você faz dentro do Casca"
              description="Funcionalidades do produto hoje, descritas de forma objetiva para quem precisa decidir se vale para a própria academia."
              className="space-y-10"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map(({ icon: Icon, title, body }, i) => {
              const fromLeft = i % 2 === 0;
              return (
                <Reveal
                  key={title}
                  direction={fromLeft ? "left" : "right"}
                  delay={i * 0.05}
                  className="group will-change-transform"
                >
                  <Card className="relative h-full overflow-hidden border-white/10 bg-bjj-black/55 bg-gradient-to-b from-white/[0.08] to-white/[0.02] text-white shadow-none ring-0 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-bjj-red/30 hover:shadow-[0_25px_60px_-25px_rgba(191,30,39,0.4)]">
                    <span aria-hidden className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span aria-hidden className="absolute -right-12 -top-12 size-40 rounded-full bg-bjj-red/0 blur-2xl transition-colors duration-500 group-hover:bg-bjj-red/15" />
                    <CardHeader className="relative space-y-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-bjj-red/15 text-bjj-red ring-1 ring-bjj-red/25 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="text-lg !text-white">{title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed !text-white/65">
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

      {/* Pilares (novo): princípios da operação */}
      <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#070707] py-20">
        <AmbientBackdrop variant="default" />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal direction="down" className="will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-bjj-red/35 bg-bjj-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bjj-red">
                <Target className="size-3.5" aria-hidden />
                Princípios
              </span>
            </Reveal>
            <Reveal direction="up" delay={0.05} className="will-change-transform">
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Três pilares que sustentam o Casca.
              </h2>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                direction="up"
                delay={i * 0.08}
                className="group relative will-change-transform"
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/15 to-transparent opacity-60" aria-hidden />
                <div className="relative h-full rounded-2xl border border-white/10 bg-bjj-black/70 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-bjj-red/30 to-bjj-red/5 text-bjj-red ring-1 ring-bjj-red/30">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-16 sm:py-20">
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal direction="left" className="space-y-4 will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-bjj-red/35 bg-bjj-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bjj-red">
                <Sparkles className="size-3.5" aria-hidden />
                Por que usar
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
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
                  className="group relative flex gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:border-bjj-red/30 hover:bg-white/[0.06] will-change-transform"
                >
                  <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-bjj-red transition-transform duration-300 group-hover:scale-y-100" />
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-bjj-red/15 text-bjj-red ring-1 ring-bjj-red/25">
                    <Check className="size-4" aria-hidden />
                  </span>
                  <span className="text-sm leading-relaxed text-white/85 sm:text-base">{text}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Comparativo (novo) */}
      <section
        id="comparativo"
        className="relative isolate overflow-hidden border-t border-white/10 bg-[#070707] py-20"
      >
        <AmbientBackdrop variant="default" />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal direction="up" className="will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                Comparativo
              </span>
            </Reveal>
            <Reveal direction="up" delay={0.06} className="will-change-transform">
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Casca contra a planilha que ainda controla a sua escola.
              </h2>
            </Reveal>
          </div>

          <Reveal direction="up" delay={0.12} className="mx-auto mt-14 max-w-5xl will-change-transform">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-bjj-black/60 backdrop-blur">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-px bg-white/8 text-sm">
                <div className="bg-bjj-black px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/55 sm:px-6">
                  Item
                </div>
                <div className="flex items-center gap-2 bg-bjj-black px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-bjj-red sm:px-6">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Casca
                </div>
                <div className="bg-bjj-black px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/45 sm:px-6">
                  Planilha avulsa
                </div>
                {comparison.map((row) => (
                  <div key={row.label} className="contents">
                    <div className="bg-bjj-black/80 px-4 py-4 font-semibold text-white sm:px-6">
                      {row.label}
                    </div>
                    <div className="bg-bjj-black/80 px-4 py-4 text-white/85 sm:px-6">
                      <span className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-bjj-green" aria-hidden />
                        {row.casca}
                      </span>
                    </div>
                    <div className="bg-bjj-black/80 px-4 py-4 text-white/55 sm:px-6">
                      <span className="flex items-start gap-2">
                        <span className="mt-0.5 inline-block size-4 shrink-0 text-white/35">{"×"}</span>
                        {row.planilha}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Passo a passo */}
      <section
        id="fluxo"
        className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-16 sm:py-20 lg:py-24"
      >
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container">
          <Reveal direction="up" className={cn("will-change-transform", sectionDarkIntro)}>
            <Section
              title="Do acesso ao painel em três passos"
              description="Fluxo simples para quem já vive a rotina da academia e quer sistema alinhado a ela."
              className="space-y-12"
            />
          </Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <span aria-hidden className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/12 to-transparent md:block" />
            {steps.map(({ step, title, body }, i) => (
              <Reveal
                key={step}
                direction="up"
                delay={i * 0.12}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-bjj-red/30 will-change-transform"
              >
                <div className="relative mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-bjj-red to-[#7c121a] text-lg font-bold text-white shadow-[0_15px_30px_-10px_rgba(191,30,39,0.7)]">
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-white/15" aria-hidden />
                  {step}
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">{body}</p>
                <span aria-hidden className="absolute right-5 top-5 text-[0.6rem] font-mono uppercase tracking-widest text-white/25">
                  Etapa
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testemunhos (novo) */}
      <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#070707] py-20">
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal direction="up" className="will-change-transform">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                <Star className="size-3.5 text-bjj-yellow" aria-hidden />
                Quem usa
              </span>
            </Reveal>
            <Reveal direction="up" delay={0.06} className="will-change-transform">
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Notas de quem fica o dia entre tatame e balcão.
              </h2>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map(({ quote, author, role }, i) => (
              <Reveal key={author} direction="up" delay={i * 0.08} className="group will-change-transform">
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                  <Quote className="size-7 text-bjj-red/70" aria-hidden />
                  <p className="mt-4 text-base leading-relaxed text-white/85">{quote}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/8 pt-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-bjj-red/15 text-bjj-red ring-1 ring-bjj-red/25">
                      <UserCircle2 className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{author}</p>
                      <p className="text-xs text-white/55">{role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-16 sm:py-20"
      >
        <AmbientBackdrop variant="soft" />
        <div className="relative z-10 container max-w-3xl">
          <Reveal direction="down" className="will-change-transform">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                FAQ
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Perguntas frequentes
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/60 sm:text-crm-lg">
                Respostas diretas sobre o que o Casca oferece hoje e o que ainda não está no produto.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 space-y-3">
            {faqItems.map(({ q, a }, i) => (
              <Reveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.04} className="will-change-transform">
                <details
                  className={cn(
                    "group rounded-xl border border-white/10 bg-white/[0.04] px-4 shadow-none backdrop-blur-[2px] transition-all duration-200 open:border-white/15 open:bg-white/[0.06] open:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.6)]",
                    "py-3 sm:px-5",
                  )}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-medium text-white outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-bjj-red focus-visible:ring-offset-2 focus-visible:ring-offset-bjj-black sm:text-base">
                    <span className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-md bg-bjj-red/15 text-[0.7rem] font-bold text-bjj-red ring-1 ring-bjj-red/25">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {q}
                    </span>
                    <ChevronDown className="size-5 shrink-0 text-white/45 transition-transform duration-200 group-open:rotate-180 group-open:text-bjj-red" />
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

      {/* CTA final — logo fora do Reveal para não ficar com opacity 0 até entrar no viewport */}
      <section
        className="relative isolate overflow-hidden border-t border-white/10 bg-bjj-black py-20 text-white"
        aria-labelledby="cta-feito-para-heading"
      >
        <AmbientBackdrop variant="vivid" />
        <div className="relative z-10 container">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-bjj-red/10 p-10 text-center backdrop-blur sm:p-14">
            <span aria-hidden className="absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full bg-bjj-red/30 blur-3xl" />
            <Image
              src="/logo_sem_fundo_preto__1_-removebg-preview.png"
              alt="Casca"
              width={160}
              height={160}
              sizes="(max-width: 640px) 160px, 200px"
              loading="eager"
              fetchPriority="high"
              className="relative z-[1] mx-auto block min-h-[3.5rem] w-auto max-w-[min(100%,200px)] object-contain sm:min-h-16"
              data-testid="landing-cta-logo"
            />
            <Reveal direction="up" className="relative z-[1] will-change-transform">
              <div>
                <h2
                  id="cta-feito-para-heading"
                  className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  Feito para quem ensina e para quem administra a escola
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-crm-lg">
                  O foco do Casca é o professor e o gestor que precisam de clareza sem abrir cinco ferramentas. Cadastro e
                  histórico do aluno, regras de graduação coerentes com a rotina, financeiro do mês com status explícitos e
                  painel que responde em segundos o que está em dia e o que não está.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="group min-h-12 w-full overflow-hidden border-0 bg-bjj-red px-10 text-base font-semibold shadow-[0_0_0_1px_hsl(357_73%_38%/0.45),0_15px_40px_-12px_hsl(357_73%_38%/0.7)] transition-all hover:bg-bjj-red/90 sm:w-auto"
                  >
                    <Link href="/login" className="inline-flex items-center gap-2">
                      <LogIn className="size-4" aria-hidden />
                      Entrar agora
                      <span className="transition-transform group-hover:translate-x-0.5">{"→"}</span>
                    </Link>
                  </Button>
                  <span className="text-sm text-white/45">
                    Acesso restrito por academia, com sessão protegida.
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050505] text-white">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 text-center text-sm text-white/60 sm:flex-row sm:text-left">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={springSoft}
          >
            <CascaNavLogo asLink={false} imgClassName="sm:h-9" />
          </motion.div>
          <div className="flex max-w-2xl flex-col items-center gap-4 sm:items-end sm:text-right">
            <span className="max-w-md text-white/55">
              Software web para gestão de academia de jiu-jitsu. Produto em evolução com base no uso real em tatame e
              balcão.
            </span>
            <ProductFooter surface="dark" className="w-full sm:w-auto" />
          </div>
        </div>
      </footer>
    </main>
  );
}
