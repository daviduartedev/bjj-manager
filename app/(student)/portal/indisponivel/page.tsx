import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal indisponível",
};

export default function PortalIndisponivelPage() {
  return (
    <main className="container mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Portal do aluno
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Indisponível no momento</h1>
      <p className="mt-3 text-muted-foreground">
        Esta área ainda não está activa para a sua academia. Contacte a recepção se precisar de
        ajuda.
      </p>
    </main>
  );
}
