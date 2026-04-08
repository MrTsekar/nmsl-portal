"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Eye, Lock, RefreshCcw, XCircle, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AssignDoctorDialog } from "@/components/admin/assign-doctor-dialog";
import { RescheduleAppointmentDialog } from "@/components/admin/reschedule-appointment-dialog";
import { AuditStatistics } from "@/components/admin/audit-statistics";
import { adminApi } from "@/lib/api/admin.api";
import { useAppointments, useDoctors } from "@/hooks/use-app-data";
import { useAuthStore } from "@/store/auth-store";
import type { Appointment, AppointmentStatus } from "@/types";

const terminalStatuses: AppointmentStatus[] = ["completed", "rejected", "no-show"];

function formatAppointmentDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function canReschedule(status: AppointmentStatus) {
  return !terminalStatuses.includes(status);
}

function canReject(status: AppointmentStatus) {
  return !["rejected", "completed", "no-show"].includes(status);
}

function canAccept(status: AppointmentStatus) {
  return !["confirmed", "completed", "rejected", "no-show"].includes(status);
}

function isLockStale(lockedAt: string | undefined): boolean {
  if (!lockedAt) return false;
  const lockTime = new Date(lockedAt).getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  return (now - lockTime) > thirtyMinutes;
}

function getLockDuration(lockedAt: string | undefined): string {
  if (!lockedAt) return "";
  const lockTime = new Date(lockedAt).getTime();
  const now = Date.now();
  const diffMs = now - lockTime;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} mins ago`;
}

function getTimeRemaining(lockedAt: string | undefined): { display: string; totalMinutes: number; tooltip: string } {
  if (!lockedAt) return { display: "00:00", totalMinutes: 0, tooltip: "" };
  
  const lockTime = new Date(lockedAt).getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  const elapsed = now - lockTime;
  const remaining = thirtyMinutes - elapsed;
  
  if (remaining <= 0) {
    return { display: "00:00", totalMinutes: 0, tooltip: "Lock expired" };
  }
  
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const tooltip = `This appointment will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  return { display, totalMinutes: minutes, tooltip };
}

