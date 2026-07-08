import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

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
  { href: ROUTES.aulas, label: "Aulas", icon: CalendarDays, dataTour: "tour-aulas" },
  { href: ROUTES.pedagogicoPlanos, label: "Pedagógico", icon: BookOpen, dataTour: "tour-pedagogico" },
  { href: ROUTES.documentos, label: "Documentos", icon: FileText, dataTour: "tour-documentos" },
  {
    href: ROUTES.matriculasTermos,
    label: "Matrículas",
    icon: ClipboardList,
    dataTour: "tour-matriculas-termos",
  },
  { href: ROUTES.produtos, label: "Produtos", icon: Package, dataTour: "tour-produtos" },
  { href: ROUTES.configuracoes, label: "Configurações", icon: Settings, dataTour: "tour-configuracoes" },
];
