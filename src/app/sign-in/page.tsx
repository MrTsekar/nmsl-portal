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

export default function SignInPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "patient@nmsl.app", password: "password123" },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await authApi.signIn(values);
    localStorage.setItem("nmsl-token", response.token);
    setSession(response);
    router.push("/app/overview");
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your healthcare workspace"
      footer={<span>New here? <Link href="/sign-up" className="text-primary hover:underline">Create account</Link></span>}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
        <Input placeholder="Email" {...form.register("email")} className="h-9 sm:h-10" />
        <Input type="password" placeholder="Password" {...form.register("password")} className="h-9 sm:h-10" />
        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-2.5 sm:p-3">
          <p className="text-xs font-medium text-muted-foreground">Demo logins</p>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => {
                form.setValue("email", "patient@nmsl.app");
                form.setValue("password", "password123");
              }}
            >
              Patient
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => {
                form.setValue("email", "doctor@nmsl.app");
                form.setValue("password", "password123");
              }}
            >
              Doctor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => {
                form.setValue("email", "admin@nmsl.app");
                form.setValue("password", "password123");
              }}
            >
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              onClick={() => {
                form.setValue("email", "superadmin@nmsl.app");
                form.setValue("password", "password123");
              }}
            >
              Super Admin
            </Button>
          </div>
        </div>
        <Button className="w-full h-9 sm:h-10" type="submit">Sign in</Button>
      </form>
    </AuthShell>
  );
}
