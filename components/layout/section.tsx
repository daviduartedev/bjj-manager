import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
};

export function Section({
  title,
  description,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {(title ?? description) ? (
        <div className="space-y-1">
          {title ? (
            <h2 className="type-section-title">{title}</h2>
          ) : null}
          {description ? (
            <p className="type-lead">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
