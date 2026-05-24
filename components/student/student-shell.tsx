"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Menu, UserRound } from "lucide-react";

import { signOut } from "@/app/(dashboard)/actions";
import { LogoMark } from "@/components/brand/logo-mark";
import { ProductFooter } from "@/components/layout/product-footer";
import { ShellNavLink } from "@/components/layout/shell-nav-link";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
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
import { APP_NAME } from "@/lib/branding";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type StudentShellProps = {
  academyName: string | null;
  userLabel: string;
  children: React.ReactNode;
};

function ShellChromeSkeleton() {
  return (
    <div
      className="pointer-events-none animate-pulse border-b border-border bg-background"
      aria-hidden
    >
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Skeleton className="size-11 shrink-0 rounded-md bg-muted lg:hidden" />
        <Skeleton className="h-5 max-w-[200px] flex-1 rounded bg-muted" />
        <Skeleton className="size-11 shrink-0 rounded-md bg-muted" />
      </div>
    </div>
  );
}

function SidebarSkeletonNav() {
  return (
    <>
      {STUDENT_NAV_ITEMS.map((item) => (
        <Skeleton key={item.href} className="h-11 w-full rounded-md bg-muted" aria-hidden />
      ))}
    </>
  );
}

function BottomNavSkeleton() {
  return (
    <div
      className="flex h-16 items-stretch justify-around gap-1 border-t border-border bg-background px-2 pt-1 lg:hidden"
      aria-hidden
    >
      {STUDENT_NAV_ITEMS.map((item) => (
        <div key={item.href} className="flex flex-1 flex-col items-center justify-center gap-1 py-1">
          <Skeleton className="size-5 rounded bg-muted" />
          <Skeleton className="h-2.5 w-12 rounded bg-muted/80" />
        </div>
      ))}
    </div>
  );
}

export function StudentShell({ academyName, userLabel, children }: StudentShellProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSignOut, startSignOut] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  const brandMarkSidebar = (
    <LogoMark
      height={22}
      className="size-9 shrink-0 rounded-lg border border-white/15 bg-white/[0.06] p-1 shadow-sm"
      imgClassName="max-h-[22px] max-w-[4.5rem]"
    />
  );

  const brandMark = (
    <LogoMark
      height={22}
      className="size-9 shrink-0 rounded-lg border border-border/80 bg-card p-1 shadow-sm"
      imgClassName="max-h-[22px] max-w-[4.5rem]"
    />
  );

  const brandBlock = (
    <Link
      href={ROUTES.portal}
      className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md text-foreground ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:flex-none"
    >
      {brandMark}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-sm font-semibold tracking-tight">{APP_NAME}</span>
        {academyName ? (
          <span className="truncate text-xs font-normal opacity-90">{academyName}</span>
        ) : (
          <span className="truncate text-xs font-normal opacity-70">Portal do aluno</span>
        )}
      </span>
    </Link>
  );

  const sidebarBrand = (
    <Link
      href={ROUTES.portal}
      className="group mb-8 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 shadow-sm ring-1 ring-white/[0.06] transition-colors hover:border-white/18 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0_0%_2%)]"
    >
      <div className="flex items-center gap-3">
        {brandMarkSidebar}
        <span className="font-display text-sm font-semibold tracking-tight text-zinc-100">
          {APP_NAME}
        </span>
      </div>
      {academyName ? (
        <p className="line-clamp-2 pl-[3.25rem] text-xs leading-snug text-zinc-400">{academyName}</p>
      ) : (
        <p className="pl-[3.25rem] text-xs text-zinc-500">Portal do aluno</p>
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
          className="shrink-0 text-foreground hover:bg-muted focus-visible:ring-primary focus-visible:ring-offset-background"
          aria-label="Menu do utilizador"
        >
          <UserRound className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">{userLabel}</div>
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
          "fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col border-r border-zinc-800/90 bg-[hsl(0_0%_2%)] text-zinc-100 shadow-[2px_0_24px_-12px_hsl(0_0%_0%/0.45)] lg:flex",
        )}
      >
        <div className="relative flex flex-1 flex-col p-3 pt-7">
          {!mounted ? (
            <div className="flex flex-col gap-1" aria-hidden>
              <SidebarSkeletonNav />
            </div>
          ) : (
            <>
              {sidebarBrand}
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Menu
              </p>
              <nav className="flex flex-col gap-1" aria-label="Principal">
                {STUDENT_NAV_ITEMS.map((item) => (
                  <ShellNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    surface="ink"
                  />
                ))}
              </nav>
            </>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[15.5rem]">
        <header className="dashboard-top-bar sticky top-0 z-30 shrink-0 text-foreground shadow-[0_1px_2px_-1px_hsl(0_0%_0%/0.06)]">
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
                    className="shrink-0 text-foreground hover:bg-muted lg:hidden"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(100%,20rem)] border-zinc-800 bg-[hsl(0_0%_2%)] p-0 text-zinc-100"
                >
                  <SheetHeader className="border-b border-white/10 bg-white/[0.03] px-6 py-4 text-left">
                    <SheetTitle className="font-display text-zinc-100">Navegação</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{sidebarBrand}</div>
                  <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Principal">
                    {STUDENT_NAV_ITEMS.map((item) => (
                      <ShellNavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        surface="ink"
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

        <main className="dashboard-main-surface container flex flex-1 flex-col py-5 pb-24 lg:py-6 lg:pb-8">
          <div className="flex-1">{children}</div>
          <ProductFooter className="mt-10 shrink-0 border-t border-border/50 pt-6" />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          {!mounted ? (
            <BottomNavSkeleton />
          ) : (
            <nav
              className="flex h-16 items-stretch justify-around gap-0 border-t border-zinc-800 bg-[hsl(0_0%_3%)] px-1 pb-[env(safe-area-inset-bottom)] pt-1 text-zinc-100 shadow-[0_-8px_32px_-16px_hsl(0_0%_0%/0.55)] backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(0_0%_3%/0.92)] lg:hidden"
              aria-label="Navegação inferior"
            >
              {STUDENT_NAV_ITEMS.map((item) => (
                <ShellNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  variant="bottom"
                  surface="ink"
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
