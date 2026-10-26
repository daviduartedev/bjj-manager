import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";

import {
  PROMO_FPS,
  PROMO_HEIGHT,
  PROMO_WIDTH,
  WIN,
  cameraAt,
  type CamKey,
} from "@/components/marketing/promo/timeline";
import { FONT } from "@/components/marketing/promo/ui";

// ---------------------------------------------------------------------------
// Fundo
// ---------------------------------------------------------------------------

export function Backdrop({ frame }: { frame: number }) {
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{ background: "#030304" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 600px at ${300 + drift}px 120px, rgba(191,30,39,0.38), transparent 70%), radial-gradient(800px 560px at ${1640 - drift}px 980px, rgba(191,30,39,0.22), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.2px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Câmera
// ---------------------------------------------------------------------------

/** Aplica zoom/pan: `keys` em coordenadas locais da janela, frame global. */
export function Camera({
  keys,
  frame,
  children,
}: {
  keys: readonly CamKey[];
  frame: number;
  children: ReactNode;
}) {
  const cam = cameraAt(keys, frame);
  const halfW = PROMO_WIDTH / 2 / cam.s;
  const halfH = PROMO_HEIGHT / 2 / cam.s;
  const fx = Math.min(PROMO_WIDTH - halfW, Math.max(halfW, cam.x + WIN.x));
  const fy = Math.min(PROMO_HEIGHT - halfH, Math.max(halfH, cam.y + WIN.y));
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(${PROMO_WIDTH / 2}px, ${PROMO_HEIGHT / 2}px) scale(${cam.s}) translate(${-fx}px, ${-fy}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Cursor
// ---------------------------------------------------------------------------

export function Cursor({
  x,
  y,
  opacity,
  clicks,
  frame,
}: {
  x: number;
  y: number;
  opacity: number;
  clicks: readonly number[];
  frame: number;
}) {
  const pressing = clicks.some((c) => frame >= c - 2 && frame <= c + 5);
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.x,
        top: WIN.y,
        width: 0,
        height: 0,
        opacity,
        pointerEvents: "none",
      }}
    >
      {clicks.map((c) => {
        const t = (frame - c) / 22;
        if (t < 0 || t > 1) return null;
        const size = 30 + t * 110;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: size,
              border: `${4 * (1 - t) + 1}px solid rgba(255,70,80,${0.85 * (1 - t)})`,
              background: `rgba(191,30,39,${0.22 * (1 - t)})`,
            }}
          />
        );
      })}
      <svg
        width={44}
        height={54}
        viewBox="0 0 24 30"
        style={{
          position: "absolute",
          left: x - 3,
          top: y - 2,
          transform: `scale(${pressing ? 0.86 : 1})`,
          transformOrigin: "3px 2px",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))",
        }}
      >
        <path
          d="M3 2 L3 22.5 L8.6 17.6 L12.4 26.4 L16 24.8 L12.2 16.2 L19.6 16 Z"
          fill="#0b0b0d"
          stroke="#ffffff"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legenda de cena
// ---------------------------------------------------------------------------

const NOTE_HOLD_FRAMES = 78;

export function SceneNote({
  title,
  text,
  frame,
  duration,
}: {
  title: string;
  text: string;
  /** Frame local da cena. */
  frame: number;
  duration: number;
}) {
  const enter = spring({ frame: frame - 6, fps: PROMO_FPS, config: { damping: 200 } });
  // A legenda abre a cena e sai cedo para não cobrir os campos que ganham zoom.
  const hold = Math.min(duration, NOTE_HOLD_FRAMES);
  const exit = interpolate(frame, [hold - 10, hold], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = Math.min(enter, exit);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 26,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - enter) * 24}px)`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "14px 34px 14px 16px",
          borderRadius: 999,
          background: "rgba(18,18,20,0.78)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          color: "#fff",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 18,
            background: "#BF1E27",
            boxShadow: "0 0 0 8px rgba(191,30,39,0.28)",
            marginLeft: 8,
          }}
        />
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</span>
        <span style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />
        <span style={{ fontSize: 26, color: "rgba(255,255,255,0.72)" }}>{text}</span>
      </div>
    </div>
  );
}
