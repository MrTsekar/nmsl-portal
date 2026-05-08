"use client";

import { useState, type ChangeEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin.api";
import { NIGERIA_LOCATIONS } from "@/lib/constants/locations";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { MapPin, Upload, CheckCircle2, Loader2 } from "lucide-react";

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
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    qualifications: z.string().min(2, "Qualifications are required"),
    specialty: z.string().min(2, "Specialty is required"),
    location: z.enum(LOCATION_OPTIONS),
    state: z.string().min(2, "State is required"),
    address: z.string().min(6, "Address must be at least 6 characters"),
    bio: z
      .string()
      .max(2000, "Bio must be 2000 characters or fewer")
      .optional()
      .or(z.literal("")),
    avatar: z.string().optional(),
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      qualifications: "",
      specialty: "General Practice",
      location: "Abuja",
      state: "FCT",
      address: "",
      bio: "",
      avatar: "",
    },
  });

  const selectedLocation = useWatch({ control: form.control, name: "location" });
  const uploadedAvatarUrl = useWatch({ control: form.control, name: "avatar" });

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploadError(null);
      setIsUploadingPhoto(true);

      // Step 1: Get signed upload URL from backend
      const { data } = await adminApi.getDoctorUploadUrl(file.name, file.type);
      if (!data?.uploadUrl || !data?.finalUrl) {
        throw new Error("Backend did not return a valid upload URL");
      }

      // Step 2: Upload directly to Azure
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      // Step 3: Save final URL in form
      form.setValue("avatar", data.finalUrl, { shouldDirty: true });
    } catch (uploadErr) {
      const message = uploadErr instanceof Error ? uploadErr.message : "Upload failed. Please try again.";
      setPhotoUploadError(message);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        ...values,
        bio: values.bio?.trim() ? values.bio.trim() : undefined,
      };
      await adminApi.createDoctor(payload);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 409) {
        setError("A doctor with this email already exists.");
      } else if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else {
        setError("Failed to create doctor account. Please try again.");
      }
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
            Create a new doctor account for the platform and optionally upload a profile photo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Location callout */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Location is critical.</strong> You can assign this doctor to any NMSL facility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location first — most important */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" /> Facility Location *
              </Label>
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
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-base font-semibold">State *</Label>
              {selectedLocation === "Other" ? (
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

          <div className="space-y-2">
            <Label htmlFor="doctor-photo">Doctor Photo</Label>
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-muted">
                  {uploadedAvatarUrl ? (
                    <img src={uploadedAvatarUrl} alt="Doctor photo preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No photo</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP. Uploaded directly to cloud storage.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Label
                  htmlFor="doctor-photo"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 ${isUploadingPhoto ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploadingPhoto ? "Uploading..." : "Upload photo"}
                </Label>
                <input
                  id="doctor-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />

                {uploadedAvatarUrl && !isUploadingPhoto && !photoUploadError && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Photo uploaded
                  </span>
                )}
                {photoUploadError && !isUploadingPhoto && (
                  <span className="text-xs text-red-600">{photoUploadError}</span>
                )}
              </div>
            </div>
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

          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                {...form.register("phone")}
                disabled={isSubmitting || isUploadingPhoto}
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

          <div className="space-y-2">
            <Label htmlFor="bio">About this Doctor</Label>
            <Textarea
              id="bio"
              placeholder="A short biography that will appear on the public doctor profile page (e.g. background, experience, specialisations)."
              rows={5}
              maxLength={2000}
              {...form.register("bio")}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Shown on the public website under “About {`{Doctor}`}”. Up to 2000 characters.
            </p>
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
            )}
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
              disabled={isSubmitting || isUploadingPhoto}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
              {isSubmitting ? "Creating..." : "Create Doctor Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
