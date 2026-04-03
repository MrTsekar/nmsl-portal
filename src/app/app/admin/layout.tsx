import { RoleGuard } from "@/components/app/role-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["admin", "appointment_officer"]}>{children}</RoleGuard>;
}
