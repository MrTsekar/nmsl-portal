"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AutoLogoutProvider } from "@/components/auto-logout-provider";
import { queryClient } from "@/lib/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AutoLogoutProvider>{children}</AutoLogoutProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