export default function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const appointments = useAppointments();
  const doctors = useDoctors();
  const { user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [assignTarget, setAssignTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [lockedAppointmentId, setLockedAppointmentId] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [, setTimerTick] = useState(0); // Force re-render for countdown timer

  // Update timer every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const lockMutation = useMutation({
    mutationFn: ({ id, officerEmail, isAdmin }: { id: string; officerEmail: string; isAdmin?: boolean }) =>
      adminApi.lockAppointment(id, officerEmail, isAdmin),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setLockedAppointmentId(id);
      setLockError(null); // Clear any previous errors
    },
    onError: (error: any) => {
      setLockError(error.message || "Failed to lock appointment. It may be locked by another officer.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] }); // Refresh to get latest state
      setTimeout(() => setLockError(null), 5000); // Clear error after 5 seconds
    },
  });

  const unlockMutation = useMutation({
    mutationFn: ({ id, officerEmail }: { id: string; officerEmail: string }) =>
      adminApi.unlockAppointment(id, officerEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setLockedAppointmentId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: "confirmed" | "rejected" }) =>
      adminApi.updateAppointmentStatus(id, nextStatus),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Auto-unlock after action
      if (user?.email) {
        unlockMutation.mutate({ id, officerEmail: user.email });
      }
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, doctorId, timeSlot }: { id: string; doctorId: string; timeSlot: string }) =>
      adminApi.assignDoctor(id, doctorId, timeSlot),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setAssignTarget(null);
      // Auto-unlock after action
      if (user?.email) {
        unlockMutation.mutate({ id, officerEmail: user.email });
      }
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (payload: { id: string; date: string; time: string; doctorId: string; rescheduleReason?: string }) =>
      adminApi.rescheduleAppointment(payload.id, {
        date: payload.date,
        time: payload.time,
        doctorId: payload.doctorId,
        rescheduleReason: payload.rescheduleReason,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setRescheduleTarget(null);
      // Auto-unlock after action
      if (user?.email) {
        unlockMutation.mutate({ id, officerEmail: user.email });
      }
    },
  });

  const filteredAppointments = useMemo(() => {
    const data = appointments.data ?? [];
    const query = search.trim().toLowerCase();

    // Hide processed appointments - they should only appear in audit
    const processedStatuses: AppointmentStatus[] = ["confirmed", "rejected", "rescheduled", "completed", "no-show"];
    
    return data.filter((item) => {
      // Exclude processed appointments from active management view
      if (processedStatuses.includes(item.status)) {
        return false;
      }

      const statusMatch = status === "all" || item.status === status;
      if (!statusMatch) return false;
      if (!query) return true;

      return (
        item.id.toLowerCase().includes(query) ||
        item.patientName.toLowerCase().includes(query) ||
        item.doctorName.toLowerCase().includes(query) ||
        item.specialty.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.patientEmail ?? "").toLowerCase().includes(query) ||
        (item.patientPhone ?? "").toLowerCase().includes(query)
      );
    });
  }, [appointments.data, search, status]);

  const handleAssignDoctor = (doctorId: string, timeSlot: string) => {
    if (!assignTarget) return;
    assignMutation.mutate({
      id: assignTarget.id,
      doctorId,
      timeSlot,
    });
  };

  const handleReschedule = (date: string, time: string, doctorId: string, reason?: string) => {
    if (!rescheduleTarget) return;
    rescheduleMutation.mutate({
      id: rescheduleTarget.id,
      date,
      time,
      doctorId,
      rescheduleReason: reason,
    });
  };

  const handleLockToggle = (appointmentId: string) => {
    if (!user?.email) return;

    // Get fresh appointment data to check current lock status
    const appointment = appointments.data?.find(apt => apt.id === appointmentId);
    const isAdmin = user?.role === "admin";
    
    if (lockedAppointmentId === appointmentId) {
      // Unlock current appointment
      unlockMutation.mutate({ id: appointmentId, officerEmail: user.email });
    } else {
      // Check if already locked by someone else (race condition check)
      // Admins can override any lock, officers cannot
      if (appointment?.lockedBy && appointment.lockedBy !== user.email && !isAdmin) {
        setLockError(`This appointment is already being processed by ${appointment.lockedBy}`);
        setTimeout(() => setLockError(null), 5000);
        return;
      }

      // Show info if admin is taking over a locked appointment
      if (isAdmin && appointment?.lockedBy && appointment.lockedBy !== user.email) {
        console.log(`Admin override: Taking over from ${appointment.lockedBy}`);
      }

      // Unlock previous if any, then lock new one
      if (lockedAppointmentId) {
        unlockMutation.mutate({ id: lockedAppointmentId, officerEmail: user.email });
      }
      lockMutation.mutate({ id: appointmentId, officerEmail: user.email, isAdmin });
    }
  };

  // Auto-unlock stale locks (>30 minutes)
  useEffect(() => {
    const checkStaleLocks = () => {
      const data = appointments.data ?? [];
      data.forEach((appointment) => {
        // Only unlock appointments locked by current user that are stale
        if (
          appointment.lockedBy === user?.email &&
          appointment.lockedAt &&
          isLockStale(appointment.lockedAt)
        ) {
          console.log(`Auto-unlocking stale lock for appointment ${appointment.id}`);
          if (user?.email) {
            unlockMutation.mutate({ id: appointment.id, officerEmail: user.email });
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkStaleLocks, 60000);
    
    // Also check immediately
    checkStaleLocks();

    return () => clearInterval(interval);
  }, [appointments.data, user?.email]);

  // Clear lock error when data refreshes (someone else may have unlocked)
  useEffect(() => {
    if (appointments.dataUpdatedAt && lockError) {
      // Check if the conflicted appointment is now available
      const lockedAppointment = appointments.data?.find(
        apt => apt.lockedBy && apt.lockedBy !== user?.email
      );
      if (!lockedAppointment) {
        setLockError(null);
      }
    }
  }, [appointments.dataUpdatedAt, appointments.data, user?.email]);

  const isAppointmentLocked = (appointment: Appointment) => {
    return appointment.lockedBy && appointment.lockedBy !== user?.email;
  };

  const canInteract = (appointment: Appointment) => {
    return lockedAppointmentId === appointment.id && !isAppointmentLocked(appointment);
  };

  const isUpdating = statusMutation.isPending || rescheduleMutation.isPending || assignMutation.isPending;

  // Calculate counts for tabs
  const pendingCount = useMemo(() => {
    const data = appointments.data ?? [];
    const processedStatuses: AppointmentStatus[] = ["confirmed", "rejected", "rescheduled", "completed", "no-show"];
    return data.filter(apt => !processedStatuses.includes(apt.status)).length;
  }, [appointments.data]);

  const processedCount = useMemo(() => {
    const data = appointments.data ?? [];
    const processedStatuses: AppointmentStatus[] = ["confirmed", "rejected", "rescheduled", "completed", "no-show"];
    return data.filter(apt => processedStatuses.includes(apt.status)).length;
  }, [appointments.data]);

  if (appointments.isLoading) return <LoadState />;
  if (appointments.isError) return <ErrorState message="Could not load appointments." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage pending appointments and track completed ones in the Audit tab"
      />

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="appointments" className="gap-2 text-base">
            <CheckCircle2 className="h-4 w-4" />
            Appointment Management
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Audit & Statistics
            {processedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-green-600 dark:bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                {processedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <SectionCard title="Appointment Management">
        <div className="space-y-4">
          {/* Real-time sync indicator - subtle */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${appointments.isFetching ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span>
                {appointments.isFetching ? 'Syncing...' : 'Live · Updates every 15s'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {appointments.dataUpdatedAt && (
                <span>
                  {new Date(appointments.dataUpdatedAt).toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => appointments.refetch()}
                disabled={appointments.isFetching}
              >
                <RefreshCcw className={`h-3 w-3 ${appointments.isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Lock error - subtle inline */}
          {lockError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span>{lockError}</span>
            </div>
          )}

          <FilterBar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />

          {filteredAppointments.length === 0 ? (
            <EmptyState
              title="No appointments found"
              description="Try changing your filters or search terms."
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredAppointments.map((appointment) => {
                  const locked = isAppointmentLocked(appointment);
                  const canAct = canInteract(appointment);
                  return (
                  <div key={appointment.id} className={`rounded-xl border border-border p-4 space-y-3 ${locked ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <input
                          type="radio"
                          name="appointment-select-mobile"
                          checked={lockedAppointmentId === appointment.id}
                          onChange={() => handleLockToggle(appointment.id)}
                          disabled={locked}
                          className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.patientEmail ?? "No email provided"}</p>
                            {locked && appointment.lockedAt && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Locked by {appointment.lockedBy} · {getLockDuration(appointment.lockedAt)}
                              </p>
                            )}
                            {lockedAppointmentId === appointment.id && appointment.lockedAt && (() => {
                              const timeInfo = getTimeRemaining(appointment.lockedAt);
                              const isUrgent = timeInfo.totalMinutes < 5;
                              return (
                                <p 
                                  className={`text-xs mt-1 flex items-center gap-1 font-mono ${
                                    isUrgent 
                                      ? 'text-red-600 dark:text-red-400 font-semibold' 
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`}
                                  title={timeInfo.tooltip}
                                >
                                  <Clock3 className={`h-3 w-3 ${isUrgent ? 'animate-pulse' : ''}`} />
                                  {timeInfo.display}
                                </p>
                              );
                            })()}
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Doctor</p>
                      <p className="text-right font-medium">{appointment.doctorName}</p>
                      <p className="text-muted-foreground">Date</p>
                      <p className="text-right font-medium">{formatAppointmentDate(appointment.date)}</p>
                      <p className="text-muted-foreground">Time</p>
                      <p className="text-right font-medium">{appointment.time}</p>
                      <p className="text-muted-foreground">Visit Type</p>
                      <p className="text-right font-medium">{appointment.visitType ?? "-"}</p>
                    </div>

                    {appointment.isUrgent ? <Badge variant="warning">Urgent</Badge> : null}

                    <div className={`grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-wrap transition-opacity ${!canAct ? 'opacity-30 pointer-events-none blur-[0.5px]' : ''}`}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setAssignTarget(appointment)}
                        disabled={!canAccept(appointment.status) || isUpdating || !canAct}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "rejected" })}
                        disabled={!canReject(appointment.status) || isUpdating || !canAct}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRescheduleTarget(appointment)}
                        disabled={!canReschedule(appointment.status) || isUpdating || !canAct}
                      >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70 dark:bg-slate-900/40">
                    <tr>
                      <th className="text-center px-3 py-2 w-12">Select</th>
                      <th className="text-left px-3 py-2">Patient</th>
                      <th className="text-left px-3 py-2">Visit</th>
                      <th className="text-left px-3 py-2">Date & Time</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Details</th>
                      <th className="text-left px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => {
                      const locked = isAppointmentLocked(appointment);
                      const canAct = canInteract(appointment);
                      return (
                      <tr key={appointment.id} className={`border-t border-border align-top ${locked ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="radio"
                            name="appointment-select"
                            checked={lockedAppointmentId === appointment.id}
                            onChange={() => handleLockToggle(appointment.id)}
                            disabled={locked}
                            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-muted-foreground text-xs">{appointment.patientEmail ?? "No email"}</p>
                          <p className="text-muted-foreground text-xs">{appointment.patientPhone ?? "No phone"}</p>
                          {locked && appointment.lockedAt && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Locked by {appointment.lockedBy} · {getLockDuration(appointment.lockedAt)}
                            </p>
                          )}
                          {lockedAppointmentId === appointment.id && appointment.lockedAt && (() => {
                            const timeInfo = getTimeRemaining(appointment.lockedAt);
                            const isUrgent = timeInfo.totalMinutes < 5;
                            return (
                              <p 
                                className={`text-xs mt-1 flex items-center gap-1 font-mono ${
                                  isUrgent 
                                    ? 'text-red-600 dark:text-red-400 font-semibold' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}
                                title={timeInfo.tooltip}
                              >
                                <Clock3 className={`h-3 w-3 ${isUrgent ? 'animate-pulse' : ''}`} />
                                {timeInfo.display}
                              </p>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3">
                          <p>{appointment.visitType ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                          <p className="text-xs text-muted-foreground">{appointment.location}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium">{formatAppointmentDate(appointment.date)}</p>
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={appointment.status} />
                            {appointment.isUrgent ? <Badge variant="warning">Urgent</Badge> : null}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="line-clamp-2 text-xs text-muted-foreground max-w-64">
                            {appointment.reasonForVisit ?? "No reason provided"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-8 px-2"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View details
                          </Button>
                        </td>
                        <td className="px-3 py-3 min-w-[280px]">
                          <div className={`grid grid-cols-3 gap-2 transition-opacity ${!canAct ? 'opacity-30 pointer-events-none blur-[0.5px]' : ''}`}>
                            <Button
                              size="sm"
                              onClick={() => setAssignTarget(appointment)}
                              disabled={!canAccept(appointment.status) || isUpdating || !canAct}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                              onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "rejected" })}
                              disabled={!canReject(appointment.status) || isUpdating || !canAct}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRescheduleTarget(appointment)}
                              disabled={!canReschedule(appointment.status) || isUpdating || !canAct}
                            >
                              Reschedule
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </SectionCard>
      </TabsContent>

      <TabsContent value="audit">
        <AuditStatistics />
      </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedAppointment)} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Submitted information for admin review.</DialogDescription>
          </DialogHeader>

          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-4 text-sm">
                <p className="text-muted-foreground">Patient</p>
                <p className="text-right font-medium">{selectedAppointment.patientName}</p>
                <p className="text-muted-foreground">Email</p>
                <p className="text-right font-medium">{selectedAppointment.patientEmail ?? "-"}</p>
                <p className="text-muted-foreground">Phone</p>
                <p className="text-right font-medium">{selectedAppointment.patientPhone ?? "-"}</p>
                <p className="text-muted-foreground">Visit Type</p>
                <p className="text-right font-medium">{selectedAppointment.visitType ?? "-"}</p>
                <p className="text-muted-foreground">Location</p>
                <p className="text-right font-medium">{selectedAppointment.location}</p>
                <p className="text-muted-foreground">Specialty</p>
                <p className="text-right font-medium">{selectedAppointment.specialty}</p>
                <p className="text-muted-foreground">Doctor</p>
                <p className="text-right font-medium">{selectedAppointment.doctorName}</p>
                <p className="text-muted-foreground">Date</p>
                <p className="text-right font-medium">{formatAppointmentDate(selectedAppointment.date)}</p>
                <p className="text-muted-foreground">Time</p>
                <p className="text-right font-medium">{selectedAppointment.time}</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Reason for Visit</p>
                <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                  {selectedAppointment.reasonForVisit ?? "No reason provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Additional Comment</p>
                <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                  {selectedAppointment.additionalComment ?? "No additional comment."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAppointment.status} />
                {selectedAppointment.isUrgent ? <Badge variant="warning">Urgent</Badge> : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AssignDoctorDialog
        open={Boolean(assignTarget)}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        appointment={assignTarget}
        doctors={doctors.data ?? []}
        onAssign={handleAssignDoctor}
      />

      <RescheduleAppointmentDialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => !open && setRescheduleTarget(null)}
        appointment={rescheduleTarget}
        doctors={doctors.data ?? []}
        onReschedule={handleReschedule}
      />

      {isUpdating ? (
        <div className="flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 dark:text-amber-300 dark:bg-amber-900/10 dark:border-amber-700/40">
          <Clock3 className="h-4 w-4" />
          Updating appointment...
        </div>
      ) : null}
    </div>
  );
}
