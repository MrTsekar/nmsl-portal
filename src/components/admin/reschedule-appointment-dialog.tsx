"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Stethoscope, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import type { Appointment, DayOfWeek, DoctorAvailabilitySchedule } from "@/types";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  qualifications?: string;
  availabilitySchedule?: DoctorAvailabilitySchedule;
}

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  doctors: Doctor[];
  onReschedule?: (date: string, time: string, doctorId: string, reason?: string) => void;
}

const DAYS_MAP: Record<string, DayOfWeek> = {
  "0": "sunday",
  "1": "monday",
  "2": "tuesday",
  "3": "wednesday",
  "4": "thursday",
  "5": "friday",
  "6": "saturday",
};

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const nextHour = currentMin + 30 >= 60 ? currentHour + 1 : currentHour;
    const nextMin = (currentMin + 30) % 60;

    const slotStart = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
    const slotEnd = `${String(nextHour).padStart(2, "0")}:${String(nextMin).padStart(2, "0")}`;

    slots.push(`${slotStart} - ${slotEnd}`);

    currentHour = nextHour;
    currentMin = nextMin;
  }

  return slots;
}

function isTimeInSlot(requestedTime: string, slotStart: string, slotEnd: string): boolean {
  const [reqHour, reqMin] = requestedTime.split(":").map(Number);
  const [startHour, startMin] = slotStart.split(":").map(Number);
  const [endHour, endMin] = slotEnd.split(":").map(Number);

  const reqMinutes = reqHour * 60 + reqMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return reqMinutes >= startMinutes && reqMinutes < endMinutes;
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  doctors,
  onReschedule,
}: RescheduleAppointmentDialogProps) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");

  // Reset when dialog opens
  useEffect(() => {
    if (open && appointment) {
      setNewDate(appointment.date);
      setNewTime(appointment.time);
      setSelectedDoctorId("");
      setSelectedTimeSlot("");
      setReason(appointment.rescheduleReason ?? "");
    }
  }, [open, appointment]);

  // Filter doctors by specialty and availability on new date
  const availableDoctors = useMemo(() => {
    if (!appointment || !newDate) return [];

    return doctors.filter((doctor) => {
      // Must match the appointment's specialty
      if (doctor.specialty !== appointment.specialty) return false;

      // Must have availability schedule configured
      const schedule = doctor.availabilitySchedule;
      if (!schedule || !schedule.days || schedule.days.length === 0) return false;

      // Check if doctor is available on the new date
      const appointmentDate = new Date(newDate);
      const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];
      return schedule.days.includes(dayOfWeek);
    });
  }, [doctors, appointment, newDate]);

  // Get available time slots for selected doctor
  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctorId || !newDate) return [];

    const doctor = availableDoctors.find((d) => d.id === selectedDoctorId);
    if (!doctor?.availabilitySchedule) return [];

    const schedule = doctor.availabilitySchedule;
    const appointmentDate = new Date(newDate);
    const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];

    if (!schedule.days.includes(dayOfWeek)) return [];

    if (schedule.useUniformTime && schedule.uniformTime) {
      return generateTimeSlots(schedule.uniformTime.start, schedule.uniformTime.end);
    } else if (schedule.customTimes && schedule.customTimes[dayOfWeek]) {
      const dayTime = schedule.customTimes[dayOfWeek];
      return generateTimeSlots(dayTime.start, dayTime.end);
    }

    return [];
  }, [selectedDoctorId, newDate, availableDoctors]);

  // Check if new time is available with any doctor
  const newTimeAvailability = useMemo(() => {
    if (!appointment || !newDate || !newTime) return { available: false, matchingDoctors: [] };

    const matchingDoctors = availableDoctors.filter((doctor) => {
      const schedule = doctor.availabilitySchedule;
      if (!schedule) return false;

      const appointmentDate = new Date(newDate);
      const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];

      let timeRange: { start: string; end: string } | null = null;

      if (schedule.useUniformTime && schedule.uniformTime) {
        timeRange = schedule.uniformTime;
      } else if (schedule.customTimes && schedule.customTimes[dayOfWeek]) {
        timeRange = schedule.customTimes[dayOfWeek];
      }

      if (!timeRange) return false;

      const slots = generateTimeSlots(timeRange.start, timeRange.end);
      return slots.some((slot) => {
        const [start, end] = slot.split(" - ");
        return isTimeInSlot(newTime, start, end);
      });
    });

    return {
      available: matchingDoctors.length > 0,
      matchingDoctors: matchingDoctors.map((d) => d.id),
    };
  }, [newDate, newTime, availableDoctors, appointment]);

  // Get the matching time slot
  const matchingTimeSlot = useMemo(() => {
    if (!newTime || availableTimeSlots.length === 0) return null;

    return availableTimeSlots.find((slot) => {
      const [start, end] = slot.split(" - ");
      return isTimeInSlot(newTime, start, end);
    });
  }, [newTime, availableTimeSlots]);

  const selectedDoctor = availableDoctors.find((d) => d.id === selectedDoctorId);

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTimeSlot("");
    
    if (matchingTimeSlot && newTimeAvailability.matchingDoctors.includes(doctorId)) {
      setSelectedTimeSlot(matchingTimeSlot);
    }
  };

  const handleReschedule = () => {
    if (!newDate || !selectedTimeSlot || !selectedDoctorId) return;
    
    // Extract just the time from the slot (e.g., "09:00 - 09:30" -> "09:00")
    const timeOnly = selectedTimeSlot.split(" - ")[0];
    onReschedule?.(newDate, timeOnly, selectedDoctorId, reason.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setNewDate("");
    setNewTime("");
    setSelectedDoctorId("");
    setSelectedTimeSlot("");
    setReason("");
    onOpenChange(false);
  };

  const newDay = newDate 
    ? new Date(newDate).toLocaleDateString("en-US", { weekday: "long" })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date/time and assign an available doctor
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="flex-1 overflow-y-auto space-y-5 py-2">
            {/* Current Appointment Info */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm font-semibold">{appointment.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <p className="text-sm font-semibold">{appointment.specialty}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Date & Time</p>
                  <p className="text-sm font-semibold">
                    {formatAppointmentDate(appointment.date)} at {appointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold">{appointment.location}</p>
                </div>
              </div>
            </div>

            {/* New Date & Time Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select New Date & Time
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-date">New Date</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => {
                      setNewDate(e.target.value);
                      setSelectedDoctorId("");
                      setSelectedTimeSlot("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-time">Preferred Time</Label>
                  <Input
                    id="new-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => {
                      setNewTime(e.target.value);
                      setSelectedDoctorId("");
                      setSelectedTimeSlot("");
                    }}
                  />
                </div>
              </div>
              {newDate && newDay && (
                <p className="text-xs text-muted-foreground">
                  Selected: {newDay}, {new Date(newDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>

            {newDate && newTime && (
              <>
                {/* Time Availability Status */}
                <div className={`rounded-lg border p-4 ${
                  newTimeAvailability.available
                    ? "border-green-300 bg-green-50 dark:bg-green-950/20"
                    : "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      newTimeAvailability.available
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-amber-100 dark:bg-amber-900/40"
                    }`}>
                      {newTimeAvailability.available ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">
                        New Time: {newTime}
                      </p>
                      {newTimeAvailability.available ? (
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✓ {newTimeAvailability.matchingDoctors.length} doctor(s) available at this time
                        </p>
                      ) : (
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          No doctors available at this time. Please select a different time or view available slots below.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {availableDoctors.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                      <Stethoscope className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-semibold mb-2">No Doctors Available</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No {appointment.specialty} doctors are available on {newDay}. Please select a different date.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Doctor Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Select Doctor ({availableDoctors.length} available for {appointment.specialty})
                      </Label>
                      
                      <div className="grid gap-3">
                        {availableDoctors.map((doctor) => {
                          const canAccommodateTime = newTimeAvailability.matchingDoctors.includes(doctor.id);
                          return (
                            <button
                              key={doctor.id}
                              type="button"
                              onClick={() => handleDoctorSelect(doctor.id)}
                              className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                                "hover:border-primary/50 hover:bg-accent/50"
                              } ${
                                selectedDoctorId === doctor.id
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <p className="font-semibold text-base">{doctor.name}</p>
                                    {selectedDoctorId === doctor.id && (
                                      <CheckCircle2 className="h-5 w-5 text-primary" />
                                    )}
                                    {canAccommodateTime && (
                                      <Badge variant="default" className="text-xs bg-green-600">
                                        Available at {newTime}
                                      </Badge>
                                    )}
                                  </div>
                                  {doctor.qualifications && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {doctor.qualifications}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {doctor.specialty}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {doctor.location}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDoctorId && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Confirm Time Slot
                        </Label>

                        {availableTimeSlots.length === 0 ? (
                          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                              Doctor not available on {newDay}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {matchingTimeSlot && (
                              <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 p-3">
                                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                  ✓ Your preferred time is available
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {availableTimeSlots.map((slot) => {
                                const isPreferredSlot = slot === matchingTimeSlot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTimeSlot(slot)}
                                    className={`relative rounded-md border px-3 py-2.5 text-sm font-medium transition-all ${
                                      isPreferredSlot && selectedTimeSlot !== slot
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100"
                                        : ""
                                    } ${
                                      selectedTimeSlot === slot
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border hover:border-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    {slot}
                                    {isPreferredSlot && (
                                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              30-minute appointment slots for {newDay}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Reason */}
            {newDate && (
              <div className="space-y-2">
                <Label htmlFor="reschedule-reason">Reason for Rescheduling (Optional)</Label>
                <Textarea
                  id="reschedule-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this appointment is being rescheduled..."
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReschedule}
            disabled={!newDate || !selectedDoctorId || !selectedTimeSlot}
          >
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
