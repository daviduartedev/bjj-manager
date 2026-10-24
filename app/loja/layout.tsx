import { StorefrontFooter } from "@/components/storefront/storefront-footer";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {children}
      <StorefrontFooter />
    </div>
  );
}
