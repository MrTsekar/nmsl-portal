"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Stethoscope, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AppointmentDetails {
  id: string;
  patientName: string;
  originalDoctor: string;
  originalDoctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  consultationType: string;
}

interface AlternativeDoctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  availableSlots: string[];
}

interface AutoRebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentDetails;
  alternativeDoctors: AlternativeDoctor[];
  onRebook: (doctorId: string, newDate: string, newTime: string) => void;
}

export function AutoRebookDialog({
  open,
  onOpenChange,
  appointment,
  alternativeDoctors,
  onRebook,
}: AutoRebookDialogProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleRebook = () => {
    if (!selectedDoctor || !selectedSlot) return;
    
    const [date, time] = selectedSlot.split(" at ");
    onRebook(selectedDoctor, date, time);
    onOpenChange(false);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  const selectedDoctorData = alternativeDoctors.find(d => d.id === selectedDoctor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Appointment Requires Rebooking</DialogTitle>
          <DialogDescription className="text-sm">
            The original doctor is no longer available. Please select an alternative doctor from the same specialty.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5">
          {/* Original Appointment Details */}
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Original Appointment (Cancelled)
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{appointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.originalDoctor} ({appointment.originalDoctorSpecialty})</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.date}</span>
                <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{appointment.consultationType}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Reason: {appointment.reason}
              </div>
            </div>
          </div>

          {/* Alternative Doctors */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Available Alternative Doctors ({appointment.originalDoctorSpecialty})</h4>
            <div className="space-y-3">
              {alternativeDoctors.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                  No alternative doctors available in {appointment.originalDoctorSpecialty} at this time.
                  Please contact admin for manual rebooking.
                </div>
              ) : (
                alternativeDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor === doctor.id
                        ? "ring-2 ring-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20"
                        : "hover:border-cyan-300 dark:hover:border-cyan-700"
                    }`}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-base">{doctor.name}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{doctor.qualifications}</p>
                          <Badge variant="secondary" className="mt-2">
                            {doctor.specialty}
                          </Badge>
                        </div>
                        {selectedDoctor === doctor.id && (
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-full bg-cyan-500 flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Available Slots */}
          {selectedDoctorData && (
            <div>
              <h4 className="font-semibold text-sm mb-3">Available Time Slots</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDoctorData.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedSlot === slot
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 font-medium"
                        : "border-border hover:border-cyan-300 dark:hover:border-cyan-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{slot}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
            <Button
              onClick={handleRebook}
              disabled={!selectedDoctor || !selectedSlot}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Confirm Rebooking
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel - Manual Review
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ℹ️ Patient will be notified via email and SMS about the change. Original appointment notes will be transferred.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
