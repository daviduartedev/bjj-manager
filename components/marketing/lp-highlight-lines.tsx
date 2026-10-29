import { Geologica } from "next/font/google";

import { LpMark } from "@/components/marketing/lp-primitives";
import { cn } from "@/lib/utils";

const display = Geologica({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const MARK_ON_DARK =
  "bg-[linear-gradient(transparent_58%,hsl(var(--brand-yellow))_58%,hsl(var(--brand-yellow))_92%,transparent_92%)] text-neutral-950";

export type LpHighlightRow = {
  lead: string;
  mark: string;
  tone?: string;
};

/** Três linhas de display com palavra colorida e marca-texto amarelo. */
export function LpHighlightLines({
  rows,
  as: Tag = "p",
  align = "left",
  onDark = false,
  className,
}: {
  rows: ReadonlyArray<LpHighlightRow>;
  as?: "p" | "h1" | "h2";
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        display.className,
        "text-[clamp(1.85rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.05em] text-foreground",
        align === "center" && "text-center",
        onDark && "text-white",
        className,
      )}
    >
      {rows.map(({ lead, mark, tone }) => (
        <span key={`${lead}-${mark}`} className="block sm:whitespace-nowrap">
          <span className={tone}>{lead}</span>{" "}
          <LpMark className={onDark ? MARK_ON_DARK : undefined}>{mark}</LpMark>
          <span className={onDark ? "text-white" : undefined}>.</span>
        </span>
      ))}
    </Tag>
  );
}
