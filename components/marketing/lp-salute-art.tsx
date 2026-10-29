"use client";

import { Geologica } from "next/font/google";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import s from "./lp-salutes.module.css";

const display = Geologica({ subsets: ["latin"], weight: "700", display: "swap" });

/** Amarelo do impacto, igual ao da marca. */
const IMPACT = "#F8B800";
const SKIN = "#ffffff";

export type SaluteKind = "oss" | "wai" | "taekwondo" | "boxe";

/** Só anima enquanto o card está na tela. */
function usePlaying() {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setPlaying(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, playing };
}

export function LpSaluteArt({ kind, word }: { kind: SaluteKind; word?: string }) {
  const { ref, playing } = usePlaying();
  return (
    <div ref={ref} className={s.root} data-playing={playing ? "true" : "false"}>
      <svg
        aria-hidden
        viewBox="0 0 240 240"
        className={cn(display.className, "block h-auto w-full overflow-hidden text-neutral-950")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "oss" ? <Oss /> : null}
        {kind === "wai" ? <Wai /> : null}
        {kind === "taekwondo" ? <Taekwondo /> : null}
        {kind === "boxe" ? <Boxe /> : null}
        {word ? (
          <text
            x={120}
            y={226}
            textAnchor="middle"
            fontSize={30}
            letterSpacing={kind === "wai" ? 1 : 3}
            fill="currentColor"
            stroke="none"
            className={cn(s.anim, s.fill, kind === "wai" ? s.waiWord : s.ossWord)}
          >
            {word}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

/** Jiu-jitsu: o punho fechado desce até a palma aberta. */
function Oss() {
  return (
    <>
      <g className={cn(s.anim, s.ossPalm)}>
        <path d="M248 122 L204 124 C199 142 199 160 204 178 L248 180 Z" fill={SKIN} />
        <ellipse cx={204} cy={151} rx={7} ry={27} fill={SKIN} />
        <path
          d="M201 136 C186 134 170 135 154 138 C134 141 108 140 84 140 C72 140 66 144 68 149 C70 155 80 157 92 158 C120 160 150 162 172 164 C184 165 194 165 201 165 Z"
          fill={SKIN}
        />
        <path d="M160 138 C158 128 150 120 140 119 C132 119 130 125 136 130 C140 133 146 136 150 138" fill={SKIN} />
        <path d="M84 146 C100 147 116 147 128 146 M78 152 C92 154 106 154 118 153 M150 145 C160 149 172 150 184 149" strokeWidth={1.5} />
      </g>

      <g className={cn(s.anim, s.ossFist)}>
        <path d="M86 -8 L92 64 C108 70 128 70 144 64 L150 -8 Z" fill={SKIN} />
        <ellipse cx={118} cy={64} rx={26} ry={7} fill={SKIN} />
        <path
          d="M98 66 C96 82 94 98 95 112 C95 118 96 124 98 128 Q101 139 107.5 136 Q112.5 141 118 137.5 Q123.5 141 129 136 Q135 139 138 128 C140 118 141 102 140 88 C140 78 139 71 138 66 Z"
          fill={SKIN}
        />
        <path d="M107.5 136 C106.5 129 106.5 123 107.5 117 M118 137.5 L118 117 M129 136 C130 129 130 123 129 117 M96 117 C108 121 128 121 140.5 117" strokeWidth={1.5} />
        <path d="M95 98 C104 94 118 95 130 102 C135 105 134 111 127 111 C116 111 104 109 95.5 108" fill={SKIN} />
        <path d="M122 102 C125 103 127 105 127 108" strokeWidth={1.5} />
      </g>

      <ellipse cx={118} cy={140} rx={30} ry={6} stroke={IMPACT} strokeWidth={2.4} className={cn(s.anim, s.fill, s.ossPulse)} />
      <g stroke={IMPACT} strokeWidth={3} className={cn(s.anim, s.fill, s.ossBurst)}>
        <path d="M86 128 l-12 -8 M84 139 l-15 0 M152 128 l12 -8 M154 139 l15 0" />
      </g>
    </>
  );
}

/** Uma mão do wai. A outra é o espelho. */
function WaiHalf() {
  return (
    <>
      <path d="M190 148 L248 158 L248 214 L176 188 Z" fill={SKIN} />
      <ellipse cx={183} cy={168} rx={7} ry={21} transform="rotate(20 183 168)" fill={SKIN} />
      <path d="M137 114 L188 152 L178 182 L120 136 Z" fill={SKIN} />
      <path d="M120 40 C127 42 133 54 134 72 C135 90 137 106 143 122 C136 130 126 134 120 134 Z" fill={SKIN} />
      <path d="M126 50 C129 58 130 66 130 76 M132 106 C138 104 142 110 141 118" strokeWidth={1.5} />
    </>
  );
}

/** Muay Thai: as mãos sobem no wai e inclinam à frente. */
function Wai() {
  return (
    <>
      <g className={cn(s.anim, s.waiAll)}>
        <g className={cn(s.anim, s.waiLeft)}>
          <g transform="translate(240 0) scale(-1 1)">
            <WaiHalf />
          </g>
        </g>
        <g className={cn(s.anim, s.waiRight)}>
          <WaiHalf />
        </g>
      </g>
      <g stroke={IMPACT} strokeWidth={3} className={cn(s.anim, s.fill, s.waiSpark)}>
        <path d="M120 30 l0 -13 M104 34 l-8 -9 M136 34 l8 -9" />
      </g>
    </>
  );
}

/** Taekwondo: punhos descem ao lado do corpo e o tronco inclina. */
function Taekwondo() {
  return (
    <>
      <path d="M91 206 L157 206 L161 248 L87 248 Z" fill={SKIN} />
      <g className={cn(s.anim, s.tkdBody)}>
        <path d="M104 76 L104 98 M120 78 L122 98" />
        <path
          d="M98 96 C92 120 90 160 92 214 L156 214 C158 170 156 130 148 104 C140 94 124 90 112 90 C106 90 100 92 98 96 Z"
          fill={SKIN}
        />
        <circle cx={112} cy={62} r={22} fill={SKIN} />
        <path d="M121 60 C125 58 127 64 123 68" strokeWidth={1.5} />
        <path d="M103 95 C109 112 115 124 121 132 M111 92 C117 106 123 116 129 122" strokeWidth={1.5} />
        <path d="M91 192 L157 192 L157 206 L91 206 Z" fill="currentColor" />
        <path d="M93 199 C85 201 83 210 87 222 M95 200 C93 210 95 218 99 226" strokeWidth={3} />

        <g className={cn(s.anim, s.tkdArm)}>
          <path d="M120 104 C116 130 114 150 116 172 L142 172 C146 150 146 126 144 104 Z" fill={SKIN} />
          <ellipse cx={129} cy={172} rx={13} ry={4} fill={SKIN} />
          <path d="M119 174 C117 182 118 192 124 196 C130 199 138 197 140 190 C142 182 140 176 139 174 Z" fill={SKIN} />
          <path d="M120 184 C126 186 132 186 140 184 M124 190 C128 192 134 192 138 190" strokeWidth={1.5} />
        </g>
        <g stroke={IMPACT} strokeWidth={3} className={cn(s.anim, s.fill, s.tkdBurst)}>
          <path d="M108 182 l-11 -5 M106 191 l-12 1 M109 200 l-9 6" />
        </g>
      </g>
    </>
  );
}

/** Uma luva de boxe apontando para a direita. */
function Glove() {
  return (
    <>
      <path d="M-8 100 L50 98 L52 146 L-8 148 Z" fill={SKIN} />
      <path d="M24 99 L25 147 M36 98.5 L37 146.5" strokeWidth={1.5} />
      <path
        d="M44 106 C44 84 60 70 86 70 C108 70 120 86 120 112 C120 138 106 154 84 154 C62 154 46 144 44 128 Z"
        fill={SKIN}
      />
      <path d="M48 104 C50 92 62 86 76 88 C86 90 88 100 80 104 C72 107 60 108 48 110" fill={SKIN} />
      <path d="M100 78 C112 92 114 126 102 148" strokeWidth={1.5} />
    </>
  );
}

/** Boxe: as luvas se tocam no centro. */
function Boxe() {
  return (
    <>
      <g className={cn(s.anim, s.boxLeft)}>
        <Glove />
      </g>
      <g className={cn(s.anim, s.boxRight)}>
        <g transform="translate(240 0) scale(-1 1)">
          <Glove />
        </g>
      </g>
      <circle cx={120} cy={113} r={14} stroke={IMPACT} strokeWidth={2.4} className={cn(s.anim, s.fill, s.boxPulse)} />
      <g stroke={IMPACT} strokeWidth={3} className={cn(s.anim, s.fill, s.boxBurst)}>
        <path d="M120 64 l0 -14 M104 68 l-8 -10 M136 68 l8 -10 M120 162 l0 14 M104 158 l-8 10 M136 158 l8 10" />
      </g>
    </>
  );
}
