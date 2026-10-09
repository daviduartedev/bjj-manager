import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Img } from "remotion";

import { HEADER_H, SIDEBAR_W, WIN } from "@/components/marketing/promo/timeline";

/**
 * Kit visual do vídeo-promo: recria o sistema (sidebar preta, cartões brancos, vermelho Casca)
 * em escala "de vídeo" (tipografia maior que a do app) para ler bem em player pequeno.
 */

export const C = {
  red: "#BF1E27",
  redDark: "#9d171f",
  redSoft: "#fde8ea",
  ink: "#1c1f24",
  muted: "#6b7280",
  line: "#e8e9ed",
  app: "#f3f4f6",
  card: "#ffffff",
  green: "#16a34a",
  greenSoft: "#e3f6ea",
  blue: "#0ea5e9",
  blueSoft: "#e0f2fe",
  amber: "#f59e0b",
  amberSoft: "#fef3c7",
} as const;

/** Wordmark sem fundo preto (derivado de /uf.png), para compor sobre qualquer fundo. */
export const WORDMARK_SRC = "/marketing/casca-wordmark-transparent.png";

export const FONT =
  'var(--font-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const CARD_SHADOW =
  "0 1px 2px rgba(16,24,40,0.05), 0 18px 40px -16px rgba(16,24,40,0.18)";

export const BELTS = {
  Branca: "#f1f1ee",
  Azul: "#1d4ed8",
  Roxa: "#7e22ce",
  Marrom: "#78350f",
  Preta: "#16181d",
} as const;
export type BeltName = keyof typeof BELTS;

// ---------------------------------------------------------------------------
// Janela do app + sidebar
// ---------------------------------------------------------------------------

export type NavId =
  | "painel"
  | "alunos"
  | "mensalidades"
  | "aulas"
  | "pedagogico"
  | "documentos"
  | "matriculas"
  | "produtos"
  | "configuracoes";

const NAV: ReadonlyArray<{ id: NavId; label: string; Icon: LucideIcon }> = [
  { id: "painel", label: "Painel", Icon: LayoutDashboard },
  { id: "alunos", label: "Alunos", Icon: Users },
  { id: "mensalidades", label: "Mensalidades", Icon: Wallet },
  { id: "aulas", label: "Aulas", Icon: CalendarDays },
  { id: "pedagogico", label: "Pedagógico", Icon: BookOpen },
  { id: "documentos", label: "Documentos", Icon: FileText },
  { id: "matriculas", label: "Matrículas", Icon: ClipboardList },
  { id: "produtos", label: "Produtos", Icon: Package },
  { id: "configuracoes", label: "Configurações", Icon: Settings },
];

function Sidebar({ active }: { active: NavId }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: "0 auto 0 0",
        width: SIDEBAR_W,
        background: "#050505",
        padding: "30px 22px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "0 14px 26px" }}>
        <Img src={WORDMARK_SRC} style={{ height: 40, width: "auto", display: "block" }} />
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, marginTop: 12 }}>
          Academia Gracie Norte
        </div>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 15,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "8px 14px 12px",
          fontWeight: 600,
        }}
      >
        Operação
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {NAV.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <div
              key={id}
              style={{
                height: 60,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "0 18px",
                color: on ? "#fff" : "rgba(255,255,255,0.72)",
                background: on ? "rgba(191,30,39,0.24)" : "transparent",
                border: on ? "1px solid rgba(191,30,39,0.65)" : "1px solid transparent",
                fontSize: 22,
                fontWeight: on ? 700 : 600,
              }}
            >
              <Icon size={26} strokeWidth={1.8} color={on ? "#ff4650" : "rgba(255,255,255,0.6)"} />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Janela do app com sidebar e área de conteúdo. O conteúdo usa coordenadas locais à janela. */
export function AppWindow({ active, children }: { active: NavId; children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.x,
        top: WIN.y,
        width: WIN.w,
        height: WIN.h,
        borderRadius: 34,
        overflow: "hidden",
        background: C.app,
        fontFamily: FONT,
        color: C.ink,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08), 0 60px 120px -30px rgba(0,0,0,0.85), 0 0 140px -20px rgba(191,30,39,0.35)",
      }}
    >
      <Sidebar active={active} />
      <div style={{ position: "absolute", left: SIDEBAR_W, top: 0, right: 0, bottom: 0 }}>
        {/* Conteúdo posicionado em coordenadas da janela: desloca de volta a sidebar. */}
        <div style={{ position: "absolute", left: -SIDEBAR_W, top: 0, width: WIN.w, height: WIN.h }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------------

export function Abs({
  x,
  y,
  w,
  h,
  style,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <>
      <Abs
        x={SIDEBAR_W}
        y={0}
        w={WIN.w - SIDEBAR_W}
        h={HEADER_H}
        style={{ borderBottom: `1px solid ${C.line}`, background: "rgba(255,255,255,0.6)" }}
      />
      <Abs x={SIDEBAR_W + 48} y={subtitle ? 18 : 28} style={{ whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 19, color: C.muted, marginTop: 4 }}>{subtitle}</div>
        ) : null}
      </Abs>
      {right}
    </>
  );
}

