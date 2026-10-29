import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { cn } from "@/lib/utils";

/** Par de CTAs: preenchido e contorno, mesma altura e o mesmo raio. */
const CTA_BUTTON =
  "inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-6 text-[13px] font-bold uppercase tracking-[0.06em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/** Botão principal "Criar academia". O hero, o cabeçalho e o CTA final reutilizam via className. */
export function LpSignupLink({ className }: { className?: string }) {
  return (
    <Link
      href="/register"
      className={cn(
        CTA_BUTTON,
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-offset-card",
        className,
      )}
    >
      Criar academia
    </Link>
  );
}

/** Botão secundário, com contorno. `onDark` vale para faixas escuras. */
export function LpOutlineLink({
  href,
  children,
  onDark = false,
  className,
}: {
  href: string;
  children: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        CTA_BUTTON,
        "border-2",
        onDark
          ? "border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 focus-visible:ring-white focus-visible:ring-offset-primary"
          : "border-foreground bg-transparent text-foreground hover:bg-foreground/[0.04] focus-visible:ring-ring focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </Link>
  );
}

const PILL_TONE = {
  blue: {
    button:
      "bg-brand-blue text-white shadow-[0_12px_28px_-12px_hsl(var(--brand-blue)/0.7)] hover:bg-brand-blue/90 focus-visible:ring-brand-blue focus-visible:ring-offset-white",
    note: "text-muted-foreground",
    strong: "text-foreground",
  },
  yellow: {
    button:
      "bg-brand-yellow text-neutral-950 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.45)] hover:bg-brand-yellow/90 focus-visible:ring-white focus-visible:ring-offset-brand-blue",
    note: "text-white/70",
    strong: "text-white",
  },
  white: {
    button:
      "bg-white text-neutral-950 shadow-[0_12px_28px_-12px_rgba(255,255,255,0.35)] hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-neutral-950",
    note: "text-white/60",
    strong: "text-white",
  },
  green: {
    button:
      "bg-brand-green text-white shadow-[0_12px_28px_-12px_hsl(var(--brand-green)/0.7)] hover:bg-brand-green/90 focus-visible:ring-brand-green focus-visible:ring-offset-white",
    note: "text-muted-foreground",
    strong: "text-foreground",
  },
} as const;

/** CTA em pílula ao longo da página, com uma linha curta de reforço abaixo. */
export function LpPillCta({
  children,
  tone = "blue",
  align = "center",
  strong,
  note,
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof PILL_TONE;
  align?: "center" | "start";
  strong?: string;
  note?: string;
  className?: string;
}) {
  const t = PILL_TONE[tone];
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Link
        href="/register"
        className={cn(
          "group inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-8 text-base font-semibold tracking-[-0.01em] outline-none transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-0",
          t.button,
        )}
      >
        {children}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.5}
          aria-hidden
        />
      </Link>
      {strong || note ? (
        <p className={cn("text-sm", t.note)}>
          {strong ? <span className={cn("font-semibold", t.strong)}>{strong}</span> : null}
          {strong && note ? " " : null}
          {note}
        </p>
      ) : null}
    </div>
  );
}

const CTA_NOTES = [
  "Adulto e kids no mesmo cadastro",
  "Você confirma o pagamento",
  "Dados só da sua academia",
] as const;

/** Linha de confirmação abaixo do par de botões. */
export function LpCtaNotes({ onDark = false }: { onDark?: boolean }) {
  return (
    <ul
      className={cn(
        "mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm",
        onDark ? "justify-center text-primary-foreground/80" : "text-muted-foreground",
      )}
    >
      {CTA_NOTES.map((note) => (
        <li key={note} className="inline-flex items-center gap-1.5">
          <Check
            className={cn("h-4 w-4 shrink-0", onDark ? "text-primary-foreground" : "text-brand-green")}
            strokeWidth={3}
            aria-hidden
          />
          {note}
        </li>
      ))}
    </ul>
  );
}

const NAV = [
  { href: "/#sistema", label: "Sistema" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#para-quem", label: "Para quem" },
  { href: "/#planos", label: "Planos" },
  { href: "/#faq", label: "FAQ" },
] as const;

// ---------------------------------------------------------------------------
// LpHeader — barra inteira: marca, links e ação
// ---------------------------------------------------------------------------

const HEADER_FOCUS_RING =
  "outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function LpHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={cn(
        "z-50 border-b border-border bg-white text-foreground",
        solid ? "relative" : "fixed inset-x-0 top-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-8 sm:px-10 lg:px-16">
        <CascaNavLogo tone="light-bg" imgClassName="h-9 sm:h-10" />
        <nav
          className="hidden flex-1 items-center justify-center gap-8 lg:flex"
          aria-label="Secções da página"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground",
                HEADER_FOCUS_RING,
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className={cn(
              "whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground",
              HEADER_FOCUS_RING,
            )}
          >
            Entrar
          </Link>
          <LpSignupLink className="h-10 px-3 text-[11px] sm:px-4" />
        </div>
      </div>
    </header>
  );
}
