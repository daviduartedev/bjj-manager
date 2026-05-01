"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-none border border-border bg-popover text-popover-foreground shadow-md",
          title: "text-foreground",
          description: "text-muted-foreground",
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
