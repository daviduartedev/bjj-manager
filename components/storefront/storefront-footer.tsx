import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Casca" className="inline-flex">
          <LogoMark height={18} />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/termos" className="underline-offset-4 hover:underline">
            Termos
          </Link>
          <Link href="/privacidade" className="underline-offset-4 hover:underline">
            Privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
