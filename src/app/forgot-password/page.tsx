"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="Check your email" subtitle="Password reset instructions sent">
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              We've sent password reset instructions to <span className="font-semibold">{form.getValues("email")}</span>.
              Please check your inbox and follow the link to reset your password.
            </p>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full h-9 sm:h-10">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      title="Forgot password" 
      subtitle="Enter your email to receive reset instructions"
      footer={
        <Link href="/sign-in" className="text-sm text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" disabled={loading} />
        <Button className="w-full h-9 sm:h-10" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
