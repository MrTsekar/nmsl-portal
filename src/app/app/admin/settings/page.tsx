"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { authApi } from "@/lib/api/auth.api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, updateUser, signOut } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: "female" | "male" | "other" | "";
    location: string;
    state: string;
    address: string;
  }>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    location: user?.location || "",
    state: user?.state || "",
    address: user?.address || "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        location: user.location || "",
        state: user.state || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayAvatar = avatarPreview ?? user?.avatar;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const onUploadAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    updateUser({ avatar: preview });
    addNotification({
      id: Date.now().toString(),
      title: "Success",
      message: "Profile photo updated successfully",
      createdAt: new Date().toISOString(),
      read: false,
      category: "system",
      roles: ["admin", "appointment_officer"],
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileStatus(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser({
      ...formData,
      gender: formData.gender || undefined,
    });
    setProfileStatus({ type: "success", message: "Profile updated successfully" });
    setTimeout(() => setProfileStatus(null), 4000);
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Please fill in all password fields" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }
    
    setChangingPassword(true);
    setPasswordStatus(null);
    
    try {
      const result = await authApi.changePassword(passwordData);
      
      console.log('✅ Password changed successfully:', result);
      
      setPasswordStatus({ type: "success", message: result.message || "Password changed successfully" });
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // If backend requires re-authentication, logout and redirect
      if (result.requiresReauth) {
        setTimeout(() => {
          signOut();
          addNotification({
            id: Date.now().toString(),
            title: "Password Changed",
            message: "Please sign in with your new password",
            createdAt: new Date().toISOString(),
            read: false,
            category: "system",
            roles: ["admin", "appointment_officer"],
          });
          router.push("/sign-in");
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Password change failed:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
      setPasswordStatus({ type: "error", message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Profile"
        subtitle="Manage your personal information and account settings"
      />

      {/* Profile Photo Section */}
      <SectionCard title="Profile Photo">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-xl ring-4 ring-green-100 dark:ring-green-900/50">
              {displayAvatar ? <AvatarImage src={displayAvatar} alt="Profile avatar" /> : null}
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-green-500 to-lime-600 text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-base text-slate-900 dark:text-slate-100">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
              <Badge variant="secondary" className="mt-1 capitalize">{user?.role?.replace("_", " ") || "User"}</Badge>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Camera className="h-4 w-4" />
              Change profile photo
              <input type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
            </label>
            <p className="text-xs text-muted-foreground">PNG or JPG. Your photo appears throughout the application.</p>
          </div>
        </div>
      </SectionCard>

      {/* Personal Information Section */}
      <SectionCard title="Personal Information">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 XXX XXX XXXX"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as "female" | "male" | "other" })}>
              <SelectTrigger id="gender" className="h-10">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location/City *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Abuja, Lagos"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger id="state" className="h-10">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {NIGERIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your full address"
              className="h-10"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t space-y-3">
          <Button onClick={handleSaveProfile} disabled={saving} className="min-w-[120px]">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {profileStatus && (
            <p className={`text-sm font-medium ${
              profileStatus.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {profileStatus.type === "success" ? "✓ " : "✕ "}{profileStatus.message}
            </p>
          )}
        </div>
      </SectionCard>

      {/* Security Section */}
      <SectionCard title="Security">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
          
          <div className="grid gap-4 sm:gap-5 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="min-w-[150px]">
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
            {passwordStatus && (
              <p className={`text-sm font-medium ${
                passwordStatus.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}>
                {passwordStatus.type === "success" ? "✓ " : "✕ "}{passwordStatus.message}
              </p>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
