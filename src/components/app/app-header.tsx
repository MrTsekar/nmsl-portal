"use client";

import { useState } from "react";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FEATURE_PREMIUM_THEME_TOGGLE,
  FEATURE_ROLE_SWITCHER,
} from "@/lib/config/features";
import { mockNotifications } from "@/lib/mocks/data";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";

export function AppHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { setTheme, theme } = useTheme();
  const { user, signOut, switchRole } = useAuthStore();
  const { premiumTheme, togglePremiumTheme } = useUiStore();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const notifications = mockNotifications.filter((item) => (user ? item.roles.includes(user.role) : false));
  const unreadNotifications = notifications.filter((item) => !item.read);

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-4 py-3 md:gap-3 md:px-6 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:max-w-md">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="md:hidden"
          onClick={onOpenMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open search"
          aria-expanded={mobileSearchOpen}
          className="md:hidden"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
        >
          <Search className="h-5 w-5" />
        </Button>

        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search appointments, doctors, records..." className="pl-9" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold">Notifications</p>
              <Badge variant="secondary">{unreadNotifications.length} unread</Badge>
            </div>
            <Tabs defaultValue="unread" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              </TabsList>
              <TabsContent value="unread" className="mt-2 space-y-2">
                {unreadNotifications.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">No unread notifications.</p>
                ) : (
                  unreadNotifications.map((item) => (
                    <div key={item.id} className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{item.createdAt}</p>
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="all" className="mt-2 space-y-2">
                {notifications.map((item) => (
                  <div key={item.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      {!item.read ? <Badge variant="success">new</Badge> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.createdAt}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex">
              <Avatar>
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() ?? "NA"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {FEATURE_PREMIUM_THEME_TOGGLE ? (
              <DropdownMenuItem onClick={togglePremiumTheme}>
                {premiumTheme ? "Disable premium theme" : "Enable premium theme"}
              </DropdownMenuItem>
            ) : null}
            {FEATURE_ROLE_SWITCHER && user?.role === "admin" ? (
              <>
                <DropdownMenuItem onClick={() => switchRole("patient")}>Switch to patient</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole("doctor")}>Switch to doctor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole("admin")}>Switch to admin</DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileSearchOpen ? (
        <div className="w-full md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search appointments, doctors, records..." className="pl-9" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
