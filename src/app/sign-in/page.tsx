"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignInPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setCredentialError(null);
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
    <AuthShell
      title="Admin Sign in"
      subtitle="Access your admin workspace"
      footer={<span>Need access? Contact support</span>}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" />
        <Input type="password" placeholder="Password" {...form.register("password")} className="h-9 sm:h-10" />
        
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
            Forgot password?
          </Link>
        </div>
        
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
    </AuthShell>
  );
}
