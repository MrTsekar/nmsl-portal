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
    defaultValues: { email: "admin@nmsl.app", password: "password123" },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await authApi.signIn(values);
    localStorage.setItem("nmsl-token", response.token);
    setSession(response);
    router.push("/app/admin");
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
        <Button className="w-full h-9 sm:h-10" type="submit">Sign in</Button>
      </form>
    </AuthShell>
  );
}
