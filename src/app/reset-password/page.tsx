"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth.api";

const schema = z.object({ password: z.string().min(8), token: z.string().min(6) });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { token: "", password: "" } });

  return (
    <AuthShell title="Reset password" subtitle="Use the token from your email to set a new password">
      <form onSubmit={form.handleSubmit((values) => authApi.resetPassword(values))} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Reset token" {...form.register("token")} className="h-9 sm:h-10" />
        <Input type="password" placeholder="New password" {...form.register("password")} className="h-9 sm:h-10" />
        <Button className="w-full h-9 sm:h-10" type="submit">Update password</Button>
      </form>
    </AuthShell>
  );
}
