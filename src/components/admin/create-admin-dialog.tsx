"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin.api";
import { NIGERIA_LOCATIONS } from "@/lib/constants/locations";
import { NIGERIAN_STATES } from "@/lib/constants/states";

const LOCATION_OPTIONS = [...NIGERIA_LOCATIONS, "Other"] as const;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["admin", "appointment_officer"]),
  location: z.enum(LOCATION_OPTIONS),
  state: z.string().min(2, "State is required"),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminDialog({ open, onOpenChange, onSuccess }: CreateAdminDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "admin" as const,
      location: "Abuja",
      state: "FCT",
      address: "",
    },
  });

  const selectedLocation = useWatch({ control: form.control, name: "location" });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await adminApi.createAdmin(values);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Admin Account</DialogTitle>
          <DialogDescription>
            Create a new admin or appointment officer account. The user will be able to log in with these credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="e.g. Amina Bello" {...form.register("name")} disabled={isSubmitting} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="user@nmsl.app" {...form.register("email")} disabled={isSubmitting} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" placeholder="+234 801 234 5678" {...form.register("phone")} disabled={isSubmitting} />
              {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" placeholder="Min. 8 characters" {...form.register("password")} disabled={isSubmitting} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                defaultValue="admin"
                onValueChange={(v) => form.setValue("role", v as FormValues["role"])}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="appointment_officer">Appointment Officer</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Facility Location *</Label>
              <Select
                defaultValue="Abuja"
                onValueChange={(v) => form.setValue("location", v as FormValues["location"])}
                disabled={isSubmitting}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              {selectedLocation === "Other" ? (
                <Input id="state" placeholder="Enter state" {...form.register("state")} disabled={isSubmitting} />
              ) : (
                <Select
                  defaultValue="FCT"
                  onValueChange={(v) => form.setValue("state", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.state && <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" placeholder="Office address" {...form.register("address")} disabled={isSubmitting} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
