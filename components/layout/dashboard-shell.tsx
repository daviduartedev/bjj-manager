"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Menu, MoreHorizontal, Sparkles, UserRound } from "lucide-react";

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
import { LogoMark } from "@/components/brand/logo-mark";
import { GuidedTour, useGuidedTourAutoStart } from "@/components/onboarding/guided-tour";
import {
  getBottomNavMore,
  getBottomNavPrimary,
  isBottomNavMoreActive,
  MAIN_NAV_ITEMS,
} from "@/components/layout/dashboard-nav-config";
import { ShellNavLink } from "@/components/layout/shell-nav-link";
import { isShellNavActive } from "@/lib/layout/shell-nav";
import { APP_NAME } from "@/lib/branding";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  academyName: string | null;
  userLabel: string;
  children: React.ReactNode;
};

const BOTTOM_NAV_PRIMARY = getBottomNavPrimary();
const BOTTOM_NAV_MORE = getBottomNavMore();

function ShellChromeSkeleton() {
  return (
    <div
      className="pointer-events-none animate-pulse"
      aria-hidden
    >
      <div className="flex h-12 items-center justify-between px-2">
        <Skeleton className="size-11 shrink-0 rounded-md bg-muted" />
        <div className="flex gap-1">
          <Skeleton className="size-11 shrink-0 rounded-md bg-muted" />
          <Skeleton className="size-11 shrink-0 rounded-md bg-muted" />
        </div>
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
      className="dashboard-ink-chrome flex h-16 items-stretch justify-around gap-1 border-t px-2 pt-1 lg:hidden"
      aria-hidden
    >
      {[...BOTTOM_NAV_PRIMARY, { href: "__more__" }].map((item) => (
        <div key={item.href} className="flex flex-1 flex-col items-center justify-center gap-1 py-1">
          <Skeleton className="size-5 rounded bg-white/15" />
          <Skeleton className="h-2.5 w-12 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function BottomNavMoreMenu() {
  const pathname = usePathname();
  const moreActive = isBottomNavMoreActive(pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[10px] font-medium leading-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))] sm:text-xs",
            moreActive
              ? "bg-[hsl(var(--shell-nav-active-bg))] font-semibold text-primary shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"
              : "text-secondary-foreground/70 hover:text-secondary-foreground",
          )}
          aria-label="Mais destinos"
          aria-current={moreActive ? "true" : undefined}
        >
          <MoreHorizontal
            className={cn("size-5 shrink-0", moreActive ? "text-primary" : "text-secondary-foreground/45")}
            aria-hidden
          />
          <span>Mais</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="mb-2 min-w-52">
        {BOTTOM_NAV_MORE.map((item) => {
          const Icon = item.icon;
          const active = isShellNavActive(pathname, item.href);
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                data-tour={item.dataTour}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2",
                  active && "font-semibold text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardShell({ academyName, userLabel, children }: DashboardShellProps) {
  const pathname = usePathname();
  const fullBleedHome = pathname === ROUTES.painel;
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSignOut, startSignOut] = useTransition();
  const [tourRun, setTourRun] = useState(false);
  const [tourSessionKey, setTourSessionKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGuidedTourAutoStart(setTourRun);

  const closeDrawer = () => setDrawerOpen(false);

  const brandMarkSidebar = (
    <LogoMark
      height={22}
      className="size-9 shrink-0 rounded-md border border-white/15 bg-white/[0.06] p-1"
      imgClassName="max-h-[22px] max-w-[4.5rem]"
    />
  );

  const sidebarBrand = (
    <Link
      href={ROUTES.painel}
      className="mb-6 flex items-start gap-3 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))]"
    >
      {brandMarkSidebar}
      <span className="min-w-0 pt-0.5">
        <span className="block font-display text-sm font-semibold tracking-tight text-secondary-foreground">
          {APP_NAME}
        </span>
        {academyName ? (
          <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-secondary-foreground/55">
            {academyName}
          </span>
        ) : (
          <span className="mt-0.5 block text-xs text-secondary-foreground/45">Área operacional</span>
        )}
      </span>
    </Link>
  );

  const userMenu = (triggerClassName: string) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0 focus-visible:ring-primary",
            triggerClassName,
          )}
          aria-label="Menu do utilizador"
          data-tour="shell-user-menu"
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
      <GuidedTour run={tourRun} onRunChange={setTourRun} sessionKey={tourSessionKey} />
      <aside
        data-tour="shell-sidebar"
        className="dashboard-ink-chrome fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col border-r shadow-[2px_0_28px_-16px_hsl(var(--secondary)/0.55)] lg:flex"
      >
        <div className="relative flex flex-1 flex-col px-3 pb-4 pt-6">
          {!mounted ? (
            <div className="flex flex-col gap-1" aria-hidden>
              <SidebarSkeletonNav />
            </div>
          ) : (
            <>
              {sidebarBrand}
              <p className="type-meta-label mb-2 px-3 text-secondary-foreground/40">Operação</p>
              <nav className="flex flex-col gap-0.5" aria-label="Principal">
                {MAIN_NAV_ITEMS.map((item) => (
                  <ShellNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    surface="ink"
                    dataTour={item.dataTour}
                  />
                ))}
              </nav>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 gap-1.5 px-2 text-secondary-foreground hover:bg-white/10 hover:text-secondary-foreground"
                  data-tour="shell-wizard-trigger"
                  onClick={() => {
                    setTourSessionKey((k) => k + 1);
                    setTourRun(true);
                  }}
                >
                  <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
                  Wizard
                </Button>
                {userMenu(
                  "text-secondary-foreground hover:bg-white/10 hover:text-secondary-foreground focus-visible:ring-offset-[hsl(var(--secondary))]",
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[15.5rem]">
        <header className="sticky top-0 z-30 shrink-0 bg-[#f3f4f6]/90 backdrop-blur-md lg:hidden dark:bg-zinc-950/90">
          {!mounted ? (
            <ShellChromeSkeleton />
          ) : (
            <div className="flex h-12 items-center justify-between px-2">
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-foreground hover:bg-muted"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="dashboard-ink-chrome w-[min(100%,20rem)] p-0"
                >
                  <SheetHeader className="border-b border-white/10 px-6 py-4 text-left">
                    <SheetTitle className="font-display text-secondary-foreground">Navegação</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pt-5">{sidebarBrand}</div>
                  <nav className="flex flex-col gap-0.5 px-4 pb-6" aria-label="Principal">
                    {MAIN_NAV_ITEMS.map((item) => (
                      <ShellNavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        surface="ink"
                        dataTour={item.dataTour}
                        onNavigate={closeDrawer}
                      />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir tour guiado"
                  data-tour="shell-wizard-trigger"
                  onClick={() => {
                    setTourSessionKey((k) => k + 1);
                    setTourRun(true);
                  }}
                >
                  <Sparkles className="size-5 text-primary" aria-hidden />
                </Button>
                {userMenu("text-foreground hover:bg-muted focus-visible:ring-offset-background")}
              </div>
            </div>
          )}
        </header>

        <main
          className={cn(
            "dashboard-main-surface flex flex-1 flex-col",
            fullBleedHome
              ? "w-full max-w-none px-0 pb-24 pt-0 lg:pb-0"
              : "container py-6 pb-24 lg:py-8 lg:pb-10",
          )}
        >
          <div className="flex-1">{children}</div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          {!mounted ? (
            <BottomNavSkeleton />
          ) : (
            <nav
              data-tour="shell-bottom-nav"
              className="dashboard-ink-chrome flex h-16 items-stretch justify-around gap-0 border-t px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-10px_28px_-18px_hsl(var(--secondary)/0.65)] backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(var(--secondary)/0.94)] lg:hidden"
              aria-label="Navegação inferior"
            >
              {BOTTOM_NAV_PRIMARY.map((item) => (
                <ShellNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  variant="bottom"
                  surface="ink"
                  dataTour={item.dataTour}
                />
              ))}
              <BottomNavMoreMenu />
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
