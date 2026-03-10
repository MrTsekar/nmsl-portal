"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authApi } from "@/lib/api/auth.api";
import { NIGERIA_LOCATIONS } from "@/lib/constants/locations";
import { NIGERIAN_STATES } from "@/lib/constants/states";

const LOCATION_OPTIONS = [...NIGERIA_LOCATIONS, "Other"] as const;

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    location: z.enum(LOCATION_OPTIONS),
    state: z.string().min(2),
    address: z.string().min(6),
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

export default function SignUpPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", location: "Abuja", state: "FCT", address: "" },
  });

  const selectedLocation = useWatch({ control: form.control, name: "location" });

  const onSubmit = async (values: FormValues) => {
    await authApi.signUp(values);
    router.push("/complete-profile");
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Register to continue to the care platform"
      footer={<span>Already have access? <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link></span>}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Full name" {...form.register("name")} className="h-9 sm:h-10" />
        <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" />
        <Input type="password" placeholder="Password" {...form.register("password")} className="h-9 sm:h-10" />
        <Select defaultValue="Abuja" onValueChange={(value) => form.setValue("location", value as FormValues["location"])}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_OPTIONS.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedLocation === "Other" ? (
          <Input placeholder="Enter your state" {...form.register("state")} />
        ) : (
          <Select defaultValue="FCT" onValueChange={(value) => form.setValue("state", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input placeholder="Address" {...form.register("address")} className="h-9 sm:h-10" />
        <Button className="w-full h-9 sm:h-10" type="submit">Continue</Button>
      </form>
    </AuthShell>
  );
}
