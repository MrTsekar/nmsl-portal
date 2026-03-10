import Link from "next/link";
import { Hospital } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-cyan-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 px-3 py-6 sm:px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200/50 dark:border-slate-800/50">
        <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
          <div className="mb-1 sm:mb-2 flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Hospital className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">NMSL App</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          {children}
          {footer ? <div className="text-xs sm:text-sm text-muted-foreground">{footer}</div> : null}
          <p className="text-center text-xs text-muted-foreground">
            Need help? <Link className="text-primary hover:underline" href="/forgot-password">Reset access</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
