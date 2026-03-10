"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  phone: z.string().min(8),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: z.string().min(7),
  role: z.enum(["patient", "doctor", "admin"]),
});

type FormValues = z.infer<typeof schema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", emergencyContactName: "", emergencyContactPhone: "", role: "patient" },
  });

  return (
    <AuthShell title="Complete profile" subtitle="Final details before accessing the app">
      <form onSubmit={form.handleSubmit(() => router.push("/sign-in"))} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Phone number" {...form.register("phone")} className="h-9 sm:h-10" />
        <Input placeholder="Emergency contact name" {...form.register("emergencyContactName")} className="h-9 sm:h-10" />
        <Input placeholder="Emergency contact phone" {...form.register("emergencyContactPhone")} className="h-9 sm:h-10" />
        <Select defaultValue="patient" onValueChange={(value) => form.setValue("role", value as FormValues["role"])}>
          <SelectTrigger>
            <SelectValue placeholder="Choose role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patient">Patient</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full h-9 sm:h-10" type="submit">Finish setup</Button>
      </form>
    </AuthShell>
  );
}
