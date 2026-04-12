"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [inactivityMessage, setInactivityMessage] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Check for inactivity logout
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "inactivity") {
      setInactivityMessage("You were logged out due to inactivity");
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setInactivityMessage(null);
        router.replace("/sign-in", { scroll: false });
      }, 5000);
    }
  }, [searchParams, router]);

  const onSubmit = async (values: FormValues) => {
    setCredentialError(null);
    setInactivityMessage(null);
    try {
      const response = await authApi.signIn(values);
      setSession(response);
      router.push("/app/admin");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (!axiosErr.response) {
        setCredentialError("Unable to reach the server. Check your connection or try again shortly.");
      } else if (axiosErr.response.status === 401 || axiosErr.response.status === 403) {
        setCredentialError("Wrong Credentials");
      } else {
        setCredentialError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
      <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" />
      <Input type="password" placeholder="Password" {...form.register("password")} className="h-9 sm:h-10" />
      
      <div className="flex items-center justify-end">
        <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
          Forgot password?
        </Link>
      </div>

      {inactivityMessage && (
        <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {inactivityMessage}
        </div>
      )}
      
      {credentialError && (
        <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {credentialError}
        </div>
      )}
      <Button className="w-full h-9 sm:h-10" type="submit">Sign in</Button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Admin Sign in"
      subtitle="Access your admin workspace"
      footer={<span>Need access? Contact support</span>}
    >
      <Suspense fallback={
        <div className="space-y-2.5 sm:space-y-3">
          <div className="h-9 sm:h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md" />
          <div className="h-9 sm:h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md" />
          <div className="h-9 sm:h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md" />
        </div>
      }>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
