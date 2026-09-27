import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { RouteHeader, type RouteHeaderLink, type RouteTone } from "@/components/layout/route-header";

type ActionSlot = RouteHeaderLink | readonly RouteHeaderLink[] | null | undefined;

type PageFrameProps = {
  title: string;
  context?: string;
  icon: LucideIcon;
  tone?: RouteTone;
  primary?: ActionSlot;
  secondary?: ActionSlot;
  children: ReactNode;
};

export function PageFrame(props: PageFrameProps) {
  return (
    <div className="min-h-[calc(100dvh-3rem)] bg-[#f3f4f6] px-3 pb-28 pt-0 text-foreground dark:bg-zinc-950 sm:px-4 lg:min-h-dvh lg:px-6 lg:pb-20">
      <RouteHeader
        title={props.title}
        context={props.context}
        icon={props.icon}
        tone={props.tone}
        primary={props.primary}
        secondary={props.secondary}
      />
      {props.children}
    </div>
  );
}
