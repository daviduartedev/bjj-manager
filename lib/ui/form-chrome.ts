/** Controles no tamanho dos CTAs do cabeçalho da área logada. */

export const fieldClass = "h-10 rounded-xl px-3 text-sm";

export const primaryActionClass =
  "h-10 min-w-[7.5rem] w-auto shrink-0 rounded-xl px-3.5 text-sm";

export const secondaryActionClass =
  "h-10 min-w-[7.5rem] w-auto shrink-0 rounded-xl border-2 border-zinc-950 bg-white px-3.5 text-sm text-zinc-950 hover:bg-zinc-950 hover:text-white dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-100 dark:hover:text-zinc-950";

export const formActionsClass = "flex flex-wrap items-center justify-end gap-2";

/** Formulários autenticados: inputs não esticam a viewport. */
export const formShellClass = "w-full max-w-xl";

/** Linha de checkbox de formulário: quadrado `sm`, alvo de toque ≥ 44px. */
export const formCheckboxRowClass =
  "flex min-h-11 cursor-pointer flex-row items-center gap-3 space-y-0";

export const dialogSizeClass = {
  confirm: "max-w-sm",
  short: "max-w-md",
  wide: "max-w-2xl",
} as const;

export type DialogSize = keyof typeof dialogSizeClass;

/** Grelha de formulário largo: duas colunas a partir de `sm`. */
export const dialogWideFieldsClass = "grid gap-4 sm:grid-cols-2";
