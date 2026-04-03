"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { EmptyState } from "@/components/shared/empty-state";

const appointmentOfficerAllowedRoutes = [
  "/app/admin",
  "/app/admin/users",
  "/app/admin/settings",
  "/app/admin/appointments",
];

function isAllowedAppointmentOfficerRoute(pathname: string) {
  return appointmentOfficerAllowedRoutes.some((route) => {
    if (route === "/app/admin") {
      return pathname === route;
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const roleBlocked = Boolean(user && !allow.includes(user.role));
  const routeBlocked = Boolean(user?.role === "appointment_officer" && !isAllowedAppointmentOfficerRoute(pathname));

  useEffect(() => {
    if (roleBlocked) {
      router.replace("/app/admin/appointments");
      return;
    }

    if (routeBlocked) {
      router.replace("/app/admin/appointments");
    }
  }, [roleBlocked, routeBlocked, router]);

  if (roleBlocked || routeBlocked) {
    return <EmptyState title="Access restricted" description="You do not have permission to view this page." />;
  }

  return <>{children}</>;
}
