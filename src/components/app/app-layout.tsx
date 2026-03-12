"use client";

import { useState } from "react";
import { Hospital } from "lucide-react";
import { AppBreadcrumbs } from "@/components/app/app-breadcrumbs";
import { AppHeader } from "@/components/app/app-header";
import { AppMobileBottomNav } from "@/components/app/app-mobile-bottom-nav";
import { AppSidebar, AppSidebarNav } from "@/components/app/app-sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const premiumTheme = useUiStore((state) => state.premiumTheme);

  return (
    <div className={cn("flex min-h-screen", premiumTheme && "premium-theme")}>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-3 pb-20 sm:p-4 sm:pb-24 md:p-6 md:pb-6">
          <AppBreadcrumbs />
          <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6">{children}</div>
        </main>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent className="right-auto left-0 w-[85vw] max-w-xs border-r border-l-0 p-4">
          <SheetTitle className="sr-only">Mobile navigation menu</SheetTitle>
          <div className="mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-lime-600">
              <Hospital className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">NMSL App</span>
          </div>
          <AppSidebarNav collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <AppMobileBottomNav />
    </div>
  );
}
