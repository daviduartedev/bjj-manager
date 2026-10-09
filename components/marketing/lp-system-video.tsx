"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  LP_SYSTEM_SCENE_FRAMES,
  LP_SYSTEM_VIDEO_DURATION,
  LP_SYSTEM_VIDEO_FPS,
  LP_SYSTEM_VIDEO_HEIGHT,
  LP_SYSTEM_VIDEO_POSTER_FRAME,
  LP_SYSTEM_VIDEO_WIDTH,
  SystemScreensComposition,
  lpSystemSceneAt,
  lpSystemSceneStart,
  type LpSystemSceneId,
} from "@/components/marketing/lp-system-screens";

// ---------------------------------------------------------------------------
// Accessibility hook
// ---------------------------------------------------------------------------

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}

// ---------------------------------------------------------------------------
// Copy items (verbatim from spec). `scene` liga cada item à cena do vídeo.
// ---------------------------------------------------------------------------

const ITEMS = [
  {
    scene: "alunos",
    title: "Alunos",
    body: "Cadastro, lista e ficha. Adulto ou kids, com faixa, grau e a situação do mês no mesmo lugar.",
  },
  {
    scene: "graduacao",
    title: "Graduação",
    body: "Histórico com data. Promoção de grau ou faixa; pulo de ordem pede justificativa.",
  },
  {
    scene: "mensalidades",
    title: "Mensalidades",
    body: "Mês de referência com status explícito. O pagamento é confirmado na operação da escola.",
  },
  {
    scene: "painel",
    title: "Painel",
    body: "Alunos ativos, atrasos, aniversariantes e o que precisa de atenção hoje.",
  },
  {
    scene: "documentos",
    title: "Documentos",
    body: "Certificados, termos, comprovantes de matrícula e recibos, com envio por WhatsApp.",
  },
] as const satisfies ReadonlyArray<{ scene: LpSystemSceneId; title: string; body: string }>;

// ---------------------------------------------------------------------------
// LpSystemVideo
// ---------------------------------------------------------------------------

export function LpSystemVideo() {
  const playerRef = useRef<PlayerRef>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeScene, setActiveScene] = useState<LpSystemSceneId>("intro");

  // Atualizações por frame vão direto no DOM (sem re-render a 30fps).
  const fillRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sceneRef = useRef<LpSystemSceneId>("intro");
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const userPausedRef = useRef(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrame = (event: { detail: { frame: number } }) => {
      const frame = event.detail.frame;
      const scene = lpSystemSceneAt(frame);
      if (scene !== sceneRef.current) {
        sceneRef.current = scene;
        setActiveScene(scene);
      }
      const local = (frame - lpSystemSceneStart(scene)) / LP_SYSTEM_SCENE_FRAMES[scene];
      for (const [id, el] of Object.entries(fillRefs.current)) {
        if (el) el.style.width = id === scene ? `${Math.min(1, Math.max(0, local)) * 100}%` : "0%";
      }
    };
    player.addEventListener("frameupdate", onFrame);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    // O estado inicial de prefersReducedMotion é `true` (evita mismatch de hidratação);
    // a leitura real vem do matchMedia para não mostrar o quadro estático por engano.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      player.pause();
      player.seekTo(LP_SYSTEM_VIDEO_POSTER_FRAME);
      return;
    }

    // A prop autoPlay só é lida na montagem (e o estado inicial de prefersReducedMotion
    // é true), então a reprodução é controlada aqui: o vídeo começa do início quando a
    // seção aparece e pausa quando sai de vista, respeitando uma pausa manual.
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            player.seekTo(0);
          }
          if (!userPausedRef.current) player.play();
        } else {
          player.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const jumpTo = useCallback(
    (scene: LpSystemSceneId) => {
      const player = playerRef.current;
      if (!player) return;
      player.seekTo(lpSystemSceneStart(scene));
      if (!prefersReducedMotion) {
        userPausedRef.current = false;
        player.play();
      }
    },
    [prefersReducedMotion],
  );

  return (
    <div
      id="sistema"
      ref={sectionRef}
      data-testid="lp-system-video"
      aria-label="O sistema em uso"
      className="relative scroll-mt-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[80%] -translate-x-1/2 rounded-full bg-[#BF1E27]/25 blur-[130px]"
      />

      {/* Player com moldura leve (sem barra de navegador nem rodapé) */}
      <div
        data-testid="lp-system-video-card"
        className="relative mx-auto max-w-6xl rounded-[28px] border border-white/15 bg-white/[0.04] p-2 shadow-[0_40px_90px_-30px_rgba(191,30,39,0.5),0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:p-2.5"
      >
        <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black ring-1 ring-white/10">
          <Player
            ref={playerRef}
            component={SystemScreensComposition}
            durationInFrames={LP_SYSTEM_VIDEO_DURATION}
            compositionWidth={LP_SYSTEM_VIDEO_WIDTH}
            compositionHeight={LP_SYSTEM_VIDEO_HEIGHT}
            fps={LP_SYSTEM_VIDEO_FPS}
            loop
            initiallyMuted
            acknowledgeRemotionLicense
            controls={false}
            clickToPlay={!prefersReducedMotion}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Cenas (clicáveis: pulam para a cena) */}
      <ul
        data-testid="lp-system-video-copy"
        className="relative mx-auto mt-5 grid max-w-6xl gap-2 sm:grid-cols-2 lg:grid-cols-5"
      >
        {ITEMS.map((item) => {
          const active = activeScene === item.scene;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => jumpTo(item.scene)}
                aria-current={active ? "true" : undefined}
                className={`relative h-full w-full rounded-xl px-4 pb-4 pt-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                }`}
              >
                <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-white/10">
                  <span
                    ref={(el) => {
                      fillRefs.current[item.scene] = el as unknown as HTMLDivElement | null;
                    }}
                    className="block h-full rounded-full bg-[#BF1E27]"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                </span>
                <span
                  className={`block font-sans text-lg font-semibold tracking-[-0.02em] transition-colors ${
                    active ? "text-white" : "text-white/75"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`mt-1.5 block text-sm leading-relaxed transition-colors ${
                    active ? "text-white/70" : "text-white/45"
                  }`}
                >
                  {item.body}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}