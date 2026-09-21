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
      className="grid bg-black lg:h-[100svh] lg:grid-cols-2"
    >
      <div className="flex items-center justify-center border-b border-white/15 px-5 py-10 sm:px-10 lg:sticky lg:top-0 lg:h-[100svh] lg:border-b-0 lg:border-r lg:px-10">
        <div
          data-testid="lp-system-video-card"
          className="aspect-[16/10] w-full overflow-hidden border border-white/15 bg-black"
        >
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
      <div
        data-testid="lp-system-video-copy"
        className="space-y-12 px-5 py-14 sm:px-10 lg:h-[100svh] lg:min-h-0 lg:overflow-y-auto lg:px-14 lg:py-16"
      >
        {(
          [
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
          ] as const
        ).map((item) => (
          <article key={item.title} className="max-w-[42ch]">
            <p className="font-lp text-[clamp(2rem,4vw,3.25rem)] font-extrabold uppercase !leading-[1.08] tracking-[-0.02em]">
              {item.title}
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
