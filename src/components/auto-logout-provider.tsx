"use client";

import { useAutoLogout } from "@/hooks/use-auto-logout";
import { InactivityWarningModal } from "@/components/inactivity-warning-modal";

/**
 * Auto-logout provider component
 * 
 * Integrates auto-logout functionality with inactivity warning modal.
 * Configured for HIPAA compliance with 15-minute timeout.
 * 
 * Features:
 * - 15-minute inactivity timeout
 * - 1-minute warning before logout
 * - Monitors mouse, keyboard, scroll, and touch events
 * - Optimized with throttled event listeners
 * - Properly cleans up on unmount
 * 
 * @example
 * ```tsx
 * <AutoLogoutProvider>
 *   <YourAppContent />
 * </AutoLogoutProvider>
 * ```
 */
export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const { showWarning, timeRemaining, stayActive, logout } = useAutoLogout({
    timeout: 15 * 60 * 1000, // 15 minutes
    warningTime: 60 * 1000,  // 1 minute warning
    throttleDelay: 1000,     // 1 second throttle
    onWarning: () => {
      console.log("⚠️ Inactivity warning shown");
    },
    onLogout: () => {
      console.log("🔒 Auto-logout triggered due to inactivity");
    },
  });

  return (
    <>
      {children}
      <InactivityWarningModal
        open={showWarning}
        timeRemaining={timeRemaining}
        onStayActive={stayActive}
        onLogout={logout}
      />
    </>
  );
}
