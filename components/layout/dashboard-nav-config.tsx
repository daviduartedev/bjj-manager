import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Package, Settings, Users, Wallet } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export type MainNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Alvo do tour guiado (menu desktop e inferior no telemóvel). */
  dataTour: string;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { href: ROUTES.painel, label: "Painel", icon: LayoutDashboard, dataTour: "tour-painel" },
  { href: ROUTES.alunos, label: "Alunos", icon: Users, dataTour: "tour-alunos" },
  { href: ROUTES.mensalidades, label: "Mensalidades", icon: Wallet, dataTour: "tour-mensalidades" },
  { href: ROUTES.produtos, label: "Produtos", icon: Package, dataTour: "tour-produtos" },
  { href: ROUTES.configuracoes, label: "Configurações", icon: Settings, dataTour: "tour-configuracoes" },
];
