"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";

export interface InactivityWarningModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Callback when user clicks "Stay Active" */
  onStayActive: () => void;
  /** Callback when user clicks "Logout Now" */
  onLogout: () => void;
}

/**
 * Warning modal shown before auto-logout
 * 
 * Features:
 * - Shows countdown timer
 * - Allows user to stay active or logout immediately
 * - Accessible keyboard navigation
 * - Visual urgency indicators (color changes as time decreases)
 * - Prevents accidental closure (no close button, must choose action)
 * 
 * @example
 * ```tsx
 * <InactivityWarningModal
 *   open={showWarning}
 *   timeRemaining={timeRemaining}
 *   onStayActive={stayActive}
 *   onLogout={logout}
 * />
 * ```
 */
export function InactivityWarningModal({
  open,
  timeRemaining,
  onStayActive,
  onLogout,
}: InactivityWarningModalProps) {
  // Focus "Stay Active" button when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const stayActiveButton = document.getElementById("stay-active-button");
        stayActiveButton?.focus();
      }, 100);
    }
  }, [open]);

  // Determine urgency level for visual feedback
  const getUrgencyLevel = (seconds: number): "low" | "medium" | "high" | "critical" => {
    if (seconds > 45) return "low";
    if (seconds > 30) return "medium";
    if (seconds > 15) return "high";
    return "critical";
  };

  const urgency = getUrgencyLevel(timeRemaining);

  // Color schemes based on urgency
  const urgencyColors = {
    low: {
      icon: "text-blue-600 dark:text-blue-400",
      timer: "text-blue-700 dark:text-blue-300",
      background: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
    },
    medium: {
      icon: "text-yellow-600 dark:text-yellow-400",
      timer: "text-yellow-700 dark:text-yellow-300",
      background: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    high: {
      icon: "text-orange-600 dark:text-orange-400",
      timer: "text-orange-700 dark:text-orange-300",
      background: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
    },
    critical: {
      icon: "text-red-600 dark:text-red-400 animate-pulse",
      timer: "text-red-700 dark:text-red-300 font-bold animate-pulse",
      background: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
  };

  const colors = urgencyColors[urgency];

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        // Prevent closing via escape or outside click
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className={`h-6 w-6 ${colors.icon}`} />
            <span>Session Timeout Warning</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning message */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            You've been inactive for a while. For your security, you will be automatically 
            logged out in:
          </p>

          {/* Countdown timer */}
          <div
            className={`
              flex items-center justify-center gap-3 p-6 rounded-lg border-2
              ${colors.background} ${colors.border}
            `}
          >
            <Clock className={`h-8 w-8 ${colors.icon}`} />
            <span className={`text-5xl font-mono tabular-nums ${colors.timer}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Security notice */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Security Notice:</strong>{" "}
              This timeout protects patient data and ensures HIPAA compliance when workstations 
              are shared among staff members.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              id="stay-active-button"
              onClick={onStayActive}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              autoFocus
            >
              Stay Active
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Logout Now
            </Button>
          </div>

          {/* Keyboard shortcuts hint */}
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Tab</kbd> to switch between buttons
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
