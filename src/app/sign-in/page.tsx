"use client";

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

const mockAccounts = {
  admin: { email: "admin@nmsl.app", password: "password123" },
  appointment_officer: { email: "appointments@nmsl.app", password: "password123" },
};

export default function SignInPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: mockAccounts.admin,
  });

  const onSubmit = async (values: FormValues) => {
    const response = await authApi.signIn(values);
    localStorage.setItem("nmsl-token", response.token);
    setSession(response);
    router.push("/app/admin");
  };

  const handleAccountSelect = (value: string) => {
    const account = mockAccounts[value as keyof typeof mockAccounts];
    form.setValue("email", account.email);
    form.setValue("password", account.password);
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
        
        <Button className="w-full h-9 sm:h-10" type="submit">Sign in</Button>
        
        <div className="space-y-1.5 pt-2">
          <label className="text-xs text-green-700 font-medium">Quick Login (Dev)</label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="h-9 text-xs" 
              onClick={() => handleAccountSelect("admin")}
            >
              Admin
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-9 text-xs" 
              onClick={() => handleAccountSelect("appointment_officer")}
            >
              Appointment Officer
            </Button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
