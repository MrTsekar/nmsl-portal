"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin.api";
import { NIGERIA_LOCATIONS } from "@/lib/constants/locations";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { useAuthStore } from "@/store/auth-store";
import { MapPin, Lock } from "lucide-react";

const LOCATION_OPTIONS = [...NIGERIA_LOCATIONS, "Other"] as const;

const SPECIALTIES = [
  "General Practice",
  "Gynecology",
  "Physiotherapy",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Psychiatry",
  "Radiology",
  "Surgery",
] as const;

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    qualifications: z.string().min(2, "Qualifications are required"),
    specialty: z.string().min(2, "Specialty is required"),
    location: z.enum(LOCATION_OPTIONS),
    state: z.string().min(2, "State is required"),
    address: z.string().min(6, "Address must be at least 6 characters"),
  })
  .superRefine((values, context) => {
    if (values.location !== "Other" && !NIGERIAN_STATES.includes(values.state as (typeof NIGERIAN_STATES)[number])) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Select a valid Nigerian state.",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface CreateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDoctorDialog({ open, onOpenChange, onSuccess }: CreateDoctorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const lockedLocation = isSuperAdmin ? undefined : (user?.location as FormValues["location"] | undefined);
  const lockedState = isSuperAdmin ? undefined : user?.state;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      qualifications: "",
      specialty: "General Practice",
      location: lockedLocation ?? "Abuja",
      state: lockedState ?? "FCT",
      address: "",
    },
  });

  const selectedLocation = useWatch({ control: form.control, name: "location" });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await adminApi.createDoctor(values);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create doctor account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Doctor</DialogTitle>
          <DialogDescription>
            Create a new doctor account for the platform. The doctor will receive login credentials via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Location callout */}
          {isSuperAdmin ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20 p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Location is critical.</strong> As super admin, you can assign this doctor to any NMSL facility.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300">
                This doctor will be assigned to your facility: <strong>{lockedLocation}</strong>. Only a super admin can create doctors for other locations.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location first — most important */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" /> Facility Location *
              </Label>
              {isSuperAdmin ? (
                <Select
                  defaultValue="Abuja"
                  onValueChange={(value) => form.setValue("location", value as FormValues["location"])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="location" className="border-primary/60 ring-1 ring-primary/30">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="location"
                  value={lockedLocation ?? ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              )}
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-base font-semibold">State *</Label>
              {!isSuperAdmin ? (
                <Input
                  id="state"
                  value={lockedState ?? ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              ) : selectedLocation === "Other" ? (
                <Input
                  id="state"
                  placeholder="Enter state"
                  {...form.register("state")}
                  disabled={isSubmitting}
                />
              ) : (
                <Select
                  defaultValue="FCT"
                  onValueChange={(value) => form.setValue("state", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="state" className="border-primary/60 ring-1 ring-primary/30">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.state && (
                <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-semibold">Facility / Practice Address *</Label>
            <Input
              id="address"
              placeholder="Full address (e.g. 15 Ahmadu Bello Way, Victoria Island, Lagos)"
              {...form.register("address")}
              disabled={isSubmitting}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Dr. John Doe"
                {...form.register("name")}
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                {...form.register("email")}
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                {...form.register("password")}
                disabled={isSubmitting}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                {...form.register("phone")}
                disabled={isSubmitting}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications *</Label>
              <Input
                id="qualifications"
                placeholder="MBBS, FMCGP"
                {...form.register("qualifications")}
                disabled={isSubmitting}
              />
              {form.formState.errors.qualifications && (
                <p className="text-sm text-destructive">{form.formState.errors.qualifications.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty *</Label>
              <Select
                defaultValue="General Practice"
                onValueChange={(value) => form.setValue("specialty", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.specialty && (
                <p className="text-sm text-destructive">{form.formState.errors.specialty.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Doctor Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
