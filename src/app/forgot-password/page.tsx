"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth.api";

const schema = z.object({ email: z.string().email() });

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  return (
    <AuthShell title="Forgot password" subtitle="Enter your email to receive reset instructions">
      <form onSubmit={form.handleSubmit((values) => authApi.forgotPassword(values))} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" />
        <Button className="w-full h-9 sm:h-10" type="submit">Send reset link</Button>
      </form>
    </AuthShell>
  );
}
