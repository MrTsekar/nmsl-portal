import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationBannerProps {
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

const notificationStyles: Record<NotificationType, { bg: string; border: string; icon: React.ReactNode }> = {
  info: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    icon: <Info className="h-5 w-5 text-green-600 dark:text-green-400" />,
  },
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  },
};

export function NotificationBanner({ type, title, message, action, onDismiss }: NotificationBannerProps) {
  const styles = notificationStyles[type];

  return (
    <div className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-4 animate-in fade-in slide-in-from-top-2 duration-500`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base mb-1">{title}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">{message}</p>
          {action && (
            <div className="mt-3">
              <Button size="sm" onClick={action.onClick} className="h-8">
                {action.label}
              </Button>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
