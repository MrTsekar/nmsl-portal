"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && pathname.startsWith("/app")) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname.startsWith("/app")) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
