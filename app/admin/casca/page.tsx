import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOut } from "@/app/(dashboard)/actions";
import { LogoMark } from "@/components/brand/logo-mark";
import { PlatformAdminDashboard } from "@/components/platform-admin/dashboard";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformAdminService } from "@/lib/platform-admin/server";
import { isPlatformOwner } from "@/lib/platform-admin/service";

export const metadata: Metadata = { title: "Administração Casca" };

export default async function PlatformAdminPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isPlatformOwner(user.id, process.env.CASCA_PLATFORM_ADMIN_USER_ID)) notFound();
  const params = await searchParams;
  const page = Number(params.pagina ?? 1);
  const service = getPlatformAdminService();
  const result = service ? await service.overview(user.id, { page }) : null;

  return <div data-app-palette className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"><Link href="/admin/casca" aria-label="Casca — administração"><LogoMark height={28} /></Link><form action={signOut}><button className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium">Sair</button></form></div></header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><p className="text-sm font-semibold text-primary">Plataforma Casca</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Administração</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Academias, assinaturas e condições comerciais. Este painel apresenta contagens e dados comerciais, sem fichas de alunos.</p>
      {!result?.ok ? <div role="alert" className="mt-8 rounded-2xl border border-border bg-card p-6"><p>{result && !result.ok ? result.error : "Administração indisponível. Tente novamente mais tarde."}</p><Link href="/admin/casca" className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline">Tentar novamente</Link></div> : <PlatformAdminDashboard overview={result.data} page={page} />}
    </main>
  </div>;
}
