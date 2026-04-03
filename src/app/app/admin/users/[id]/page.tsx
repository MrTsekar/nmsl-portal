"use client";

import { use, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-app-data";
import { useAuthStore } from "@/store/auth-store";
import { Mail, Key, Pencil } from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";
import { adminApi } from "@/lib/api/admin.api";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useUser(id);
  const currentUser = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [active, setActive] = useState(true);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  const canManageUsers = currentUser?.role === "admin";

  if (query.isLoading) {
    return <LoadState />;
  }

  if (query.isError || !query.data) {
    return <ErrorState />;
  }

  const user = query.data;

  const handleResetPassword = async () => {
    setResetLoading(true);
    try {
      const result = await adminApi.resetUserPassword(id);
      addNotification({
        type: "success",
        message: result.message,
      });
      setResetPasswordOpen(false);
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to send password reset link",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      addNotification({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }
    setEmailLoading(true);
    try {
      const result = await adminApi.updateUserEmail(id, newEmail);
      addNotification({
        type: "success",
        message: result.message,
      });
      setEditEmailOpen(false);
      setNewEmail("");
      // Optionally refetch user data
      query.refetch();
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to update email address",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={user.name} subtitle="Access, identity, and activity context" />
      <SectionCard title="Profile summary">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <Badge variant="secondary" className="capitalize">{user.role.replace("_", " ")}</Badge>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
              {canManageUsers && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewEmail(user.email);
                    setEditEmailOpen(true);
                  }}
                  className="shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{user.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{user.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">State</p>
            <p className="font-medium">{user.state ?? "-"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={canManageUsers ? "Access controls" : "Access controls (view only)"}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={active ? "success" : "secondary"}>{active ? "Account active" : "Account deactivated"}</Badge>
          <Button variant="outline" size="sm" onClick={() => setActive((prev) => !prev)} disabled={!canManageUsers}>
            {active ? "Deactivate account" : "Reactivate account"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canManageUsers}
            onClick={() => setResetPasswordOpen(true)}
          >
            <Key className="h-3.5 w-3.5 mr-1.5" />
            Reset password
          </Button>
        </div>
      </SectionCard>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Send a password reset link to <span className="font-semibold">{user.email}</span>.
              The user will receive an email with instructions to set a new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)} disabled={resetLoading}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Email Address</DialogTitle>
            <DialogDescription>
              Change the email address for {user.name}. The user will be notified of this change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">New Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmailOpen(false)} disabled={emailLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmail} disabled={emailLoading}>
              {emailLoading ? "Updating..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
