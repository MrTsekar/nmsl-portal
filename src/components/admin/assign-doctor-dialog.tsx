"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Loader2 
} from "lucide-react";
import { adminApi } from "@/lib/api/admin.api";
import type { Appointment, Doctor } from "@/types";

interface AssignDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onAssign?: (appointmentId: string, doctorId: string, date: string, time: string) => Promise<void>;
}

export function AssignDoctorDialog({
  open,
  onOpenChange,
  appointment,
  onAssign,
}: AssignDoctorDialogProps) {
  // Initialize with appointment's requested date/time if available
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Debug logging
  useEffect(() => {
    if (open) {
      console.log("Assign Doctor Dialog opened with appointment:", {
        id: appointment?.id,
        date: appointment?.date,
        time: appointment?.time,
        patientName: appointment?.patientName,
      });
      setIsInitializing(true);
    }
  }, [open, appointment]);

  // Reset and initialize when appointment changes
  useEffect(() => {
    if (appointment && open) {
      try {
        // Parse the date from appointment
        if (appointment.date) {
          const appointmentDate = new Date(appointment.date);
          // Check if date is valid
          if (!isNaN(appointmentDate.getTime())) {
            const formattedDate = appointmentDate.toISOString().split("T")[0]; // YYYY-MM-DD
            setSelectedDate(formattedDate);
          } else {
            console.error("Invalid appointment date:", appointment.date);
            setSelectedDate("");
          }
        } else {
          setSelectedDate("");
        }
        setSelectedTime(appointment.time || "");
        setSelectedDoctorId("");
        
        // Small delay to ensure state is set before allowing API calls
        setTimeout(() => {
          setIsInitializing(false);
        }, 100);
      } catch (error) {
        console.error("Error parsing appointment date:", error);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedDoctorId("");
        setIsInitializing(false);
      }
    } else {
      setSelectedDate("");
      setSelectedTime("");
      setSelectedDoctorId("");
      setIsInitializing(true);
    }
  }, [appointment, open]);

  // Fetch available doctors when date/time changes
  const { data: availableDoctors = [], isLoading: loadingDoctors, error: doctorsError } = useQuery({
    queryKey: ["available-doctors", appointment?.id, selectedDate, selectedTime],
    queryFn: async () => {
      if (!appointment?.id || !selectedDate || !selectedTime) {
        return [];
      }
      try {
        console.log("Fetching available doctors for:", { appointmentId: appointment.id, selectedDate, selectedTime });
        const doctors = await adminApi.getAvailableDoctors(appointment.id, selectedDate, selectedTime);
        console.log("Available doctors fetched:", doctors.length);
        console.log("Available doctors data:", JSON.stringify(doctors, null, 2));
        return doctors;
      } catch (error) {
        console.error("Error fetching available doctors:", error);
        throw error;
      }
    },
    enabled: Boolean(open && !isInitializing && appointment?.id && selectedDate && selectedTime), // Wait for initialization to complete
    retry: 1,
    staleTime: 0, // Always fetch fresh data when dialog opens
  });

  const handleAssign = async () => {
    if (!appointment || !selectedDoctorId || !selectedDate || !selectedTime) return;

    try {
      setIsAssigning(true);
      await onAssign?.(appointment.id, selectedDoctorId, selectedDate, selectedTime);
      handleClose();
    } catch (error) {
      // Error handling done by parent
      console.error("Failed to assign doctor:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelectedDoctorId("");
    onOpenChange(false);
  };

  const selectedDoctor = availableDoctors.find((d: Doctor) => d.id === selectedDoctorId);

  const appointmentDay = selectedDate
    ? (() => {
        try {
          return new Date(selectedDate).toLocaleDateString("en-US", { 
            weekday: "long", 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          });
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      })()
    : "";

  const canAssign = selectedDoctorId && selectedDate && selectedTime && !isAssigning;

  // Don't render if appointment is null
  if (open && !appointment) {
    console.error("AssignDoctorDialog opened without an appointment");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign Doctor to Appointment</DialogTitle>
          <DialogDescription>
            Select an available doctor for the patient's requested appointment. Assigning a doctor will automatically confirm the appointment.
          </DialogDescription>
        </DialogHeader>

        {isInitializing ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading appointment details...</p>
            </div>
          </div>
        ) : appointment ? (
          <div className="flex-1 overflow-y-auto space-y-5 py-2">
            {/* Patient Info */}
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-semibold">{appointment.patientName}</p>
                </div>
                {appointment.patientEmail && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {appointment.patientEmail}
                    </p>
                  </div>
                )}
                {appointment.patientPhone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {appointment.patientPhone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <Badge variant="secondary" className="mt-1">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {appointment.specialty}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <Badge variant="outline" className="mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {appointment.location}
                  </Badge>
                </div>
                {appointment.visitType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Visit Type</p>
                    <p className="font-medium">{appointment.visitType}</p>
                  </div>
                )}
              </div>
              {appointment.reasonForVisit && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-muted-foreground mb-1">Reason for Visit</p>
                  <p className="text-sm">{appointment.reasonForVisit}</p>
                </div>
              )}
              {appointment.additionalComment && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Additional Comments</p>
                  <p className="text-sm">{appointment.additionalComment}</p>
                </div>
              )}
            </div>

            {/* Check if time is specified */}
            {!selectedTime || !selectedDate ? (
              <div className="rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-950/20 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-red-900 dark:text-red-100 mb-2">
                      Incomplete Appointment Information
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      This appointment does not have a {!selectedDate && "date"}{!selectedDate && !selectedTime && " or "}{!selectedTime && "time"} specified. 
                      You cannot assign a doctor without this information.
                    </p>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Please use the <strong>"Reschedule"</strong> button to set a valid date and time for this appointment.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Requested Date and Time Display (Read-only) */}
                <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Requested Appointment Date & Time
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <div className="flex items-center gap-2 text-base font-semibold">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        {appointmentDay || selectedDate}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time</p>
                      <div className="flex items-center gap-2 text-base font-semibold">
                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        {selectedTime}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    This is the date and time requested by the patient. Available doctors shown below match this schedule.
                  </p>
                </div>

            {/* Available Doctors */}
            {selectedDate && selectedTime && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Available Doctors
                </Label>

                {loadingDoctors ? (
                  <div className="rounded-lg border p-8 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading available doctors...</p>
                  </div>
                ) : doctorsError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          Failed to load doctors
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Please try a different date/time or contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center">
                    <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                      <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold mb-2">No doctors available</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No doctors are available for <strong>{appointment.specialty}</strong> at <strong>{appointment.location}</strong> on{" "}
                      <strong>{appointmentDay}</strong> at <strong>{selectedTime}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please select a different date/time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Found {availableDoctors.length} available doctor{availableDoctors.length !== 1 ? "s" : ""} for {appointment.specialty} at {appointment.location}
                    </p>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doctor: Doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{doctor.name}</span>
                              {doctor.qualifications && (
                                <span className="text-xs text-muted-foreground">
                                  ({doctor.qualifications})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Doctor Details */}
                    {selectedDoctor && (
                      <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 mt-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-2">{selectedDoctor.name}</p>
                            {selectedDoctor.qualifications && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {selectedDoctor.qualifications}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {selectedDoctor.specialty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {selectedDoctor.location}
                              </Badge>
                            </div>
                            {selectedDoctor.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                {selectedDoctor.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Warning about auto-acceptance */}
            {selectedDoctorId && selectedDate && selectedTime && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Automatic Confirmation
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Assigning a doctor will automatically <strong>confirm</strong> this appointment and send confirmation emails to both the patient and doctor.
                    </p>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">No appointment selected</p>
          </div>
        )}

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={handleClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!canAssign}>
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Assign Doctor & Confirm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
