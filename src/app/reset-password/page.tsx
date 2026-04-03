"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth.api";

const schema = z.object({ 
  token: z.string().min(6, "Reset token must be at least 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema), 
    defaultValues: { token: "", password: "", confirmPassword: "" } 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ token: values.token, password: values.password });
      setSuccess(true);
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      console.error(error);
      form.setError("token", { message: "Invalid or expired reset token" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="Password reset successful" subtitle="You can now sign in with your new password">
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              Your password has been successfully reset. Redirecting to sign in...
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      title="Reset password" 
      subtitle="Use the token from your email to set a new password"
      footer={
        <Link href="/sign-in" className="text-sm text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Reset Token</Label>
          <Input 
            id="token"
            placeholder="Enter the token from your email" 
            {...form.register("token")} 
            className="h-9 sm:h-10" 
            disabled={loading}
          />
          {form.formState.errors.token && (
            <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.token.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password"
            type="password" 
            placeholder="Enter new password (min. 8 characters)" 
            {...form.register("password")} 
            className="h-9 sm:h-10" 
            disabled={loading}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword"
            type="password" 
            placeholder="Confirm your new password" 
            {...form.register("confirmPassword")} 
            className="h-9 sm:h-10" 
            disabled={loading}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button className="w-full h-9 sm:h-10" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
