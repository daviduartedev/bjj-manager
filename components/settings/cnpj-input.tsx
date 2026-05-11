"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { maskCnpj } from "@/lib/validations/settings";

type CnpjInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value: string;
  onChange: (next: string) => void;
};

export const CnpjInput = React.forwardRef<HTMLInputElement, CnpjInputProps>(
  function CnpjInput({ value, onChange, inputMode = "numeric", ...rest }, ref) {
    return (
      <Input
        ref={ref}
        inputMode={inputMode}
        autoComplete="off"
        placeholder="00.000.000/0000-00"
        maxLength={18}
        value={maskCnpj(value)}
        onChange={(e) => onChange(maskCnpj(e.currentTarget.value))}
        {...rest}
      />
    );
  },
);
