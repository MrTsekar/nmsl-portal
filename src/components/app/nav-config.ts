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
  { label: "Overview", href: "/app/overview", icon: LayoutDashboard, roles: ["patient", "doctor", "admin"] },
  { label: "Appointments", href: "/app/appointments", icon: CalendarDays, roles: ["patient", "doctor", "admin"] },
  { label: "Medical Results", href: "/app/patient/medical-results", icon: FileHeart, roles: ["patient"] },
  { label: "My Prescriptions", href: "/app/patient/prescriptions", icon: TestTube, roles: ["patient"] },
  { label: "My Doctors", href: "/app/patient/doctors", icon: Stethoscope, roles: ["patient"] },
  { label: "Doctor Schedule", href: "/app/doctor/schedule", icon: ClipboardPlus, roles: ["doctor"] },
  { label: "Doctor Patients", href: "/app/doctor/patients", icon: Users, roles: ["doctor"] },
  { label: "Prescriptions", href: "/app/doctor/prescriptions", icon: TestTube, roles: ["doctor"] },
  { label: "Chat", href: "/app/chat", icon: MessageSquare, roles: ["patient", "doctor"] },
  { label: "Users", href: "/app/admin/users", icon: Users, roles: ["admin"] },
  { label: "Doctors", href: "/app/admin/doctors", icon: BookUser, roles: ["admin"] },
  { label: "Testimonials", href: "/app/admin/testimonials", icon: Quote, roles: ["admin"] },
  { label: "Profile", href: "/app/profile", icon: UserRound, roles: ["patient", "doctor", "admin"] },
  { label: "Admin Settings", href: "/app/admin/settings", icon: Settings, roles: ["admin"] },
];
