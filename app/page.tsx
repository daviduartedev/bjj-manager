import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header preto da identidade */}
      <header className="bg-bjj-black text-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-bjj-red" />
            <span className="font-display text-lg font-semibold tracking-tight">
              BJJ Manager
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">
            MVP em construcao
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Gerencie sua academia de{" "}
            <span className="text-bjj-red">jiu-jitsu</span> sem planilha.
          </h1>
          <p className="type-lead mt-4 sm:text-crm-lg sm:leading-relaxed">
            Alunos, graduacoes e mensalidades em um so lugar. Feito por
            professor, para professor.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full min-h-12 sm:w-auto sm:min-h-11">
              <Link href="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>

        {/* Cards demonstrando paleta de status */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Mensalidade</p>
            <p className="mt-1 text-lg font-semibold">Status financeiro</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="paid">Pago</Badge>
              <Badge variant="pending">Pendente</Badge>
              <Badge variant="overdue">Atrasado</Badge>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Graduacao</p>
            <p className="mt-1 text-lg font-semibold">Faixa e grau</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="info">Adulto</Badge>
              <Badge variant="outline">Kids</Badge>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Identidade</p>
            <p className="mt-1 text-lg font-semibold">Paleta da marca</p>
            <div className="mt-3 flex gap-2">
              <span className="h-6 w-6 rounded-md bg-bjj-black" title="#050505" />
              <span className="h-6 w-6 rounded-md bg-bjj-red" title="#BF1E27" />
              <span className="h-6 w-6 rounded-md bg-bjj-green" title="#1D8B32" />
              <span className="h-6 w-6 rounded-md bg-bjj-blue" title="#1E5AA8" />
              <span className="h-6 w-6 rounded-md bg-bjj-yellow" title="#F4C542" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-bjj-off">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          BJJ Manager . Cycle 00 - Project Bootstrap
        </div>
      </footer>
    </main>
  );
}
