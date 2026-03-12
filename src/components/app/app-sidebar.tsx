"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Hospital } from "lucide-react";
import { navItems } from "@/components/app/nav-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

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
                collapsed && "justify-center px-2",
                active 
                  ? "bg-gradient-to-r from-green-500 to-lime-600 text-white shadow-md" 
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
  return (
    <aside className={cn("hidden shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-3 md:flex md:flex-col shadow-lg", collapsed ? "w-16" : "w-64")}>
      <div className={cn("mb-4 flex items-center px-1", collapsed ? "flex-col gap-2" : "justify-between gap-2")}>
        {collapsed ? (
          <>
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-lime-600">
              <Hospital className="h-5 w-5 text-white" />
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-lime-600">
                <Hospital className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">NMSL App</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <AppSidebarNav collapsed={collapsed} />
    </aside>
  );
}
