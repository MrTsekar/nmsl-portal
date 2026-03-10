import { RoleGuard } from "@/components/app/role-guard";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["doctor"]}>{children}</RoleGuard>;
}
