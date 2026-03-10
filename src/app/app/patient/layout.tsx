import { RoleGuard } from "@/components/app/role-guard";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["patient"]}>{children}</RoleGuard>;
}
