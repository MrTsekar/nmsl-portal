"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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

const prescriptionItemSchema = z.object({
  drugName: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

const schema = z.object({
  prescriptions: z.array(prescriptionItemSchema).min(1, "Add at least one prescription"),
});

type FormValues = z.infer<typeof schema>;

interface AddPrescriptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientId: string;
  onSuccess?: () => void;
}

export function AddPrescriptionsDialog({
  open,
  onOpenChange,
  patientName,
  patientId,
  onSuccess,
}: AddPrescriptionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prescriptions: [
        {
          drugName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      console.log("Prescriptions for", patientName, ":", values.prescriptions);
      
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add prescriptions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const addAnotherPrescription = () => {
    append({
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescriptions</DialogTitle>
          <DialogDescription>
            Create medication orders for <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">
                  Prescription {index + 1}
                </Label>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`prescriptions.${index}.drugName`}>
                    Medication Name *
                  </Label>
                  <Input
                    id={`prescriptions.${index}.drugName`}
                    {...form.register(`prescriptions.${index}.drugName`)}
                    placeholder="e.g., Amoxicillin"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.prescriptions?.[index]?.drugName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.prescriptions[index]?.drugName?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prescriptions.${index}.dosage`}>Dosage *</Label>
                  <Input
                    id={`prescriptions.${index}.dosage`}
                    {...form.register(`prescriptions.${index}.dosage`)}
                    placeholder="e.g., 500 mg"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.prescriptions?.[index]?.dosage && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.prescriptions[index]?.dosage?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prescriptions.${index}.frequency`}>
                    Frequency *
                  </Label>
                  <Input
                    id={`prescriptions.${index}.frequency`}
                    {...form.register(`prescriptions.${index}.frequency`)}
                    placeholder="e.g., Twice daily"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.prescriptions?.[index]?.frequency && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.prescriptions[index]?.frequency?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prescriptions.${index}.duration`}>
                    Duration *
                  </Label>
                  <Input
                    id={`prescriptions.${index}.duration`}
                    {...form.register(`prescriptions.${index}.duration`)}
                    placeholder="e.g., 7 days"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.prescriptions?.[index]?.duration && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.prescriptions[index]?.duration?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`prescriptions.${index}.instructions`}>
                    Special Instructions (Optional)
                  </Label>
                  <Textarea
                    id={`prescriptions.${index}.instructions`}
                    {...form.register(`prescriptions.${index}.instructions`)}
                    placeholder="e.g., Take with food, avoid alcohol"
                    disabled={isSubmitting}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAnotherPrescription}
            disabled={isSubmitting}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Prescription
          </Button>

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
              {isSubmitting ? "Saving..." : `Save ${fields.length} Prescription${fields.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
