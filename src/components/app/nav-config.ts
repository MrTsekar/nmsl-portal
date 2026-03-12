import {
  BookUser,
  CalendarDays,
  ClipboardPlus,
  FileHeart,
  LayoutDashboard,
  MessageSquare,
  Quote,
  Settings,
  Stethoscope,
  TestTube,
  UserRound,
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
  superAdminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/app/overview", icon: LayoutDashboard, roles: ["patient", "doctor", "admin"] },
  { label: "Appointments", href: "/app/appointments", icon: CalendarDays, roles: ["patient", "doctor", "admin"] },
  { label: "Medical Results", href: "/app/patient/medical-results", icon: FileHeart, roles: ["patient"] },
  { label: "My Prescriptions", href: "/app/patient/prescriptions", icon: TestTube, roles: ["patient"] },
  { label: "My Doctors", href: "/app/patient/doctors", icon: Stethoscope, roles: ["patient"] },
  { label: "Schedule", href: "/app/doctor/schedule", icon: ClipboardPlus, roles: ["doctor"] },
  { label: "Patients", href: "/app/doctor/patients", icon: Users, roles: ["doctor"] },
  { label: "Prescriptions", href: "/app/doctor/prescriptions", icon: TestTube, roles: ["doctor"] },
  { label: "Chat", href: "/app/chat", icon: MessageSquare, roles: ["patient", "doctor"] },
  { label: "Manage Admins", href: "/app/admin/manage-admins", icon: Users, roles: ["super_admin"], superAdminOnly: true },
  { label: "Users", href: "/app/admin/users", icon: Users, roles: ["admin", "super_admin"] },
  { label: "Doctors", href: "/app/admin/doctors", icon: BookUser, roles: ["admin", "super_admin"] },
  { label: "Services", href: "/app/admin/services", icon: Briefcase, roles: ["admin", "super_admin"] },
  { label: "Statistics", href: "/app/admin/statistics", icon: BarChart3, roles: ["admin", "super_admin"] },
  { label: "Testimonials", href: "/app/admin/testimonials", icon: Quote, roles: ["admin", "super_admin"] },
  { label: "Profile", href: "/app/profile", icon: UserRound, roles: ["patient", "doctor", "admin", "super_admin"] },
  { label: "Admin Settings", href: "/app/admin/settings", icon: Settings, roles: ["admin", "super_admin"] },
];
