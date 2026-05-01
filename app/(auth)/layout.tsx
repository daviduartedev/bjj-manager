import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { ProductFooter } from "@/components/layout/product-footer";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-bjj-black text-white">
      <header className="border-b border-white/10">
        <div className="container flex h-14 items-center justify-between">
          <Link
            href="/"
            className="outline-none ring-offset-bjj-black focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-bjj-red focus-visible:ring-offset-2"
          >
            <LogoMark height={26} className="py-1.5 pl-2 pr-3" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">{children}</div>
      <ProductFooter surface="dark" className="shrink-0 border-t border-white/10 py-4" />
    </div>
  );
}