export function Card({
  x,
  y,
  w,
  h,
  style,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <Abs
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        background: C.card,
        borderRadius: 28,
        boxShadow: CARD_SHADOW,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </Abs>
  );
}

export function IconBadge({
  Icon,
  bg,
  color,
  size = 58,
}: {
  Icon: LucideIcon;
  bg: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: bg,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Icon size={size * 0.46} color={color} strokeWidth={2} />
    </div>
  );
}

export function Pill({
  children,
  bg,
  color,
  style,
}: {
  children: ReactNode;
  bg: string;
  color: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 38,
        padding: "0 16px",
        borderRadius: 12,
        background: bg,
        color,
        fontSize: 19,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Button({
  x,
  y,
  w,
  h = 60,
  label,
  Icon,
  variant = "primary",
  pressed = 0,
  disabled = false,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  Icon?: LucideIcon;
  variant?: "primary" | "outline" | "soft" | "whatsapp";
  /** 0..1, ver `press()`. */
  pressed?: number;
  disabled?: boolean;
}) {
  const palette = {
    primary: { bg: C.red, fg: "#fff", border: C.red },
    outline: { bg: "#fff", fg: C.ink, border: "#111" },
    soft: { bg: "#f4f2ee", fg: C.ink, border: "#e6e2da" },
    whatsapp: { bg: "#25d366", fg: "#04361a", border: "#25d366" },
  }[variant];
  return (
    <Abs
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        transform: `scale(${1 - pressed * 0.06})`,
        transformOrigin: "center",
        background: palette.bg,
        color: palette.fg,
        border: `2px solid ${palette.border}`,
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: 23,
        fontWeight: 700,
        opacity: disabled ? 0.45 : 1,
        boxSizing: "border-box",
        boxShadow:
          variant === "primary" && !disabled ? "0 10px 24px -10px rgba(191,30,39,0.7)" : "none",
        filter: pressed ? `brightness(${1 - pressed * 0.1})` : undefined,
      }}
    >
      {Icon ? <Icon size={26} strokeWidth={2.2} /> : null}
      {label}
    </Abs>
  );
}

export function StatCard({
  x,
  y,
  w,
  h = 150,
  Icon,
  iconBg,
  iconColor,
  label,
  labelSize = 22,
  value,
  note,
  bar,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  labelSize?: number;
  value: ReactNode;
  note?: ReactNode;
  bar?: string;
}) {
  return (
    <Card x={x} y={y} w={w} h={h} style={{ padding: "22px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <IconBadge Icon={Icon} bg={iconBg} color={iconColor} size={54} />
        <div style={{ fontSize: labelSize, color: C.muted, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 14 }}>
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        {note}
      </div>
      {bar ? (
        <div
          style={{
            position: "absolute",
            right: 28,
            top: 28,
            width: 10,
            height: 44,
            borderRadius: 6,
            background: bar,
          }}
        />
      ) : null}
    </Card>
  );
}

export function BeltBar({
  belt,
  degrees = 0,
  w = 180,
}: {
  belt: BeltName;
  degrees?: number;
  w?: number;
}) {
  const h = Math.round(w * 0.15);
  const tip = Math.round(w * 0.3);
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: h / 3,
        background: BELTS[belt],
        border: "1px solid rgba(0,0,0,0.25)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: Math.round(w * 0.1),
          top: 0,
          bottom: 0,
          width: tip,
          background: belt === "Preta" ? C.red : "#0b0b0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: Math.max(2, Math.round(w * 0.025)),
          paddingRight: Math.round(w * 0.04),
          boxSizing: "border-box",
        }}
      >
        {Array.from({ length: degrees }).map((_, i) => (
          <div key={i} style={{ width: Math.max(3, Math.round(w * 0.03)), height: "78%", background: "#fff" }} />
        ))}
      </div>
    </div>
  );
}

