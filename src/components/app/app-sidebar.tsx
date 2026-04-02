"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Globe, Hospital } from "lucide-react";
import { primaryNavItems, websiteNavItems } from "@/components/app/nav-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

function isNavItemActive(pathname: string, href: string, allHrefs: string[]) {
  const isExactMatch = pathname === href;
  const isSubRoute = pathname.startsWith(`${href}/`);
  const hasMoreSpecificMatch = allHrefs.some(
    (otherHref) => otherHref !== href && pathname.startsWith(otherHref) && otherHref.startsWith(href),
  );
  return isExactMatch || (isSubRoute && !hasMoreSpecificMatch);
}

export function AppSidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [websiteOpen, setWebsiteOpen] = useState(true);

  const visiblePrimaryItems = useMemo(
    () => primaryNavItems.filter((item) => (user ? item.roles.includes(user.role) : false)),
    [user],
  );

  const visibleWebsiteItems = useMemo(
    () => websiteNavItems.filter((item) => (user ? item.roles.includes(user.role) : false)),
    [user],
  );

  const visibleNavHrefs = useMemo(
    () => [...visiblePrimaryItems, ...visibleWebsiteItems].map((item) => item.href),
    [visiblePrimaryItems, visibleWebsiteItems],
  );

  const websiteActive = visibleWebsiteItems.some((item) => isNavItemActive(pathname, item.href, visibleNavHrefs));

  return (
    <nav className="space-y-1">
      {visiblePrimaryItems.map((item) => {
        const active = isNavItemActive(pathname, item.href, visibleNavHrefs);
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

      {collapsed ? (
        <div className="pt-1">
          <div className={cn(
            "flex justify-center rounded-lg px-2 py-2.5",
            websiteActive ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "text-slate-500"
          )}>
            <Globe className="h-4 w-4" />
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setWebsiteOpen((prev) => !prev)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              websiteActive
                ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50",
            )}
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", websiteOpen && "rotate-180")} />
          </button>

          {websiteOpen ? (
            <div className="mt-1 ml-2 space-y-1 border-l border-slate-200/70 dark:border-slate-700/70 pl-2">
              {visibleWebsiteItems.map((item) => {
                const active = isNavItemActive(pathname, item.href, visibleNavHrefs);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-green-500 to-lime-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-3 shadow-lg overflow-y-auto md:flex md:flex-col", collapsed ? "w-16" : "w-64")}>
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
