import {
  BookUser,
  LayoutDashboard,
  Quote,
  Settings,
  Users,
  Briefcase,
  BarChart3,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Role } from "@/types";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/app/admin", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Users", href: "/app/admin/users", icon: Users, roles: ["admin"] },
  { label: "Doctors", href: "/app/admin/doctors", icon: BookUser, roles: ["admin"] },
  { label: "Services", href: "/app/admin/services", icon: Briefcase, roles: ["admin"] },
  { label: "Statistics", href: "/app/admin/statistics", icon: BarChart3, roles: ["admin"] },
  { label: "Testimonials", href: "/app/admin/testimonials", icon: Quote, roles: ["admin"] },
  { label: "Settings", href: "/app/admin/settings", icon: Settings, roles: ["admin"] },
];
