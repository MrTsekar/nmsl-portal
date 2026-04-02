"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppMobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { label: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
    { label: "Users", href: "/app/admin/users", icon: Users },
    { label: "Website", href: "/app/admin/appointments", icon: Globe },
    { label: "Settings", href: "/app/admin/settings", icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-all duration-200",
                  active 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  active && "bg-gradient-to-br from-green-500/10 to-lime-500/10"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
