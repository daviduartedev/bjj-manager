"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Joyride, EVENTS, STATUS, type EventData, type Step } from "react-joyride";

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

/** Desktop: barra lateral; telemóvel: navegação inferior. */
function firstVisibleShellNav(): HTMLElement {
  const sidebar = firstVisibleDataTour("shell-sidebar");
  if (sidebar !== document.body) return sidebar;
  const bottom = firstVisibleDataTour("shell-bottom-nav");
  if (bottom !== document.body) return bottom;
  return document.body;
}

const tourDelay = 480;

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
          "Este tour mostra o menu, abre cada área principal (Painel, Alunos, Mensalidades, Configurações) e explica o que fazer. Usa Seguinte para avançar. Podes saltar a qualquer momento. Tudo fica guardado só neste navegador, sem alterar dados da academia.",
        placement: "center",
        skipBeacon: true,
      },
      {
        target: () => firstVisibleShellNav(),
        title: "Menu principal",
        content:
          "Aqui estão as áreas de trabalho. No telemóvel, o mesmo menu aparece em baixo. Cada sítio tem um papel: resumo, pessoas, dinheiro do mês e definições da escola.",
        placement: "right",
      },
      {
        target: () => firstVisibleDataTour("tour-painel"),
        title: "Painel",
        content: "Isto leva ao resumo do dia: números rápidos, aniversariantes, atrasos e atalhos. É o sítio certo para abrir a rotina.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("page-painel"),
        title: "Dentro do Painel",
        content:
          "Aqui vês o olá, os indicadores e o que precisa de atenção. Deste ecrã consegues saltar para alunos ou mensalidades com um clique nos cartões, quando existirem.",
        placement: "bottom",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-alunos"),
        title: "Alunos",
        content: "A lista e a ficha de cada aluno: dados, faixa, grau, graduações e o resumo do mês na mesma vista.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-alunos"),
        title: "Lista de alunos",
        content:
          "Procura, filtra e abre a ficha. Novo aluno costuma estar num botão visível nesta área. Quando alguém sobe de faixa, regista a graduação na ficha para o histórico ficar certo.",
        placement: "bottom",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-mensalidades"),
        title: "Mensalidades",
        content: "Aqui acompanhas o mês, quem pagou, quem não pagou e registas o pagamento quando o dinheiro entra de verdade.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("page-mensalidades"),
        title: "Mensalidades do mês",
        content:
          "Confere o mês no topo, usa filtros se existirem e abre a linha do aluno para detalhe. Regista pagamento na hora em que confirmas fora do sistema.",
        placement: "bottom",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-configuracoes"),
        title: "Configurações",
        content: "Nome da academia e planos base (crianças e adultos). Isto ajuda quando ligas cada aluno a um plano e evita erros de valor.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("page-configuracoes"),
        title: "Definições da escola",
        content:
          "Ajusta aqui o que é comum a todos. O teu nome e contacto de utilizador ficam em Perfil, no menu da cara ao lado do botão Wizard.",
        placement: "bottom",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("shell-wizard-trigger"),
        title: "Voltar ao tour",
        content:
          "Este botão Wizard volta a abrir este guia quando quiseres. No menu da cara abres Perfil ou Terminar sessão.",
        placement: "bottom",
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
      options={{
        scrollOffset: 80,
        showProgress: true,
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
        next: "Seguinte",
        skip: "Saltar tour",
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
