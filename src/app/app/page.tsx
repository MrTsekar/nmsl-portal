"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function AppRootPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Redirect to admin dashboard for all authenticated users
    if (user) {
      router.replace("/app/admin");
    }
  }, [user, router]);

  return null;
}
