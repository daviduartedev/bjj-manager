"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Joyride, EVENTS, STATUS, type EventData, type Step } from "react-joyride";

import { APP_NAME } from "@/lib/branding";
import { ROUTES } from "@/lib/routes";

/** Quando `1`, este navegador já concluiu o tour automático da primeira vez. */
export const GUIDED_TOUR_COMPLETED_KEY = "casca.guided-tour.completed.v1";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isElementVisible(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return false;
  const s = window.getComputedStyle(el);
  if (s.display === "none" || s.visibility === "hidden" || Number.parseFloat(s.opacity) < 0.05) {
    return false;
  }
  if (el.closest("[aria-hidden='true']")) return false;
  return true;
}

/** Primeiro elemento visível com `data-tour`; senão `document.body`. */
function firstVisibleDataTour(tour: string): HTMLElement {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${tour}"]`);
  for (const el of nodes) {
    if (isElementVisible(el)) return el;
  }
  return document.body;
}

/** Desktop: barra lateral; celular: navegação inferior. */
function firstVisibleShellNav(): HTMLElement {
  const sidebar = firstVisibleDataTour("shell-sidebar");
  if (sidebar !== document.body) return sidebar;
  const bottom = firstVisibleDataTour("shell-bottom-nav");
  if (bottom !== document.body) return bottom;
  return document.body;
}

const tourDelay = 480;

/** Header fixo (h-14) + folga para o tooltip não ser cortado no topo da viewport. */
const TOUR_SCROLL_OFFSET = 100;

type GuidedTourProps = {
  run: boolean;
  onRunChange: (open: boolean) => void;
  /** Incrementar para o Joyride recomeçar do passo 0. */
  sessionKey: number;
};

