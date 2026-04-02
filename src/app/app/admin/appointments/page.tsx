"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock3, Eye, RefreshCcw, XCircle } from "lucide-react";
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
import { adminApi } from "@/lib/api/admin.api";
import { useAppointments } from "@/hooks/use-app-data";
import type { Appointment, AppointmentStatus } from "@/types";

const terminalStatuses: AppointmentStatus[] = ["completed", "cancelled", "rejected", "no-show"];

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
  return !["rejected", "cancelled", "completed", "no-show"].includes(status);
}

function canAccept(status: AppointmentStatus) {
  return !["confirmed", "completed", "cancelled", "rejected", "no-show"].includes(status);
}

export default function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const appointments = useAppointments();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: "confirmed" | "rejected" }) =>
      adminApi.updateAppointmentStatus(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (payload: { id: string; date: string; time: string; rescheduleReason?: string }) =>
      adminApi.rescheduleAppointment(payload.id, {
        date: payload.date,
        time: payload.time,
        rescheduleReason: payload.rescheduleReason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setRescheduleTarget(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleReason("");
    },
  });

  const filteredAppointments = useMemo(() => {
    const data = appointments.data ?? [];
    const query = search.trim().toLowerCase();

    return data.filter((item) => {
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

  const submitReschedule = () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;

    rescheduleMutation.mutate({
      id: rescheduleTarget.id,
      date: rescheduleDate,
      time: rescheduleTime,
      rescheduleReason: rescheduleReason.trim() || undefined,
    });
  };

  const isUpdating = statusMutation.isPending || rescheduleMutation.isPending;

  if (appointments.isLoading) return <LoadState />;
  if (appointments.isError) return <ErrorState message="Could not load appointments." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Review submitted appointment details and take action"
      />

      <SectionCard title="Appointment Management">
        <div className="space-y-4">
          <FilterBar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />

          {filteredAppointments.length === 0 ? (
            <EmptyState
              title="No appointments found"
              description="Try changing your filters or search terms."
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.patientEmail ?? "No email provided"}</p>
                      </div>
                      <StatusBadge status={appointment.status} />
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

                    <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "confirmed" })}
                        disabled={!canAccept(appointment.status) || isUpdating}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "rejected" })}
                        disabled={!canReject(appointment.status) || isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRescheduleTarget(appointment);
                          setRescheduleDate(appointment.date);
                          setRescheduleTime(appointment.time);
                          setRescheduleReason(appointment.rescheduleReason ?? "");
                        }}
                        disabled={!canReschedule(appointment.status) || isUpdating}
                      >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70 dark:bg-slate-900/40">
                    <tr>
                      <th className="text-left px-3 py-2">Patient</th>
                      <th className="text-left px-3 py-2">Visit</th>
                      <th className="text-left px-3 py-2">Date & Time</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Details</th>
                      <th className="text-left px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t border-border align-top">
                        <td className="px-3 py-3">
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-muted-foreground text-xs">{appointment.patientEmail ?? "No email"}</p>
                          <p className="text-muted-foreground text-xs">{appointment.patientPhone ?? "No phone"}</p>
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
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              size="sm"
                              onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "confirmed" })}
                              disabled={!canAccept(appointment.status) || isUpdating}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                              onClick={() => statusMutation.mutate({ id: appointment.id, nextStatus: "rejected" })}
                              disabled={!canReject(appointment.status) || isUpdating}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRescheduleTarget(appointment);
                                setRescheduleDate(appointment.date);
                                setRescheduleTime(appointment.time);
                                setRescheduleReason(appointment.rescheduleReason ?? "");
                              }}
                              disabled={!canReschedule(appointment.status) || isUpdating}
                            >
                              Reschedule
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </SectionCard>

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

      <Dialog open={Boolean(rescheduleTarget)} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Set a new date and time for this appointment.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
              <p className="font-semibold">{rescheduleTarget?.patientName}</p>
              <p className="text-muted-foreground">Current: {rescheduleTarget?.date} at {rescheduleTarget?.time}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-date">New date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-time">New time</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-reason">Reason</Label>
              <Textarea
                id="reschedule-reason"
                value={rescheduleReason}
                onChange={(event) => setRescheduleReason(event.target.value)}
                placeholder="Optional note for why this appointment was rescheduled"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={submitReschedule}
                disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Confirm reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isUpdating ? (
        <div className="flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 dark:text-amber-300 dark:bg-amber-900/10 dark:border-amber-700/40">
          <Clock3 className="h-4 w-4" />
          Updating appointment...
        </div>
      ) : null}
    </div>
  );
}
