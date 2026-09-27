export const PAGE_FRAME_LABEL = {
  A: "Faixa",
  B: "Mesa",
  C: "Ficha",
} as const;

export type PageFrameKey = keyof typeof PAGE_FRAME_LABEL;

export type PageHeaderAction = {
  label: string;
  href: string;
};

type PageHeaderSlot = PageHeaderAction | readonly PageHeaderAction[] | null | undefined;

export function pageFrameVariant(value: string | null): PageFrameKey {
  if (value === "A" || value === "B" || value === "C") return value;
  return "A";
}

export function resolvePageHeader(input: {
  primary?: PageHeaderSlot;
  secondary?: PageHeaderSlot;
}): { primary: PageHeaderAction | null; secondary: PageHeaderAction | null } {
  return {
    primary: firstAction(input.primary),
    secondary: firstAction(input.secondary),
  };
}

function firstAction(slot: PageHeaderSlot): PageHeaderAction | null {
  if (slot == null) return null;
  const action = Array.isArray(slot) ? slot[0] : slot;
  if (!action) return null;
  return { label: action.label, href: action.href };
}
