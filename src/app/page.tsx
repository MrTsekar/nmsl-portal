"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    router.replace(isAuthenticated ? "/app/admin" : "/sign-in");
  }, [isAuthenticated, router]);

  return <div className="min-h-screen bg-background" />;
}
