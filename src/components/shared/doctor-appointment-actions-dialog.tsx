"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment } from "@/types";

const prescriptionSchema = z.object({
  drugName: z.string().min(1, "Drug name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

const notesSchema = z.object({
  clinicalNotes: z.string().min(10, "Clinical notes must be at least 10 characters"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
type NotesFormValues = z.infer<typeof notesSchema>;

interface DoctorAppointmentActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSuccess?: () => void;
}

export function DoctorAppointmentActionsDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: DoctorAppointmentActionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("prescription");

  const prescriptionForm = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  });

  const notesForm = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      clinicalNotes: appointment?.notes || "",
    },
  });

  const onPrescriptionSubmit = async (values: PrescriptionFormValues) => {
    if (!appointment) return;

    try {
      setIsSubmitting(true);
      setError(null);
      // API call would go here
      // await appointmentsApi.addPrescription(appointment.id, values);
      console.log("Adding prescription:", values);
      prescriptionForm.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNotesSubmit = async (values: NotesFormValues) => {
    if (!appointment) return;

    try {
      setIsSubmitting(true);
      setError(null);
      // API call would go here
      // await appointmentsApi.updateNotes(appointment.id, values);
      console.log("Updating notes:", values);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && appointment) {
      prescriptionForm.reset();
      notesForm.reset({ clinicalNotes: appointment.notes || "" });
      setError(null);
      setActiveTab("prescription");
    }
    onOpenChange(newOpen);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Appointment</DialogTitle>
          <DialogDescription>
            Add prescriptions or update clinical notes for {appointment.patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Patient:</span> {appointment.patientName}
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span> {appointment.date} at {appointment.time}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Reason:</span> {appointment.reason}
            </div>
            {appointment.patientNotes && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Patient notes:</span> {appointment.patientNotes}
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prescription">Add Prescription</TabsTrigger>
            <TabsTrigger value="notes">Update Clinical Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="prescription" className="space-y-4">
            <form onSubmit={prescriptionForm.handleSubmit(onPrescriptionSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="drugName">Drug Name *</Label>
                  <Input
                    id="drugName"
                    placeholder="e.g., Amoxicillin"
                    {...prescriptionForm.register("drugName")}
                    disabled={isSubmitting}
                  />
                  {prescriptionForm.formState.errors.drugName && (
                    <p className="text-sm text-destructive">
                      {prescriptionForm.formState.errors.drugName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    {...prescriptionForm.register("dosage")}
                    disabled={isSubmitting}
                  />
                  {prescriptionForm.formState.errors.dosage && (
                    <p className="text-sm text-destructive">
                      {prescriptionForm.formState.errors.dosage.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., 3 times daily"
                    {...prescriptionForm.register("frequency")}
                    disabled={isSubmitting}
                  />
                  {prescriptionForm.formState.errors.frequency && (
                    <p className="text-sm text-destructive">
                      {prescriptionForm.formState.errors.frequency.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 7 days"
                    {...prescriptionForm.register("duration")}
                    disabled={isSubmitting}
                  />
                  {prescriptionForm.formState.errors.duration && (
                    <p className="text-sm text-destructive">
                      {prescriptionForm.formState.errors.duration.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Take with food. Complete the full course."
                    {...prescriptionForm.register("instructions")}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </div>

              {error && activeTab === "prescription" && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Prescription"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <form onSubmit={notesForm.handleSubmit(onNotesSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicalNotes">Clinical Notes *</Label>
                <Textarea
                  id="clinicalNotes"
                  placeholder="Document examination findings, diagnosis, treatment plan, follow-up instructions..."
                  {...notesForm.register("clinicalNotes")}
                  disabled={isSubmitting}
                  rows={10}
                />
                {notesForm.formState.errors.clinicalNotes && (
                  <p className="text-sm text-destructive">
                    {notesForm.formState.errors.clinicalNotes.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Include examination findings, diagnosis, treatment plan, and follow-up recommendations
                </p>
              </div>

              {error && activeTab === "notes" && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Notes"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
