"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log("🛡️ AuthGuard check:", { pathname, isAuthenticated });
    
    if (!isAuthenticated && pathname.startsWith("/app")) {
      console.log("❌ Not authenticated, redirecting to sign-in");
      router.replace("/sign-in");
    } else if (isAuthenticated && pathname.startsWith("/app")) {
      console.log("✅ Authenticated, allowing access");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname.startsWith("/app")) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
