import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Users, Wallet } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export type MainNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { href: ROUTES.painel, label: "Painel", icon: LayoutDashboard },
  { href: ROUTES.alunos, label: "Alunos", icon: Users },
  { href: ROUTES.mensalidades, label: "Mensalidades", icon: Wallet },
  { href: ROUTES.configuracoes, label: "Configurações", icon: Settings },
];
