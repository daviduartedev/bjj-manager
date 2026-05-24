import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso bloqueado",
};

export default function PortalBloqueadoPage() {
  return (
    <main className="container mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Acesso bloqueado</h1>
      <p className="mt-3 text-muted-foreground">
        O seu cadastro está arquivado ou removido. Contacte a recepção da academia para mais
        informações.
      </p>
    </main>
  );
}
