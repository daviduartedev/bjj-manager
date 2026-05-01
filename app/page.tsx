import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/branding";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Faixa superior: identidade em preto + logo */}
      <section className="relative overflow-hidden bg-bjj-black text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(0 0% 100% / 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(0 0% 100% / 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative border-b border-white/10">
          <header className="container flex h-16 items-center justify-between sm:h-[4.25rem]">
            <Link href="/" className="flex items-center gap-3 outline-none ring-offset-bjj-black focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-bjj-red focus-visible:ring-offset-2">
              <LogoMark height={30} priority className="py-2 pl-2 pr-3" />
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/[0.06] text-white backdrop-blur-sm hover:bg-white/12 hover:text-white"
            >
              <Link href="/login">Entrar</Link>
            </Button>
          </header>
        </div>

        <div className="relative container py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="max-w-xl lg:max-w-none">
              <span className="inline-flex rounded-md border border-white/25 bg-white/[0.06] px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/90">
                Operação da academia
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                Gestão de jiu-jitsu{" "}
                <span className="text-bjj-red">clara</span>, rápida e no mesmo lugar.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/72 sm:text-crm-lg sm:leading-relaxed">
                {APP_NAME} reúne alunos, graduações e mensalidades num painel pensado para o dia a dia do professor —
                menos ruído, mais decisão.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="min-h-12 w-full border-0 bg-bjj-red px-8 text-base font-semibold shadow-[0_0_0_1px_hsl(357_73%_38%/0.35)] hover:bg-bjj-red/90 sm:w-auto"
                >
                  <Link href="/login">Entrar na plataforma</Link>
                </Button>
              </div>
              <p className="mt-6 flex items-start gap-2 text-sm text-white/45">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bjj-green" aria-hidden />
                <span>
                  Dados isolados por academia (multi-tenant). Acesso apenas com sessão segura.
                </span>
              </p>
            </div>

            {/* Painel com fundo preto sólido — destaque da logo */}
            <div className="relative mx-auto flex w-full max-w-lg flex-col items-center justify-center lg:mx-0 lg:max-w-none">
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/12 bg-bjj-black shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(357_73%_43%/0.22),transparent_55%)]" aria-hidden />
                <div className="relative flex min-h-[240px] flex-col items-center justify-center px-8 py-14 sm:min-h-[280px] sm:py-16 lg:min-h-[320px]">
                  <div className="rounded-xl bg-black px-8 py-10 ring-1 ring-white/10 sm:px-12 sm:py-12">
                    <Image
                      src="/Logo.png"
                      alt=""
                      width={560}
                      height={200}
                      className="h-auto max-h-36 w-full max-w-[min(100%,18rem)] object-contain sm:max-h-44"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-bjj-off">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <span className="font-medium text-foreground/80">{APP_NAME}</span>
          <span>Plataforma para professores de jiu-jitsu · MVP em evolução</span>
        </div>
      </footer>
    </main>
  );
}
