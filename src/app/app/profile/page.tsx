"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, KeyRound, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const profileSchema = z.object({
  name: z.string().min(2),
  qualifications: z.string().optional(),
  gender: z.enum(["female", "male", "other"]),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: z.string().min(7),
  address: z.string().min(6),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "New password and confirmation must match.",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      qualifications: user?.qualifications ?? "",
      gender: user?.gender ?? "female",
      emergencyContactName: user?.emergencyContactName ?? "",
      emergencyContactPhone: user?.emergencyContactPhone ?? "",
      address: user?.address ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name,
      qualifications: user.qualifications ?? "",
      gender: user.gender ?? "female",
      emergencyContactName: user.emergencyContactName ?? "",
      emergencyContactPhone: user.emergencyContactPhone ?? "",
      address: user.address ?? "",
    });
  }, [profileForm, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayAvatar = avatarPreview ?? user?.avatar;

  const initials = useMemo(() => {
    const fullName = user?.name ?? "NA";
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [user?.name]);

  const onUploadAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    updateUser({ avatar: preview });
  };

  const onSubmitProfile = (values: ProfileFormValues) => {
    updateUser(values);
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 1800);
  };

  const onSubmitPassword = () => {
    passwordForm.reset();
    setPasswordUpdated(true);
    window.setTimeout(() => setPasswordUpdated(false), 1800);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Profile" subtitle="Manage account and personal healthcare preferences" />

      {/* Account Details with Enhanced Visual Design */}
      <SectionCard title="Account details">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Avatar Section with Gradient Background */}
          <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50 dark:from-slate-800 dark:via-green-950/50 dark:to-lime-950/30 border border-green-100 dark:border-green-900/50 shadow-lg">
            <div className="relative">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-white dark:border-slate-700 shadow-xl ring-4 ring-green-100 dark:ring-green-900/50">
                {displayAvatar ? <AvatarImage src={displayAvatar} alt="Profile avatar" /> : null}
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-green-500 to-lime-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Camera className="h-4 w-4" />
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
            </label>
            <div className="text-center">
              <Badge variant="secondary" className="capitalize font-semibold px-3 py-1 bg-gradient-to-r from-green-500/10 to-lime-500/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                {user?.role ?? "patient"}
              </Badge>
            </div>
          </div>

          {/* Info Grid with Better Styling */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">User ID</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.id ?? "-"}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">ID Number</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.idNumber ?? "Not set"}</p>
            </div>
            {user?.role === "doctor" ? (
              <div className="sm:col-span-2 p-4 rounded-xl bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20 border border-green-200 dark:border-green-800">
                <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Qualifications</Label>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.qualifications ?? "Not set"}</p>
              </div>
            ) : null}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Location</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.location ?? "-"}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">State</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.state ?? "-"}</p>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Address</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.address ?? "-"}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Emergency contact</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.emergencyContactName ?? "-"}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Emergency phone</Label>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.emergencyContactPhone ?? "-"}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal information">
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
              🔒 Verified fields (email, phone number, date of birth, state, and registration location) are captured during sign-up and cannot be edited here.
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input placeholder="Full name" {...profileForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly disabled />
            </div>
            {user?.role === "doctor" ? (
              <div className="space-y-2">
                <Label>Qualifications</Label>
                <Input placeholder="Professional qualifications" {...profileForm.register("qualifications")} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input value={user?.phone ?? ""} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input value={user?.dateOfBirth ?? ""} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                defaultValue={profileForm.getValues("gender")}
                onValueChange={(value) => profileForm.setValue("gender", value as ProfileFormValues["gender"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={user?.state ?? ""} readOnly disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input placeholder="Address" {...profileForm.register("address")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Emergency contact name</Label>
              <Input placeholder="Emergency contact name" {...profileForm.register("emergencyContactName")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Emergency contact phone</Label>
              <Input placeholder="Emergency contact phone" {...profileForm.register("emergencyContactPhone")} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 text-white shadow-md">
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
            {profileSaved ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300 animate-in fade-in slide-in-from-top-2 duration-500">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
              </span>
            ) : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Reset password">
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" {...passwordForm.register("currentPassword")} />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...passwordForm.register("newPassword")} />
            </div>
            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input type="password" {...passwordForm.register("confirmPassword")} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="outline" className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
              <KeyRound className="mr-2 h-4 w-4" /> Update password
            </Button>
            {passwordUpdated ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300 animate-in fade-in slide-in-from-top-2 duration-500">
                <CheckCircle2 className="h-4 w-4" /> Password updated successfully!
              </span>
            ) : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Security">
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
            🛡️ Keep your account secure by using a unique password and updating contact details regularly.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
