"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Hospital } from "lucide-react";
import { navItems } from "@/components/app/nav-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";

export function AppSidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav className="space-y-1">
      {navItems
        .filter((item) => (user ? item.roles.includes(user.role) : false))
        .map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed ? <span>{item.label}</span> : null}
              {!collapsed && item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
            </Link>
          );
        })}
    </nav>
  );
}

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const companyLogoUrl = useUiStore((state) => state.companyLogoUrl);

  return (
    <aside className={cn("hidden shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-3 md:flex md:flex-col shadow-lg", collapsed ? "w-20" : "w-64")}>
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={companyLogoUrl} alt="Company logo" className="h-6 w-6 rounded object-contain" />
          ) : (
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Hospital className="h-5 w-5 text-white" />
            </div>
          )}
          {!collapsed && <span className="font-bold text-slate-800 dark:text-slate-100">NMSL App</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <AppSidebarNav collapsed={collapsed} />
    </aside>
  );
}
