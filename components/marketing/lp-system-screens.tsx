import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";

import { LP_SYSTEM_SCREEN_SRCS } from "@/lib/marketing/lp-system-screens";

export const LP_SYSTEM_VIDEO_FPS = 30;
export const LP_SYSTEM_SCREEN_HOLD = 75;
export const LP_SYSTEM_CROSSFADE = 18;
export const LP_SYSTEM_VIDEO_WIDTH = 1440;
export const LP_SYSTEM_VIDEO_HEIGHT = 900;

export const LP_SYSTEM_VIDEO_DURATION =
  LP_SYSTEM_SCREEN_SRCS.length * LP_SYSTEM_SCREEN_HOLD + LP_SYSTEM_CROSSFADE;

export function SystemScreensComposition() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {LP_SYSTEM_SCREEN_SRCS.map((src, index) => {
        const start = index * LP_SYSTEM_SCREEN_HOLD;
        // Primeira tela começa visível (opacity 1 no frame 0): garante imagem para
        // quem tem prefers-reduced-motion (player pausado no frame 0) e evita
        // flash preto na primeira pintura. Demais telas mantêm o fade cruzado.
        const opacity =
          index === 0
            ? interpolate(
                frame,
                [start + LP_SYSTEM_SCREEN_HOLD, start + LP_SYSTEM_SCREEN_HOLD + LP_SYSTEM_CROSSFADE],
                [1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            : interpolate(
                frame,
                [
                  start,
                  start + LP_SYSTEM_CROSSFADE,
                  start + LP_SYSTEM_SCREEN_HOLD,
                  start + LP_SYSTEM_SCREEN_HOLD + LP_SYSTEM_CROSSFADE,
                ],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );

        return (
          <AbsoluteFill key={src} style={{ opacity }}>
            <Img
              src={src}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
}
