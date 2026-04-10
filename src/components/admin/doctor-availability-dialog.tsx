"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Power } from "lucide-react";
import type { DoctorAvailabilitySchedule } from "@/types";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
] as const;

type DayId = (typeof DAYS_OF_WEEK)[number]["id"];

interface DoctorAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName: string;
  doctorId: string;
  initialAvailability?: DoctorAvailabilitySchedule;
  onSave?: (availability: DoctorAvailability) => void;
  isSaving?: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  days: DayId[];
  useUniformTime: boolean;
  uniformTime?: { start: string; end: string };
  customTimes?: Record<DayId, { start: string; end: string }>;
}

export function DoctorAvailabilityDialog({
  open,
  onOpenChange,
  doctorName,
  doctorId,
  initialAvailability,
  onSave,
  isSaving = false,
}: DoctorAvailabilityDialogProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDays, setSelectedDays] = useState<DayId[]>([]);
  const [useUniformTime, setUseUniformTime] = useState(true);
  const [uniformStartTime, setUniformStartTime] = useState("09:00");
  const [uniformEndTime, setUniformEndTime] = useState("17:00");
  const [customTimes, setCustomTimes] = useState<Record<DayId, { start: string; end: string }>>({
    monday: { start: "09:00", end: "17:00" },
    tuesday: { start: "09:00", end: "17:00" },
    wednesday: { start: "09:00", end: "17:00" },
    thursday: { start: "09:00", end: "17:00" },
    friday: { start: "09:00", end: "17:00" },
    saturday: { start: "09:00", end: "17:00" },
    sunday: { start: "09:00", end: "17:00" },
  });

  // Initialize state from current availability when dialog opens
  useEffect(() => {
    if (open && initialAvailability) {
      const hasAvailability = initialAvailability.days && initialAvailability.days.length > 0;
      setIsAvailable(hasAvailability);
      setSelectedDays(initialAvailability.days || []);
      setUseUniformTime(initialAvailability.useUniformTime ?? true);
      
      if (initialAvailability.uniformTime) {
        setUniformStartTime(initialAvailability.uniformTime.start);
        setUniformEndTime(initialAvailability.uniformTime.end);
      }
      
      if (initialAvailability.customTimes) {
        setCustomTimes(initialAvailability.customTimes);
      }
    } else if (open && !initialAvailability) {
      // Reset to defaults if no initial availability
      setIsAvailable(false);
      setSelectedDays([]);
      setUseUniformTime(true);
      setUniformStartTime("09:00");
      setUniformEndTime("17:00");
    }
  }, [open, initialAvailability]);

  const allDaysSelected = selectedDays.length === DAYS_OF_WEEK.length;

  const handleToggleAvailability = (checked: boolean) => {
    setIsAvailable(checked);
    // When turning off availability, clear selected days
    if (!checked) {
      setSelectedDays([]);
    }
  };

  const handleToggleDay = (dayId: DayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSelectAll = () => {
    if (allDaysSelected) {
      setSelectedDays([]);
    } else {
      setSelectedDays(DAYS_OF_WEEK.map((d) => d.id));
    }
  };

  const handleCustomTimeChange = (dayId: DayId, field: "start" | "end", value: string) => {
    setCustomTimes((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const availability: DoctorAvailability = {
      doctorId,
      days: isAvailable ? selectedDays : [], // Clear days if not available
      useUniformTime,
      uniformTime: useUniformTime ? { start: uniformStartTime, end: uniformEndTime } : undefined,
      customTimes: !useUniformTime ? customTimes : undefined,
    };

    onSave?.(availability);
    // Don't close dialog here - let parent close it on success
  };

  const handleCancel = () => {
    // Just close the dialog - state will reset on next open via useEffect
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Availability - {doctorName}</DialogTitle>
          <DialogDescription>
            Select available days and set working hours for booking appointments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Availability Toggle */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Booking Availability
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isAvailable
                    ? "Doctor is currently available for bookings"
                    : "Doctor is currently unavailable for bookings"}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>

          {/* Day Selection */}
          {isAvailable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Available Days
                </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {allDaysSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.id}
                  className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                >
                  <Checkbox
                    id={day.id}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleToggleDay(day.id)}
                  />
                  <label
                    htmlFor={day.id}
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>

            {/* Time Selection Mode */}
            {selectedDays.length > 0 && (
              <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <Checkbox
                    id="uniform-time"
                    checked={useUniformTime}
                    onCheckedChange={(checked: boolean) => setUseUniformTime(checked)}
                  />
                  <label
                    htmlFor="uniform-time"
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    Use same time for all selected days
                  </label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <Checkbox
                    id="custom-time"
                    checked={!useUniformTime}
                    onCheckedChange={(checked: boolean) => setUseUniformTime(!checked)}
                  />
                  <label
                    htmlFor="custom-time"
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    Set different times for each day
                  </label>
                </div>
              </div>

              {/* Uniform Time Inputs */}
              {useUniformTime && (
                <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                  <p className="text-sm font-medium">Time for all selected days:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uniform-start">Start Time</Label>
                      <Input
                        id="uniform-start"
                        type="time"
                        value={uniformStartTime}
                        onChange={(e) => setUniformStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uniform-end">End Time</Label>
                      <Input
                        id="uniform-end"
                        type="time"
                        value={uniformEndTime}
                        onChange={(e) => setUniformEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Time Inputs */}
              {!useUniformTime && (
                <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
                  <p className="text-sm font-medium">Set times for each day:</p>
                  <div className="space-y-3">
                    {selectedDays.map((dayId) => {
                      const day = DAYS_OF_WEEK.find((d) => d.id === dayId);
                      return (
                        <div key={dayId} className="space-y-2">
                          <Label className="text-sm font-medium">{day?.label}</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="time"
                              value={customTimes[dayId].start}
                              onChange={(e) =>
                                handleCustomTimeChange(dayId, "start", e.target.value)
                              }
                              placeholder="Start time"
                            />
                            <Input
                              type="time"
                              value={customTimes[dayId].end}
                              onChange={(e) =>
                                handleCustomTimeChange(dayId, "end", e.target.value)
                              }
                              placeholder="End time"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedDays.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select at least one day to set working hours</p>
            </div>
          )}
          </div>
          )}

          {!isAvailable && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <Power className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Booking availability is currently turned off</p>
              <p className="text-xs mt-2">Toggle the switch above to enable bookings</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Availability"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
