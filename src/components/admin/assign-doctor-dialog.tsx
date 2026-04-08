"use client";

import { useState, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Stethoscope, MapPin, CheckCircle2 } from "lucide-react";
import type { Appointment, DayOfWeek, DoctorAvailabilitySchedule } from "@/types";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  qualifications: string;
  availabilitySchedule?: DoctorAvailabilitySchedule;
}

interface AssignDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  doctors: Doctor[];
  onAssign?: (doctorId: string, timeSlot: string) => void;
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

export function AssignDoctorDialog({
  open,
  onOpenChange,
  appointment,
  doctors,
  onAssign,
}: AssignDoctorDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // Check if patient's requested time is within a time slot
  const isTimeInSlot = (requestedTime: string, slotStart: string, slotEnd: string): boolean => {
    const [reqHour, reqMin] = requestedTime.split(":").map(Number);
    const [startHour, startMin] = slotStart.split(":").map(Number);
    const [endHour, endMin] = slotEnd.split(":").map(Number);

    const reqMinutes = reqHour * 60 + reqMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return reqMinutes >= startMinutes && reqMinutes < endMinutes;
  };

  // Filter doctors by specialty and availability
  const availableDoctors = useMemo(() => {
    if (!appointment) return [];

    return doctors.filter((doctor) => {
      // Must match the appointment's specialty
      if (doctor.specialty !== appointment.specialty) return false;

      // Must have availability schedule configured
      const schedule = doctor.availabilitySchedule;
      if (!schedule || !schedule.days || schedule.days.length === 0) return false;

      // Check if doctor is available on the appointment date
      const appointmentDate = new Date(appointment.date);
      const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];
      return schedule.days.includes(dayOfWeek);
    });
  }, [doctors, appointment]);

  // Get time slots for selected doctor
  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctorId || !appointment) return [];

    const doctor = availableDoctors.find((d) => d.id === selectedDoctorId);
    if (!doctor?.availabilitySchedule) return [];

    const schedule = doctor.availabilitySchedule;
    
    // Get the day of week from appointment date
    const appointmentDate = new Date(appointment.date);
    const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];

    // Check if doctor is available on this day
    if (!schedule.days.includes(dayOfWeek)) {
      return [];
    }

    // Generate time slots based on schedule
    if (schedule.useUniformTime && schedule.uniformTime) {
      return generateTimeSlots(schedule.uniformTime.start, schedule.uniformTime.end);
    } else if (schedule.customTimes && schedule.customTimes[dayOfWeek]) {
      const dayTime = schedule.customTimes[dayOfWeek];
      return generateTimeSlots(dayTime.start, dayTime.end);
    }

    return [];
  }, [selectedDoctorId, appointment, availableDoctors]);

  // Check if patient's requested time is available in any doctor's schedule
  const requestedTimeAvailability = useMemo(() => {
    if (!appointment) return { available: false, matchingDoctors: [] };

    const matchingDoctors = availableDoctors.filter((doctor) => {
      const schedule = doctor.availabilitySchedule;
      if (!schedule) return false;

      const appointmentDate = new Date(appointment.date);
      const dayOfWeek = DAYS_MAP[appointmentDate.getDay().toString()];

      let timeRange: { start: string; end: string } | null = null;

      if (schedule.useUniformTime && schedule.uniformTime) {
        timeRange = schedule.uniformTime;
      } else if (schedule.customTimes && schedule.customTimes[dayOfWeek]) {
        timeRange = schedule.customTimes[dayOfWeek];
      }

      if (!timeRange) return false;

      // Generate slots and check if requested time falls within any slot
      const slots = generateTimeSlots(timeRange.start, timeRange.end);
      return slots.some((slot) => {
        const [start, end] = slot.split(" - ");
        return isTimeInSlot(appointment.time, start, end);
      });
    });

    return {
      available: matchingDoctors.length > 0,
      matchingDoctors: matchingDoctors.map((d) => d.id),
    };
  }, [appointment, availableDoctors]);

  // Get the matching time slot for the requested time
  const matchingTimeSlot = useMemo(() => {
    if (!appointment || availableTimeSlots.length === 0) return null;

    return availableTimeSlots.find((slot) => {
      const [start, end] = slot.split(" - ");
      return isTimeInSlot(appointment.time, start, end);
    });
  }, [appointment, availableTimeSlots]);

  const selectedDoctor = availableDoctors.find((d) => d.id === selectedDoctorId);

  const handleAssign = () => {
    if (!selectedDoctorId || !selectedTimeSlot) return;
    onAssign?.(selectedDoctorId, selectedTimeSlot);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDoctorId("");
    setSelectedTimeSlot("");
    onOpenChange(false);
  };

  // Auto-select matching time slot when doctor is selected
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTimeSlot(""); // Reset first
    
    // If the requested time is available for this doctor, auto-select it
    if (matchingTimeSlot && requestedTimeAvailability.matchingDoctors.includes(doctorId)) {
      setSelectedTimeSlot(matchingTimeSlot);
    }
  };

  const appointmentDay = appointment 
    ? new Date(appointment.date).toLocaleDateString("en-US", { weekday: "long" })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign Doctor to Appointment</DialogTitle>
          <DialogDescription>
            Select an available doctor and time slot for this appointment
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="flex-1 overflow-y-auto space-y-5 py-2">
            {/* Appointment Info */}
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="text-sm font-semibold">{appointment.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-semibold">
                      {new Date(appointment.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{appointmentDay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Specialty</p>
                    <p className="text-sm font-semibold">{appointment.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                    <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold">{appointment.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requested Time Status */}
            <div className={`rounded-lg border p-4 ${
              requestedTimeAvailability.available
                ? "border-green-300 bg-green-50 dark:bg-green-950/20"
                : "border-red-300 bg-red-50 dark:bg-red-950/20"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  requestedTimeAvailability.available
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-red-100 dark:bg-red-900/40"
                }`}>
                  <Clock className={`h-5 w-5 ${
                    requestedTimeAvailability.available
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">
                    Requested Time: {appointment.time}
                  </p>
                  {requestedTimeAvailability.available ? (
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ This time is available with {requestedTimeAvailability.matchingDoctors.length} doctor(s). Select a doctor below.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        ✗ No doctors available at the requested time
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Please use the <strong>"Reschedule"</strong> button to select a different date/time when doctors are available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!requestedTimeAvailability.available ? (
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold mb-2">Cannot Accept Appointment</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  The patient's requested time ({appointment.time}) is not available. Use the <strong>Reschedule</strong> button to select a new time that works for available doctors.
                </p>
              </div>
            ) : availableDoctors.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold mb-2">No Available Doctors</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No doctors are available for <strong>{appointment.specialty}</strong> on{" "}
                  <strong>{appointmentDay}</strong>. Please set availability schedules for doctors or choose a different date.
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
                      const canAccommodateTime = requestedTimeAvailability.matchingDoctors.includes(doctor.id);
                      return (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => handleDoctorSelect(doctor.id)}
                          disabled={!canAccommodateTime}
                          className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                            !canAccommodateTime
                              ? "opacity-50 cursor-not-allowed bg-muted/30"
                              : "hover:border-primary/50 hover:bg-accent/50"
                          } ${
                            selectedDoctorId === doctor.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-base">{doctor.name}</p>
                                {selectedDoctorId === doctor.id && (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                )}
                                {canAccommodateTime && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Available at {appointment.time}
                                  </Badge>
                                )}
                                {!canAccommodateTime && (
                                  <Badge variant="secondary" className="text-xs">
                                    Not available at requested time
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {doctor.qualifications}
                              </p>
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
                    <Label htmlFor="time-select" className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Confirm Time Slot
                    </Label>

                    {availableTimeSlots.length === 0 ? (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                          Doctor not available on {appointmentDay}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Please choose a different doctor or reschedule the appointment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {matchingTimeSlot && (
                          <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 p-3 mb-3">
                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                              ✓ Patient's requested time is available
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              The time slot has been auto-selected below
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableTimeSlots.map((slot) => {
                            const isRequestedSlot = slot === matchingTimeSlot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`relative rounded-md border px-3 py-2.5 text-sm font-medium transition-all ${
                                  isRequestedSlot && selectedTimeSlot !== slot
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100"
                                    : ""
                                } ${
                                  selectedTimeSlot === slot
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary hover:bg-primary/5"
                                }`}
                              >
                                {slot}
                                {isRequestedSlot && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          30-minute appointment slots for {appointmentDay}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={
              !requestedTimeAvailability.available ||
              !selectedDoctorId ||
              !selectedTimeSlot ||
              availableTimeSlots.length === 0
            }
          >
            Assign Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
