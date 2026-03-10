"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, MessageSquare, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function AppMobileBottomNav() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);

  const baseItems = [
    { label: "Overview", href: "/app/overview", icon: LayoutDashboard },
    { label: "Appointments", href: "/app/appointments", icon: CalendarDays },
  ];

  const roleSpecificItems = 
    role === "admin" 
      ? [{ label: "Users", href: "/app/admin/users", icon: Users }]
      : [{ label: "Chat", href: "/app/chat", icon: MessageSquare }];

  const items = [
    ...baseItems,
    ...roleSpecificItems,
    { label: "Profile", href: "/app/profile", icon: UserRound },
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
                    ? "text-cyan-600 dark:text-cyan-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  active && "bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
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
