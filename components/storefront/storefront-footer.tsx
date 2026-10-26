import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--store-border)] bg-[var(--store-footer)] text-[var(--store-footer-text)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-2 py-3">
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
