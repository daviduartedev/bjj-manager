"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Menu, UserRound } from "lucide-react";

import { signOut } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MAIN_NAV_ITEMS } from "@/components/layout/dashboard-nav-config";
import { ShellNavLink } from "@/components/layout/shell-nav-link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  academyName: string | null;
  userLabel: string;
  children: React.ReactNode;
};

function ShellChromeSkeleton() {
  return (
    <div
      className="pointer-events-none animate-pulse border-b border-[hsl(var(--shell-chrome-border))] bg-[hsl(var(--shell-chrome))]"
      aria-hidden
    >
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Skeleton className="size-11 shrink-0 rounded-md bg-white/10 lg:hidden" />
        <Skeleton className="h-5 flex-1 max-w-[200px] rounded bg-white/15" />
        <Skeleton className="size-11 shrink-0 rounded-md bg-white/10" />
      </div>
    </div>
  );
}

function SidebarSkeletonNav() {
  return (
    <>
      {MAIN_NAV_ITEMS.map((item) => (
        <Skeleton key={item.href} className="h-11 w-full rounded-md bg-white/10" aria-hidden />
      ))}
    </>
  );
}

function BottomNavSkeleton() {
  return (
    <div
      className="flex h-16 items-stretch justify-around gap-1 border-t border-[hsl(var(--shell-chrome-border))] bg-[hsl(var(--shell-chrome))] px-2 pt-1 lg:hidden"
      aria-hidden
    >
      {MAIN_NAV_ITEMS.map((item) => (
        <div key={item.href} className="flex flex-1 flex-col items-center justify-center gap-1 py-1">
          <Skeleton className="size-5 rounded bg-white/15" />
          <Skeleton className="h-2.5 w-12 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function DashboardShell({ academyName, userLabel, children }: DashboardShellProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSignOut, startSignOut] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  const brandMark = (
    <span
      className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--shell-active)/0.18)] shadow-[inset_0_1px_0_hsl(var(--shell-chrome-foreground)/0.12)] ring-1 ring-[hsl(var(--shell-active)/0.35)]"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-[hsl(var(--shell-active)/0.45)] to-transparent opacity-90" />
      <span className="relative size-2.5 rounded-sm bg-[hsl(var(--shell-active))] shadow-[0_0_12px_hsl(var(--shell-active)/0.65)]" />
    </span>
  );

  const brandBlock = (
    <Link
      href={ROUTES.painel}
      className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md text-[hsl(var(--shell-chrome-foreground))] ring-offset-[hsl(var(--shell-chrome))] transition-colors hover:text-[hsl(var(--shell-chrome-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--shell-active))] focus-visible:ring-offset-2 lg:flex-none"
    >
      {brandMark}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-sm font-semibold tracking-tight">BJJ Manager</span>
        {academyName ? (
          <span className="truncate text-xs font-normal opacity-90">{academyName}</span>
        ) : (
          <span className="truncate text-xs font-normal opacity-70">Área operacional</span>
        )}
      </span>
    </Link>
  );

  const sidebarBrand = (
    <Link
      href={ROUTES.painel}
      className="group mb-6 flex flex-col gap-2 rounded-xl border border-[hsl(var(--shell-chrome-border))] bg-[hsl(var(--shell-nav-hover-bg)/0.35)] p-3 shadow-sm ring-1 ring-[hsl(var(--shell-chrome-foreground)/0.06)] transition-colors hover:border-[hsl(var(--shell-active)/0.35)] hover:bg-[hsl(var(--shell-nav-hover-bg)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--shell-active))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--shell-chrome))]"
    >
      <div className="flex items-center gap-3">
        {brandMark}
        <span className="font-display text-sm font-semibold tracking-tight text-[hsl(var(--shell-chrome-foreground))]">
          BJJ Manager
        </span>
      </div>
      {academyName ? (
        <p className="line-clamp-2 pl-[3.25rem] text-xs leading-snug text-[hsl(var(--shell-chrome-foreground))/0.82]">
          {academyName}
        </p>
      ) : (
        <p className="pl-[3.25rem] text-xs text-[hsl(var(--shell-chrome-foreground))/0.55]">Área operacional</p>
      )}
    </Link>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-[hsl(var(--shell-chrome-foreground))] hover:bg-white/10 focus-visible:ring-[hsl(var(--shell-active))] focus-visible:ring-offset-[hsl(var(--shell-chrome))]"
          aria-label="Menu do utilizador"
        >
          <UserRound className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">{userLabel}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.perfil}>Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pendingSignOut}
          onSelect={(e) => {
            e.preventDefault();
            startSignOut(() => {
              void signOut();
            });
          }}
        >
          {pendingSignOut ? "A sair…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col border-r border-[hsl(var(--shell-chrome-border))] bg-gradient-to-b from-[hsl(var(--shell-chrome-top))] via-[hsl(var(--shell-chrome))] to-[hsl(var(--shell-chrome-bottom))] text-[hsl(var(--shell-chrome-foreground))] shadow-[4px_0_24px_-8px_hsl(0_0%_0%/0.35)] lg:flex",
        )}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[hsl(var(--shell-edge-glow)/0.55)] via-[hsl(var(--shell-active)/0.28)] to-[hsl(var(--status-info)/0.2)]"
          aria-hidden
        />
        <div className="relative flex flex-1 flex-col p-3 pt-7">
          {!mounted ? (
            <div className="flex flex-col gap-1" aria-hidden>
              <SidebarSkeletonNav />
            </div>
          ) : (
            <>
              {sidebarBrand}
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--shell-chrome-foreground))/0.38]">
                Menu
              </p>
              <nav className="flex flex-col gap-1" aria-label="Principal">
                {MAIN_NAV_ITEMS.map((item) => (
                  <ShellNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
                ))}
              </nav>
            </>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[15.5rem]">
        <header
          className={cn(
            "sticky top-0 z-30 shrink-0 border-b border-[hsl(var(--shell-chrome-border))] bg-gradient-to-r from-[hsl(var(--shell-chrome-top))] via-[hsl(var(--shell-chrome))] to-[hsl(var(--shell-chrome-bottom))] text-[hsl(var(--shell-chrome-foreground))] shadow-[0_1px_0_hsl(var(--shell-chrome-border))]",
          )}
        >
          {!mounted ? (
            <ShellChromeSkeleton />
          ) : (
            <div className="flex h-14 items-center gap-2 px-4 lg:px-6">
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-[hsl(var(--shell-chrome-foreground))] hover:bg-white/10 lg:hidden"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(100%,20rem)] border-[hsl(var(--shell-chrome-border))] bg-gradient-to-b from-[hsl(var(--shell-chrome-top))] via-[hsl(var(--shell-chrome))] to-[hsl(var(--shell-chrome-bottom))] p-0 text-[hsl(var(--shell-chrome-foreground))]"
                >
                  <SheetHeader className="border-b border-[hsl(var(--shell-chrome-border))] bg-[hsl(var(--shell-nav-hover-bg)/0.25)] px-6 py-4 text-left">
                    <SheetTitle className="font-display text-[hsl(var(--shell-chrome-foreground))]">
                      Navegação
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{sidebarBrand}</div>
                  <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Principal">
                    {MAIN_NAV_ITEMS.map((item) => (
                      <ShellNavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        onNavigate={closeDrawer}
                      />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              {brandBlock}

              <div className="ml-auto flex shrink-0 items-center gap-2">{userMenu}</div>
            </div>
          )}
        </header>

        <main className="dashboard-main-surface container flex-1 py-6 pb-24 lg:pb-8">{children}</main>

        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          {!mounted ? (
            <BottomNavSkeleton />
          ) : (
            <nav
              className="flex h-16 items-stretch justify-around gap-0 border-t border-[hsl(var(--shell-chrome-border))] bg-gradient-to-t from-[hsl(var(--shell-chrome-bottom))] via-[hsl(var(--shell-chrome))] to-[hsl(var(--shell-chrome-top))] px-1 pb-[env(safe-area-inset-bottom)] pt-1 text-[hsl(var(--shell-chrome-foreground))] shadow-[0_-4px_24px_-10px_hsl(0_0%_0%/0.28)] lg:hidden"
              aria-label="Navegação inferior"
            >
              {MAIN_NAV_ITEMS.map((item) => (
                <ShellNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  variant="bottom"
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
