import Link from "next/link";

import { cn } from "@/lib/utils";

const UTOPIA_URL = "https://utopia.app.br/";

type ProductFooterProps = {
  /** Área clara (dashboard) ou escura (login / marketing). */
  surface?: "light" | "dark";
  className?: string;
};

export function ProductFooter({ surface = "light", className }: ProductFooterProps) {
  return (
    <footer
      className={className}
      role="contentinfo"
      aria-label="Créditos do produto"
    >
      <p
        className={cn(
          "text-center text-crm-xs leading-relaxed",
          surface === "dark" ? "text-white/55" : "text-muted-foreground",
        )}
      >
        O Casca é um produto da{" "}
        <Link
          href={UTOPIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-medium underline-offset-4",
            surface === "dark"
              ? "text-white/80 hover:text-white hover:underline"
              : "text-foreground hover:text-primary hover:underline",
          )}
        >
          utopia.app.br
        </Link>
        .
      </p>
    </footer>
  );
}