export function Toast({
  x,
  y,
  text,
  progress: p,
}: {
  x: number;
  y: number;
  text: string;
  /** 0..1 entrada. */
  progress: number;
}) {
  return (
    <Abs
      x={x}
      y={y + (1 - p) * 30}
      style={{
        opacity: p,
        background: "#0f1115",
        color: "#fff",
        borderRadius: 20,
        padding: "20px 28px",
        fontSize: 23,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 34,
          background: C.green,
          display: "grid",
          placeItems: "center",
          fontSize: 22,
        }}
      >
        ✓
      </span>
      {text}
    </Abs>
  );
}

/** Campo de texto com caret piscando. */
export function Field({
  x,
  y,
  w,
  h = 64,
  label,
  value,
  placeholder,
  focused,
  frame,
  trailing,
  showCaret = true,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  value: string;
  placeholder?: string;
  focused: boolean;
  frame: number;
  trailing?: ReactNode;
  /** false em selects: só realça a borda, sem caret de digitação. */
  showCaret?: boolean;
}) {
  const caret = showCaret && focused && Math.floor(frame / 14) % 2 === 0;
  return (
    <>
      <Abs x={x} y={y - 34} style={{ fontSize: 20, fontWeight: 700, color: "#3b4048" }}>
        {label}
      </Abs>
      <Abs
        x={x}
        y={y}
        w={w}
        h={h}
        style={{
          boxSizing: "border-box",
          borderRadius: 16,
          border: `2px solid ${focused ? C.red : C.line}`,
          boxShadow: focused ? "0 0 0 6px rgba(191,30,39,0.14)" : "none",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontSize: 25,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {value ? (
          <span>{value}</span>
        ) : placeholder ? (
          <span style={{ color: "#a3a8b1" }}>{placeholder}</span>
        ) : null}
        <span
          style={{
            width: 3,
            height: 32,
            marginLeft: value ? 2 : 0,
            background: C.red,
            opacity: caret ? 1 : 0,
            borderRadius: 2,
          }}
        />
        <span style={{ marginLeft: "auto" }}>{trailing}</span>
      </Abs>
    </>
  );
}

/** Cobertura escura + painel central de modal. `p` é o progresso de entrada (0..1). */
export function ModalShell({
  p,
  x,
  y,
  w,
  h,
  title,
  children,
}: {
  p: number;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  children: ReactNode;
}) {
  if (p <= 0.001) return null;
  return (
    <>
      <Abs x={0} y={0} w={WIN.w} h={WIN.h} style={{ background: `rgba(8,9,12,${0.52 * p})` }} />
      <Abs
        x={x}
        y={y}
        w={w}
        h={h}
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`,
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 50px 100px -30px rgba(0,0,0,0.6)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "34px 40px 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {title}
        </div>
        {children}
      </Abs>
    </>
  );
}

/** Fade de entrada/saída do conteúdo de uma página (a sidebar fica sólida entre cenas). */
export function PageFade({
  frame,
  duration,
  fadeIn = true,
  fadeOut = true,
  children,
}: {
  frame: number;
  duration: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  children: ReactNode;
}) {
  const inP = fadeIn ? Math.min(1, Math.max(0, frame / 8)) : 1;
  const outP = fadeOut ? Math.min(1, Math.max(0, (duration - frame) / 6)) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(inP, outP) }}>{children}</div>
  );
}

