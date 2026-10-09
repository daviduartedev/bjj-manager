import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { FONT, WORDMARK_SRC } from "@/components/marketing/promo/ui";
import { PROMO_FPS, progress } from "@/components/marketing/promo/timeline";

function Rise({
  frame,
  start,
  children,
  style,
  distance = 36,
}: {
  frame: number;
  start: number;
  children: ReactNode;
  style?: CSSProperties;
  distance?: number;
}) {
  const p = spring({ frame: frame - start, fps: PROMO_FPS, config: { damping: 200 } });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style }}>{children}</div>
  );
}

// ---------------------------------------------------------------------------
// Abertura
// ---------------------------------------------------------------------------

/** Janela do app subindo em perspectiva (envolve a cena "Alunos" congelada). */
export function IntroRise({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = progress(frame, 50, durationInFrames - 50);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(1, p * 1.6),
        transformOrigin: "50% 100%",
        transform: `perspective(2600px) translateY(${(1 - p) * 460}px) rotateX(${(1 - p) * 22}deg) scale(${0.8 + 0.2 * p})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

export function IntroTitle() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 62, durationInFrames - 38], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#fff",
        opacity: out,
        transform: `translateY(${(1 - out) * -50}px) scale(${1 + (1 - out) * 0.04})`,
      }}
    >
      <Rise frame={frame} start={0}>
        <Img src={WORDMARK_SRC} style={{ height: 120, width: "auto", display: "block", margin: "0 auto" }} />
      </Rise>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Encerramento
// ---------------------------------------------------------------------------

/** Janela do app saindo de cena no começo do fechamento. */
export function OutroWindowExit({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, 26);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - p,
        transform: `scale(${1 - p * 0.1}) translateY(${p * -30}px)`,
        filter: `blur(${p * 10}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

const CAPS = ["Alunos", "Graduação", "Mensalidades", "Painel", "Documentos"] as const;

export function OutroCard() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#fff",
        opacity: out,
      }}
    >
      <Rise frame={frame} start={14}>
        <Img src={WORDMARK_SRC} style={{ height: 84, width: "auto", display: "block", margin: "0 auto" }} />
      </Rise>
      <Rise
        frame={frame}
        start={24}
        style={{ marginTop: 40, maxWidth: 1360, fontSize: 84, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08 }}
      >
        Feito para quem ensina e para quem administra a escola
      </Rise>
      <Rise frame={frame} start={40} style={{ marginTop: 28, fontSize: 34, color: "rgba(255,255,255,0.62)" }}>
        Cadastro, graduação, financeiro do mês, painel e documentos no mesmo lugar.
      </Rise>
      <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
        {CAPS.map((c, i) => (
          <Rise
            key={c}
            frame={frame}
            start={52 + i * 4}
            style={{
              padding: "12px 26px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {c}
          </Rise>
        ))}
      </div>
      <Rise
        frame={frame}
        start={74}
        style={{
          marginTop: 52,
          padding: "22px 64px",
          borderRadius: 999,
          background: "#BF1E27",
          fontSize: 34,
          fontWeight: 700,
          boxShadow: "0 24px 60px -16px rgba(191,30,39,0.9)",
        }}
      >
        Entrar no Casca
      </Rise>
    </AbsoluteFill>
  );
}

