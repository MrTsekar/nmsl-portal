"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  FEATURE_PREMIUM_THEME_TOGGLE,
  FEATURE_ROLE_SWITCHER,
} from "@/lib/config/features";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";

export function AppHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { user, signOut, switchRole } = useAuthStore();
  const { premiumTheme, togglePremiumTheme } = useUiStore();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.push("/sign-in");
  };

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
        <NotificationBell />
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
                {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
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
                <DropdownMenuItem onClick={() => switchRole("appointment_officer")}>Switch to appointment officer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole("admin")}>Switch to admin</DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
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
