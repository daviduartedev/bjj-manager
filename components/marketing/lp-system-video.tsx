"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";

import {
  LP_SYSTEM_VIDEO_DURATION,
  LP_SYSTEM_VIDEO_FPS,
  LP_SYSTEM_VIDEO_HEIGHT,
  LP_SYSTEM_VIDEO_WIDTH,
  SystemScreensComposition,
} from "@/components/marketing/lp-system-screens";
import {
  LpDisplay,
  LpEyebrow,
  LpReveal,
} from "@/components/marketing/lp-primitives";

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
// Copy items (verbatim from spec)
// ---------------------------------------------------------------------------

const ITEMS = [
  {
    title: "Alunos",
    body: "Cadastro, lista e ficha. Adulto ou kids, com faixa, grau e a situação do mês no mesmo lugar.",
  },
  {
    title: "Graduação",
    body: "Histórico com data. Promoção de grau ou faixa; pulo de ordem pede justificativa.",
  },
  {
    title: "Mensalidades",
    body: "Mês de referência com status explícito. O pagamento é confirmado na operação da escola.",
  },
  {
    title: "Painel",
    body: "Alunos ativos, atrasos, aniversariantes e o que precisa de atenção hoje.",
  },
  {
    title: "Documentos",
    body: "Certificados, termos, comprovantes de matrícula e recibos, com envio por WhatsApp.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpSystemVideo
// ---------------------------------------------------------------------------

export function LpSystemVideo() {
  const playerRef = useRef<PlayerRef>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (prefersReducedMotion) {
      player.pause();
      player.seekTo(0);
    }
  }, [prefersReducedMotion]);

  return (
    <section
      data-testid="lp-system-video"
      aria-label="O sistema em uso"
      className="relative bg-[#0a0a0a] border-y border-white/10 px-5 py-20 sm:px-10 sm:py-28 lg:px-14"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <LpReveal>
          <LpEyebrow>Em uso</LpEyebrow>
          <LpDisplay className="mt-6 text-[clamp(2.25rem,5vw,4rem)]">O sistema rodando</LpDisplay>
          <p className="mt-6 max-w-[52ch] text-white/60 leading-relaxed">
            Seis telas reais, em sequência: do login ao painel do dia.
          </p>
        </LpReveal>

        {/* Grid */}
        <LpReveal className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
          {/* Left — player inside manual browser frame */}
          <div
            data-testid="lp-system-video-card"
            className="overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)]"
          >
            {/* Browser bar */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden />
              <span className="ml-2 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/40">
                casca.app
              </span>
            </div>
            {/* Live player */}
            <div className="relative aspect-[16/10]">
              <Player
                ref={playerRef}
                component={SystemScreensComposition}
                durationInFrames={LP_SYSTEM_VIDEO_DURATION}
                compositionWidth={LP_SYSTEM_VIDEO_WIDTH}
                compositionHeight={LP_SYSTEM_VIDEO_HEIGHT}
                fps={LP_SYSTEM_VIDEO_FPS}
                autoPlay={!prefersReducedMotion}
                loop={!prefersReducedMotion}
                acknowledgeRemotionLicense
                controls={false}
                clickToPlay={!prefersReducedMotion}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

          {/* Right — copy list */}
          <ul data-testid="lp-system-video-copy" className="flex flex-col">
            {ITEMS.map((item) => (
              <li key={item.title} className="border-l-2 border-white/10 pl-5 py-1">
                <p className="font-lp text-xl sm:text-2xl font-extrabold uppercase">{item.title}</p>
                <p className="mt-1.5 text-sm sm:text-base text-white/60 leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </LpReveal>
      </div>
    </section>
  );
}
