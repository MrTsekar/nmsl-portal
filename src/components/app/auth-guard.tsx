"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    console.log("🛡️ AuthGuard check:", { pathname, isAuthenticated, _hasHydrated });
    
    // Wait for hydration to complete before checking auth
    if (!_hasHydrated) {
      console.log("⏳ Waiting for hydration to complete...");
      return;
    }
    
    if (!isAuthenticated && pathname.startsWith("/app")) {
      console.log("❌ Not authenticated, redirecting to sign-in");
      router.replace("/sign-in");
    } else if (isAuthenticated && pathname.startsWith("/app")) {
      console.log("✅ Authenticated, allowing access");
    }
  }, [isAuthenticated, pathname, router, _hasHydrated]);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated && pathname.startsWith("/app")) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
