import * as React from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = React.HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="type-page-title">{title}</h1>
          <span className="hidden h-0.5 w-14 shrink-0 bg-primary sm:inline-block md:w-20" aria-hidden />
        </div>
        {description ? <p className="type-lead max-w-2xl md:text-crm-base">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
