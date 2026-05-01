"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

export function DesignSystemProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
  );
}
