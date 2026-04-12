"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export interface AutoLogoutOptions {
  /**
   * Inactivity timeout in milliseconds before auto-logout
   * @default 900000 (15 minutes)
   */
  timeout?: number;

  /**
   * Warning time in milliseconds before logout
   * @default 60000 (1 minute)
   */
  warningTime?: number;

  /**
   * Throttle delay for activity events in milliseconds
   * @default 1000 (1 second)
   */
  throttleDelay?: number;

  /**
   * Events to listen for user activity
   * @default ["mousedown", "keydown", "scroll", "touchstart", "mousemove"]
   */
  events?: string[];

  /**
   * Callback when warning is shown
   */
  onWarning?: () => void;

  /**
   * Callback when user is logged out
   */
  onLogout?: () => void;
}

export interface AutoLogoutState {
  /** Time remaining until logout in seconds */
  timeRemaining: number;
  /** Whether warning modal should be shown */
  showWarning: boolean;
  /** Reset the inactivity timer */
  resetTimer: () => void;
  /** Manually trigger logout */
  logout: () => void;
  /** Keep the session active (called from warning modal) */
  stayActive: () => void;
}

const DEFAULT_OPTIONS: Required<Omit<AutoLogoutOptions, 'onWarning' | 'onLogout'>> = {
  timeout: 15 * 60 * 1000, // 15 minutes
  warningTime: 60 * 1000, // 1 minute
  throttleDelay: 1000, // 1 second
  events: ["mousedown", "keydown", "scroll", "touchstart", "mousemove"],
};

/**
 * Custom hook for auto-logout functionality
 * 
 * Features:
 * - Automatically logs out user after specified inactivity period
 * - Shows warning modal before logout
 * - Resets timer on user activity
 * - Throttled event listeners for performance
 * - Passive event listeners where supported
 * - Proper cleanup on unmount
 * 
 * @example
 * ```tsx
 * const { showWarning, timeRemaining, stayActive, logout } = useAutoLogout({
 *   timeout: 15 * 60 * 1000, // 15 minutes
 *   warningTime: 60 * 1000,  // 1 minute warning
 * });
 * ```
 */
export function useAutoLogout(options: AutoLogoutOptions = {}): AutoLogoutState {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuthStore();
  
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(config.warningTime / 1000);

  // Use refs to avoid re-creating event listeners
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
      throttleRef.current = null;
    }
  }, []);

  /**
   * Perform logout - clear tokens and redirect
   */
  const logout = useCallback(() => {
    clearTimers();
    setShowWarning(false);

    // Clear all auth tokens from storage
    localStorage.removeItem("nmsl-auth-storage");
    sessionStorage.clear();

    // Update auth store
    signOut();

    // Call custom logout callback
    options.onLogout?.();

    // Redirect to sign-in with message
    router.push("/sign-in?reason=inactivity");
  }, [clearTimers, signOut, router, options]);

  /**
   * Start the countdown timer for the warning modal
   */
  const startCountdown = useCallback(() => {
    const warningDuration = config.warningTime / 1000; // Convert to seconds
    setTimeRemaining(warningDuration);

    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [config.warningTime, logout]);

  /**
   * Show warning modal
   */
  const showWarningModal = useCallback(() => {
    setShowWarning(true);
    startCountdown();
    options.onWarning?.();
  }, [startCountdown, options]);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();

    if (!isAuthenticated) return;

    // Set warning timer (14 minutes for 15-minute timeout)
    const warningDelay = config.timeout - config.warningTime;
    warningTimeoutRef.current = setTimeout(showWarningModal, warningDelay);

    // Set logout timer (15 minutes)
    timeoutRef.current = setTimeout(logout, config.timeout);
  }, [clearTimers, isAuthenticated, config.timeout, config.warningTime, showWarningModal, logout]);

  /**
   * Keep session active - called from warning modal "Stay Active" button
   */
  const stayActive = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Throttled activity handler
   */
  const handleActivity = useCallback(() => {
    // Only reset if not showing warning
    if (showWarning) return;

    // Throttle activity events
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, config.throttleDelay);

    // Update last activity time
    const now = Date.now();
    if (now - lastActivityRef.current > config.throttleDelay) {
      lastActivityRef.current = now;
      resetTimer();
    }
  }, [showWarning, config.throttleDelay, resetTimer]);

  /**
   * Setup event listeners on mount
   */
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    // Start initial timer
    resetTimer();

    // Add activity event listeners
    const passiveSupported = (() => {
      let supported = false;
      try {
        const options: AddEventListenerOptions = {
          get passive() {
            supported = true;
            return false;
          },
        };
        window.addEventListener("test" as any, null as any, options);
        window.removeEventListener("test" as any, null as any, options);
      } catch (err) {
        supported = false;
      }
      return supported;
    })();

    const listenerOptions: AddEventListenerOptions = passiveSupported
      ? { passive: true, capture: false }
      : { capture: false };

    config.events.forEach((event) => {
      window.addEventListener(event, handleActivity, listenerOptions);
    });

    // Cleanup on unmount
    return () => {
      clearTimers();
      config.events.forEach((event) => {
        window.removeEventListener(event, handleActivity, listenerOptions);
      });
    };
  }, [isAuthenticated, config.events, handleActivity, resetTimer, clearTimers]);

  /**
   * Handle visibility change (tab switching)
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && !showWarning) {
        // Check if we've been inactive too long while tab was hidden
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime >= config.timeout) {
          logout();
        } else if (inactiveTime >= config.timeout - config.warningTime) {
          // Show warning if we're in the warning window
          showWarningModal();
        } else {
          // Reset timer if still within safe period
          resetTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, showWarning, config.timeout, config.warningTime, logout, showWarningModal, resetTimer]);

  return {
    timeRemaining,
    showWarning,
    resetTimer,
    logout,
    stayActive,
  };
}
