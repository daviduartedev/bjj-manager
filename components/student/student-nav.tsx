import type { LucideIcon } from "lucide-react";
import { CalendarDays, ClipboardList, Home, ShoppingBag, Wallet } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export type StudentNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Navegação principal do portal do aluno (**SPT-2**, **SHELL-9**). */
export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: ROUTES.portal, label: "Início", icon: Home },
  { href: ROUTES.portalAulas, label: "Aulas", icon: CalendarDays },
  { href: ROUTES.portalPresenca, label: "Presença", icon: ClipboardList },
  { href: ROUTES.portalLoja, label: "Loja", icon: ShoppingBag },
  { href: ROUTES.portalFinanceiro, label: "Financeiro", icon: Wallet },
];
