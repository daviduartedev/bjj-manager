import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-zinc-200/80 bg-card/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="outline-none ring-offset-card focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogoMark height={26} className="py-1.5 pl-2 pr-3" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}
