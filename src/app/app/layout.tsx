import { AppLayout } from "@/components/app/app-layout";
import { AuthGuard } from "@/components/app/auth-guard";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
