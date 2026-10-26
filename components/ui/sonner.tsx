"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "min-w-[22rem] rounded-none border border-border bg-popover px-5 py-4 text-base text-popover-foreground shadow-lg",
          title: "text-base font-medium text-foreground",
          description: "text-base text-muted-foreground",
          actionButton:
            "rounded-none bg-primary text-primary-foreground",
          cancelButton:
            "rounded-none bg-muted text-muted-foreground",
          closeButton:
            "rounded-none bg-transparent text-foreground",
        },
      }}
      {...props}
    />
  );
}
