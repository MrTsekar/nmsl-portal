"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appointmentsApi } from "@/lib/api/appointments.api";
import { doctorsApi } from "@/lib/api/doctors.api";
import type { Appointment, Role, DoctorAvailability } from "@/types";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().optional(),
}).refine((data) => {
  // Validate that the selected date/time is in the future
  const selectedDateTime = new Date(`${data.date}T${data.time}`);
  return selectedDateTime > new Date();
}, {
  message: "Selected date and time must be in the future",
  path: ["date"],
});

type FormValues = z.infer<typeof schema>;

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  userRole?: Role;
  onSuccess?: () => void;
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  userRole,
  onSuccess,
}: RescheduleAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const isPatient = userRole === "patient";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: appointment?.date || "",
      time: appointment?.time || "",
      reason: "",
    },
  });

  const selectedDate = form.watch("date");

  // Fetch doctor availability when dialog opens for patients
  useEffect(() => {
    if (open && appointment && isPatient) {
      setLoadingAvailability(true);
      doctorsApi.getAvailabilityByName(appointment.doctorName)
        .then((data) => {
          setAvailability(data);
          setLoadingAvailability(false);
        })
        .catch(() => {
          setError("Failed to load doctor availability");
          setLoadingAvailability(false);
        });
    }
  }, [open, appointment, isPatient]);

  // Calculate available time slots when date changes for patients
  useEffect(() => {
    if (isPatient && availability && selectedDate) {
      const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      
      // Check if the selected day is available
      if (!availability.availableDays.includes(dayOfWeek as any)) {
        setAvailableTimeSlots([]);
        return;
      }

      // Filter out booked slots for the selected date
      const bookedTimes = availability.bookedSlots
        .filter((slot) => slot.date === selectedDate)
        .map((slot) => slot.time);

      const available = availability.timeSlots
        .filter((slot) => !bookedTimes.includes(slot.start))
        .map((slot) => slot.start);

      setAvailableTimeSlots(available);
    }
  }, [isPatient, availability, selectedDate]);

  const onSubmit = async (values: FormValues) => {
    if (!appointment) return;

    // For patients, validate availability before submitting
    if (isPatient && availability) {
      try {
        const result = await doctorsApi.checkAvailability(
          availability.doctorId,
          values.date,
          values.time
        );
        if (!result.available) {
          setError("This time slot is no longer available. Please select another time.");
          return;
        }
      } catch (err) {
        setError("Failed to verify availability. Please try again.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await appointmentsApi.reschedule(appointment.id, values);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reschedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens with new appointment
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && appointment) {
      form.reset({
        date: appointment.date,
        time: appointment.time,
        reason: "",
      });
      setError(null);
      setAvailability(null);
      setAvailableTimeSlots([]);
    }
    onOpenChange(newOpen);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Appointment Details */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">Current Appointment:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <div><strong>Patient:</strong> {appointment.patientName}</div>
              <div><strong>Doctor:</strong> {appointment.doctorName}</div>
              <div><strong>Date:</strong> {appointment.date}</div>
              <div><strong>Time:</strong> {appointment.time}</div>
              <div><strong>Type:</strong> {appointment.consultationType === "telehealth" ? "Telemedicine" : "Physical"}</div>
            </div>
          </div>

          {/* Reschedule Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">New Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                  disabled={isSubmitting || loadingAvailability}
                  min={new Date().toISOString().split("T")[0]}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
                {isPatient && selectedDate && availableTimeSlots.length === 0 && !loadingAvailability && (
                  <p className="text-sm text-amber-600">
                    No available slots on this date
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">New Time *</Label>
                {isPatient ? (
                  <>
                    <Select
                      value={form.watch("time")}
                      onValueChange={(value) => form.setValue("time", value)}
                      disabled={isSubmitting || loadingAvailability || !selectedDate || availableTimeSlots.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingAvailability ? "Loading..." : "Select time"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDate && availableTimeSlots.length === 0 && !loadingAvailability && (
                      <p className="text-sm text-muted-foreground">
                        Please select a different date
                      </p>
                    )}
                  </>
                ) : (
                  <Input
                    id="time"
                    type="time"
                    {...form.register("time")}
                    disabled={isSubmitting}
                  />
                )}
                {form.formState.errors.time && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.time.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Conflict with another appointment, emergency, etc."
                {...form.register("reason")}
                disabled={isSubmitting}
                rows={3}
              />
              {form.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
