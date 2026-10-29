"use client";

import * as React from "react";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  FieldError,
  Group,
  Input as AriaInput,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  TabPanels as AriaTabPanels,
  Tabs as AriaTabs,
  Text,
  TextField,
} from "react-aria-components";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FIELD_CONTROL_CLASS = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card data-[invalid]:border-destructive data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60";
const POPOVER_CLASS = "z-50 min-w-[var(--trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg outline-none data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95";
const LISTBOX_CLASS = "max-h-[min(24rem,calc(100dvh-2rem))] overflow-y-auto p-1 outline-none";
const LISTBOX_ITEM_CLASS = "flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none data-[focused]:bg-accent data-[focused]:text-accent-foreground data-[selected]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

export type CascaOption = { id: string; label: string };
export type CascaButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const BUTTON_VARIANTS: Record<CascaButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground data-[hovered]:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/85",
  outline: "border border-input bg-card text-foreground data-[hovered]:bg-accent",
  ghost: "bg-transparent text-foreground data-[hovered]:bg-accent",
};

export function CascaButton({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<typeof AriaButton> & { variant?: CascaButtonVariant }) {
  return (
    <AriaButton
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold outline-none transition-[background-color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[pressed]:scale-[.99] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        BUTTON_VARIANTS[variant],
        className,
      )}
    />
  );
}

export type CascaTextFieldProps = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  description?: string;
  errorMessage?: string;
  className?: string;
};

export function CascaTextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  isRequired,
  isDisabled,
  isInvalid,
  description,
  errorMessage,
  className,
}: CascaTextFieldProps) {
  return (
    <TextField
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      validationBehavior="aria"
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label className="type-field-label">{label}</Label>
      <AriaInput
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck={type !== "email"}
        className={FIELD_CONTROL_CLASS}
      />
      {description && <Text slot="description" className="text-crm-sm text-muted-foreground">{description}</Text>}
      {errorMessage && <FieldError className="text-crm-sm font-medium text-destructive">{errorMessage}</FieldError>}
    </TextField>
  );
}

type SelectFieldProps = {
  id?: string;
  label: string;
  value: string;
  options: CascaOption[];
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
};

export function CascaSelectField({
  id,
  label,
  value,
  options,
  onChange,
  isRequired,
  isDisabled,
  isInvalid,
  errorMessage,
  placeholder = "Selecione uma opção",
  className,
}: SelectFieldProps) {
  return (
    <AriaSelect
      id={id}
      selectedKey={value || null}
      onSelectionChange={(key) => onChange(key == null ? "" : String(key))}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      validationBehavior="aria"
      placeholder={placeholder}
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label className="type-field-label">{label}</Label>
      <AriaButton className={cn(FIELD_CONTROL_CLASS, "inline-flex items-center justify-between gap-2 text-left data-[open]:ring-2 data-[open]:ring-ring")}>
        <SelectValue className="min-w-0 flex-1 truncate" />
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </AriaButton>
      <Popover placement="bottom start" shouldFlip containerPadding={12} offset={6} className={POPOVER_CLASS}>
        <ListBox aria-label={`${label} opções`} items={options} className={LISTBOX_CLASS}>
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} className={LISTBOX_ITEM_CLASS}>
              {({ isSelected }) => <>{option.label}{isSelected && <Check className="ml-auto size-4 text-primary" aria-hidden />}</>}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
      {errorMessage && <FieldError className="text-crm-sm font-medium text-destructive">{errorMessage}</FieldError>}
    </AriaSelect>
  );
}

type CascaComboBoxFieldProps = {
  id?: string;
  label: string;
  inputValue: string;
  selectedKey: string;
  options: CascaOption[];
  onInputChange: (value: string) => void;
  onSelectionChange: (value: string | null) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
};

export function CascaComboBoxField({
  id,
  label,
  inputValue,
  selectedKey,
  options,
  onInputChange,
  onSelectionChange,
  inputRef,
  isRequired,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  placeholder,
  emptyMessage = "Nenhuma opção encontrada.",
  className,
}: CascaComboBoxFieldProps) {
  return (
    <AriaComboBox
      id={id}
      inputValue={inputValue}
      selectedKey={selectedKey || null}
      onInputChange={onInputChange}
      onSelectionChange={(key) => onSelectionChange(key == null ? null : String(key))}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      validationBehavior="aria"
      allowsEmptyCollection
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label className="type-field-label">{label}</Label>
      <Group className={cn(FIELD_CONTROL_CLASS, "inline-flex items-center justify-between gap-2 p-0 focus-within:ring-2 focus-within:ring-ring data-[focus-within]:ring-2 data-[focus-within]:ring-ring")}>
        <AriaInput ref={inputRef} placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground" />
        <AriaButton aria-label={`Mostrar opções de ${label}`} className="mr-1 grid size-8 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown className="size-4" aria-hidden />
        </AriaButton>
      </Group>
      {description && <Text slot="description" className="text-crm-sm text-muted-foreground">{description}</Text>}
      {errorMessage && <FieldError className="text-crm-sm font-medium text-destructive">{errorMessage}</FieldError>}
      <Popover placement="bottom start" shouldFlip containerPadding={12} offset={6} className={POPOVER_CLASS}>
        <ListBox
          aria-label={`${label} opções`}
          items={options}
          className={LISTBOX_CLASS}
          renderEmptyState={() => <p className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</p>}
        >
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} className={LISTBOX_ITEM_CLASS}>
              {({ isSelected }) => <>{option.label}{isSelected && <Check className="ml-auto size-4 text-primary" aria-hidden />}</>}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function CascaTabs(props: React.ComponentProps<typeof AriaTabs>) {
  return <AriaTabs {...props} className={cn("min-w-0", props.className)} />;
}

export function CascaTabList<T extends object>(props: React.ComponentProps<typeof AriaTabList<T>>) {
  return <AriaTabList {...props} className={cn("flex min-h-11 w-fit max-w-full gap-1 overflow-x-auto border-b border-border", props.className)} />;
}

export function CascaTab(props: React.ComponentProps<typeof AriaTab>) {
  return <AriaTab {...props} className={cn("inline-flex min-h-11 shrink-0 items-center justify-center border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[selected]:border-primary data-[selected]:text-foreground", props.className)} />;
}

export function CascaTabPanels<T extends object>(props: React.ComponentProps<typeof AriaTabPanels<T>>) {
  return <AriaTabPanels {...props} className={cn("pt-4", props.className)} />;
}

export function CascaTabPanel(props: React.ComponentProps<typeof AriaTabPanel>) {
  return <AriaTabPanel {...props} className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring", props.className)} />;
}
