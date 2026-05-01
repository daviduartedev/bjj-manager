import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-bjj-black text-white">
      <header className="border-b border-white/10">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-white/90">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-bjj-red" />
            <span className="font-display text-base font-semibold tracking-tight">
              BJJ Manager
            </span>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">{children}</div>
    </div>
  );
}
