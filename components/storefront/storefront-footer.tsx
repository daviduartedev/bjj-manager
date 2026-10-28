import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export function StorefrontFooter() {
  return (
    <footer className="mt-auto bg-black text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-3 py-3">
        <Link href="/" aria-label="Casca" className="inline-flex">
          <LogoMark height={18} />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white">
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
