import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("premium-card h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-white via-white to-green-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-green-950/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">{title}</CardTitle>
        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-lime-500/10 dark:from-green-400/10 dark:to-lime-400/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-700 dark:from-green-400 dark:to-lime-400 bg-clip-text text-transparent">{value}</div>
        {hint ? <p className="pt-1 text-xs text-slate-600 dark:text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
