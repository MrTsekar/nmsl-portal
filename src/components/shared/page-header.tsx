import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  action,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/30 shadow-sm">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent break-words">{title}</h1>
        {subtitle ? <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? action : actionLabel ? (
        <Button type="button" onClick={onAction} className="text-sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