export function GuidedTour({ run, onRunChange, sessionKey }: GuidedTourProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = useCallback(
    async (href: string) => {
      if (pathname === href || pathname.startsWith(`${href}/`)) return;
      router.push(href);
      await delay(tourDelay);
    },
    [pathname, router],
  );

  const steps: Step[] = useMemo(
    () => [
      {
        target: "body",
        title: "Bem-vindo",
        content:
          "Vamos guiar você pela área autenticada: Painel, Alunos e vistas da lista, Mensalidades com resumo financeiro e comprovantes, Pedagógico (planos de aula), Documentos já emitidos, Produtos em estoque, Configurações da academia, Perfil pessoal e atalhos do topo. Avance em Próximo ou pule o tour quando quiser. Somente este navegador guarda que o tour foi concluído.",
        placement: "center",
        skipBeacon: true,
      },
      {
        target: () => firstVisibleShellNav(),
        title: "Menu principal",
        content:
          "É por aqui que você navega pelo app. Painel resume o dia; Alunos e Mensalidades concentram a operação financeira do mês; Pedagógico prepara os planos; Documentos agrupa PDFs já gerados (recibos, termos etc.); Produtos serve para controlar inventário sem venda integrada pelo sistema; Configurações trata nome da academia e valores de planos. No telefone esta mesma navegação aparece na barra inferior.",
        placement: "auto",
      },
      {
        target: () => firstVisibleDataTour("tour-painel"),
        title: "Painel",
        content:
          "Resumo do dia: números principais, aniversários, pendências financeiras visualizadas pelo painel e atalhos para listas já filtradas.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("page-painel"),
        title: "Tela do Painel",
        content:
          "Use os cartões para saltar rápido para Alunos ou Mensalidades quando um cartão falar do assunto — menos cliques no dia.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-alunos"),
        title: "Alunos",
        content:
          "Cadastro vivo: fichas só leitura, edição quando precisar, graduações e vínculos com os planos usados em Mensalidades.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-alunos"),
        title: "Lista de alunos",
        content:
          "Pesquisa rápida, filtros por plano e estado, botão novo aluno (quando aparece ao lado da lista) e cada linha leva ao perfil do aluno. No menu ⋮ há ações adicionais, incluindo remoções suaves onde existirem.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("alunos-vistas-tabs"),
        title: "Vistas da lista",
        content:
          "Lista principal agrupa os alunos do dia a dia; Arquivados guarda cadastros inativos preservados por histórico; Removidos mostra aqueles marcados como removidos pela academia — dá para anular a partir do menu quando a função existir.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-mensalidades"),
        title: "Mensalidades",
        content:
          "O mês de referência vale para todas as linhas ao mesmo tempo — confira sempre o seletor de mês no topo antes de registrar pagamentos em lote.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("mensalidades-resumo-mes"),
        title: "Resumo do mês",
        content:
          "Antes de descer na lista confira este bloco para entender o que já foi pago, o pendente ou atrasado; ele atualiza quando os registros mudam.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("page-mensalidades"),
        title: "Registrar e comprovantes",
        content:
          "Filtros por estado (pago/pendente etc.) ajudam a limpar visualmente. Ao abrir um aluno e confirmar valor, gere ou reabra comprovante PDF pelos próprios comandos dentro do fluxo; os documentos ficam repetíveis também em Documentos no menu lateral.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-pedagogico"),
        title: "Pedagógico",
        content:
          "Planos mensais organizados por categoria (kids 1/kids 2/adulto), revisão antes de publicar e exportação em PDF quando fizer parte da sua rotina.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.pedagogicoPlanos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-pedagogico-planos"),
        title: "Planos pedagógicos",
        content:
          "Filtros por estado e período aparecem no painel inferior; criar novo plano, duplicar rascunhos e publicar a versão válida ficam sempre a partir desta lista.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.pedagogicoPlanos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-documentos"),
        title: "Documentos",
        content:
          "Histórico unificado das emissões: comprovante de mensalidade, termos e certificados. Use quando precisar encontrar arquivo antigo ou baixar de novo o que já foi gerado.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.documentos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-documentos"),
        title: "Histórico e filtros",
        content:
          "Filtros por tipo e estado; ao abrir o detalhe você baixa novamente quando o arquivo já existe — nem sempre precisa passar só pela Mensalidades.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.documentos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-produtos"),
        title: "Produtos",
        content:
          "Controle interno de SKU por tamanho e quantidade em estoque. Não substitui checkout de vitrine: depois da contagem física, ajuste as quantidades manualmente aqui.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.produtos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-produtos"),
        title: "Estoque e cadastro",
        content:
          "Ative/desative ítens, edite nomenclatura e ajuste contagem quando contar físicamente produtos disponíveis no tatame ou lojinha própria.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.produtos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-configuracoes"),
        title: "Configurações",
        content:
          "Centraliza nome da academia e planos (valores usados quando você lança registros mensais). Esses números alimentam expectativas e relatórios do mês atual.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("page-configuracoes"),
        title: "Preferências institucionais",
        content:
          "Tudo configurado vale para relatórios e próximos lançamentos. Preferências apenas suas (nome aparecendo no app, telefone da conta operador) ficam em Perfil — veja ícone seguinte depois.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("shell-user-menu"),
        title: "Menu do usuário",
        content:
          "Abra o ícone redondo (iniciais ou silhueta). De lá vai para Perfil — nome exibido para quem trabalha dentro do mesmo ambiente — ou encerre sessão ao terminar em computador compartilhado.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("page-perfil"),
        title: `Perfil em ${APP_NAME}`,
        content:
          "Preferências apenas suas: nome e contato aparecendo onde o sistema menciona você. Para nome da academia inteira sempre use Configurações no menu lateral.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.perfil);
        },
      },
      {
        target: () => firstVisibleDataTour("shell-wizard-trigger"),
        title: "Reabrir Wizard",
        content:
          "Quando onboarding de novo membro repetir as mesmas etapas, clique Wizard (ou ícone menor no celular) para repetir este tour guiado e os popups voltam a aparecer até você concluir. Use Pular tour se já quiser seguir usando o app sem guia.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
    ],
    [navigateTo],
  );

  const handleEvent = useCallback(
    (data: EventData) => {
      if (
        data.type === EVENTS.TOUR_STATUS &&
        (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED)
      ) {
        try {
          window.localStorage.setItem(GUIDED_TOUR_COMPLETED_KEY, "1");
        } catch {
          /* modo privado */
        }
        onRunChange(false);
      }
    },
    [onRunChange],
  );

  return (
    <Joyride
      key={sessionKey}
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      floatingOptions={{
        flipOptions: { padding: 20 },
        shiftOptions: { padding: 20 },
      }}
      options={{
        scrollOffset: TOUR_SCROLL_OFFSET,
        scrollDuration: 400,
        showProgress: true,
        spotlightPadding: 10,
        buttons: ["back", "skip", "close", "primary"],
        zIndex: 10050,
        primaryColor: "hsl(var(--primary))",
        textColor: "hsl(var(--foreground))",
        backgroundColor: "hsl(var(--card))",
        overlayColor: "rgba(0,0,0,0.65)",
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        nextWithProgress: "Próximo ({current} de {total})",
        skip: "Pular tour",
      }}
    />
  );
}

/** Primeira visita neste navegador: abrir tour se ainda não concluído. */
export function useGuidedTourAutoStart(setRun: (v: boolean) => void) {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(GUIDED_TOUR_COMPLETED_KEY) !== "1") {
        setRun(true);
      }
    } catch {
      setRun(true);
    }
  }, [setRun]);
}
