"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { EmptyState } from "@/components/shared/empty-state";

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !allow.includes(user.role)) {
      router.replace("/app/admin");
    }
  }, [allow, router, user]);

  if (user && !allow.includes(user.role)) {
    return <EmptyState title="Access restricted" description="You do not have permission to view this page." />;
  }

  return <>{children}</>;
}
