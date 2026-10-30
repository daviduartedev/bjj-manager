"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { LP_PRIMARY_CTA } from "@/components/marketing/lp-cta-styles";
import { LP_NAVIGATION } from "@/components/marketing/lp-navigation";
import { cn } from "@/lib/utils";

const FOCUS = "outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-4";

export function LpHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white text-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-10 lg:px-16">
        <CascaNavLogo tone="light-bg" imgClassName="h-8 sm:h-9" />
        <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex" aria-label="Seções da página">
          {LP_NAVIGATION.map((item) => (
            <Link key={item.href} href={item.href} className={`whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue ${FOCUS}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link href="/login" className={`hidden min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-brand-blue sm:inline-flex ${FOCUS}`}>Entrar</Link>
          <Link href="/register" className={cn(LP_PRIMARY_CTA, "min-h-11 px-4 text-xs")}>
            <span className="sm:hidden">Começar</span><span className="hidden sm:inline">Organizar minha academia</span>
          </Link>
          <button ref={menuButtonRef} type="button" aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={isMenuOpen} aria-controls="landing-mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className={`inline-flex size-11 items-center justify-center lg:hidden ${FOCUS}`}>
            {isMenuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>
      <nav id="landing-mobile-menu" aria-label="Menu da página" hidden={!isMenuOpen} className="absolute inset-x-0 top-16 border-b border-border bg-white px-5 pb-5 shadow-sm lg:hidden">
        {[...LP_NAVIGATION, { href: "/login", label: "Entrar" }].map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={`flex min-h-12 items-center text-sm font-medium ${FOCUS}`}>{item.label}</Link>
        ))}
      </nav>
    </header>
  );
}
