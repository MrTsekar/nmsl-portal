"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatTitle } from "@/lib/utils";

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link href="/app/admin" className="hover:text-foreground">Home</Link>
      {parts.slice(1).map((part, index) => {
        const href = `/${parts.slice(0, index + 2).join("/")}`;
        const isLast = index === parts.slice(1).length - 1;
        return (
          <span key={href} className="flex items-center gap-1">
            <span>/</span>
            {isLast ? (
              <span className="text-foreground">{formatTitle(part)}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {formatTitle(part)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
