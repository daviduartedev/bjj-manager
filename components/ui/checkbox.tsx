"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  /**
   * `default` — alvo tocável ≥44px (formulários).
   * `sm` — listas e secções médias.
   * `dense` — grelhas com centenas de linhas (ex.: mensalidades).
   */
  size?: "default" | "sm" | "dense";
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "default", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer flex shrink-0 items-center justify-center rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      size === "default" && "size-11 rounded-md",
      size === "sm" && "h-7 w-7 rounded-[5px] border-primary/90 data-[state=checked]:shadow-sm",
      size === "dense" &&
        "h-4 w-4 rounded-[3px] border-primary/85 data-[state=checked]:shadow-none",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check
        className={cn(
          size === "dense" && "size-2.5",
          size === "sm" && "size-[13px]",
          (size === "default" || !size) && "size-5",
        )}
        aria-hidden
        strokeWidth={size === "dense" ? 3 : 2}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
