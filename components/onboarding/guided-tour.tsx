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
          "Vamos passar pelo menu e pelas quatro áreas principais: Painel, Alunos, Mensalidades e Configurações. Use Próximo para avançar; dá para pular o tour quando quiser. Só este navegador guarda que você já concluiu, não mexe na sua conta nem nos dados da academia.",
        placement: "center",
        skipBeacon: true,
      },
      {
        target: () => firstVisibleShellNav(),
        title: "Menu principal",
        content:
          "É por aqui que você chega em cada parte do sistema. No celular, o mesmo atalho aparece na barra de baixo. Cada item tem uma função: visão geral do dia, cadastro de alunos, mensalidades e preferências da academia.",
        placement: "auto",
      },
      {
        target: () => firstVisibleDataTour("tour-painel"),
        title: "Painel",
        content:
          "Abre o resumo do dia: totais rápidos, aniversariantes, atrasos e atalhos. Comece por aqui na rotina diária.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("page-painel"),
        title: "Tela do Painel",
        content:
          "Aqui ficam o cumprimento, os números principais e o que pede atenção. Nos cartões, quando aparecer, um clique leva direto para Alunos ou Mensalidades.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.painel);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-alunos"),
        title: "Alunos",
        content:
          "Cadastro completo: dados, faixa, grau, histórico de graduação e visão do mês na mesma ficha.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("page-alunos"),
        title: "Lista de alunos",
        content:
          "Busque, filtre e abra a ficha pela linha. O botão de novo aluno fica nesta área. Quando subir de faixa, registre a graduação na ficha para manter o histórico certo.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.alunos);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-mensalidades"),
        title: "Mensalidades",
        content:
          "Acompanhe o mês de referência, quem está em dia e quem não está. Registre o pagamento quando o valor for confirmado.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("page-mensalidades"),
        title: "Mensalidades do mês",
        content:
          "Confira o mês no topo, use os filtros e abra o aluno para ver detalhes. Registre o pagamento no momento em que fechar o valor com a família.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.mensalidades);
        },
      },
      {
        target: () => firstVisibleDataTour("tour-configuracoes"),
        title: "Configurações",
        content:
          "Nome da academia e valores dos planos (kids e adulto). Isso padroniza o vínculo de cada aluno com o plano certo e reduz erro de mensalidade.",
        placement: "right",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("page-configuracoes"),
        title: "Preferências da academia",
        content:
          "Ajuste aquilo que vale para toda a escola. Nome de exibição, e-mail e dados pessoais ficam em Perfil, no ícone de usuário ao lado do botão Wizard.",
        placement: "auto",
        before: async () => {
          await navigateTo(ROUTES.configuracoes);
        },
      },
      {
        target: () => firstVisibleDataTour("shell-wizard-trigger"),
        title: "Abrir o tour de novo",
        content:
          "Sempre que precisar rever o passo a passo, clique em Wizard. No mesmo canto, o ícone de usuário abre Perfil e Sair.",
        placement: "auto",
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
