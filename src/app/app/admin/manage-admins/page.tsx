"use client";

import { useState, useMemo } from "react";
import { KeyRound, MapPin, Plus, Search, Trash2, UserCog } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { mockUsers } from "@/lib/mocks/data";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { NIGERIA_LOCATIONS } from "@/lib/constants/locations";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import type { User } from "@/types";

const LOCATION_OPTIONS = [...NIGERIA_LOCATIONS, "Other"] as const;

type AdminRow = User & { active: boolean };

export default function ManageAdminsPage() {
  const { user: currentUser } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Local mutable list of admins (seeded from mockUsers)
  const [admins, setAdmins] = useState<AdminRow[]>(() =>
    mockUsers
      .filter((u) => u.role === "admin")
      .map((u) => ({ ...u, active: true }))
  );
  const [deactivatedIds, setDeactivatedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "Abuja" as (typeof LOCATION_OPTIONS)[number],
    state: "FCT",
    address: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Change password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwAdminId, setPwAdminId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const pushNotif = (title: string, message: string) =>
    addNotification({
      id: `n-adm-${Date.now()}`,
      title,
      message,
      createdAt: "Just now",
      read: false,
      category: "admin_activity",
      roles: ["super_admin"],
    });

  const rows = useMemo(() => {
    const all = admins.map((a) => ({
      ...a,
      active: !deactivatedIds.includes(a.id),
    }));
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.state ?? "").toLowerCase().includes(q)
    );
  }, [admins, deactivatedIds, searchQuery]);

  const toggleDeactivate = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    const isCurrentlyActive = !deactivatedIds.includes(id);
    setDeactivatedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    if (admin) {
      if (isCurrentlyActive) {
        pushNotif("Admin deactivated", `${admin.name} (${admin.location}) was deactivated.`);
      } else {
        pushNotif("Admin reactivated", `${admin.name} (${admin.location}) was reactivated.`);
      }
    }
  };

  const handleDelete = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    setDeactivatedIds((prev) => prev.filter((x) => x !== id));
    if (admin) {
      pushNotif("Admin deleted", `${admin.name} (${admin.location}) was removed from the platform.`);
    }
  };

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", phone: "", location: "Abuja", state: "FCT", address: "" });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      // In production this would call adminApi.createAdmin(form)
      await new Promise((r) => setTimeout(r, 600)); // mock latency
      const newAdmin: AdminRow = {
        id: `u-adm-${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        role: "admin",
        location: form.location,
        state: form.state,
        address: form.address.trim(),
        phone: form.phone.trim(),
        active: true,
      };
      setAdmins((prev) => [newAdmin, ...prev]);
      pushNotif("Admin created", `New admin ${newAdmin.name} was created for ${newAdmin.location} facility.`);
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const openChangePw = (admin: AdminRow) => {
    setPwAdminId(admin.id);
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
    setPwDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwSaving(true);
    setPwError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const admin = admins.find((a) => a.id === pwAdminId);
      if (admin) {
        pushNotif("Admin password changed", `You changed the password for ${admin.name} (${admin.location}).`);
      }
      setPwDialogOpen(false);
    } finally {
      setPwSaving(false);
    }
  };

  // Stats
  const activeCount = rows.filter((r) => r.active).length;
  const locationCount = new Set(admins.map((a) => a.location)).size;
  const pwTargetAdmin = admins.find((a) => a.id === pwAdminId) ?? null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Manage Admins"
        subtitle="Create and manage location-based admin accounts across all NMSL facilities"
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add admin
          </Button>
        }
      />

      {/* Super admin notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 px-4 py-3">
        <UserCog className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Super Admin access only.</strong> Each admin account is scoped to a single facility — they can only manage doctors, services, and users for that location. You ({currentUser?.name}) can create admins for any location.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{admins.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total admins</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{locationCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Facilities covered</p>
          </CardContent>
        </Card>
      </div>

      <SectionCard title="Admin accounts">
        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
            placeholder="Search by name, email, or location..."
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {rows.map((admin) => (
            <Card key={admin.id} className={`border-border/60 ${!admin.active ? "opacity-60" : ""}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                  <Badge variant={admin.active ? "success" : "secondary"}>
                    {admin.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {admin.location} {admin.state && `· ${admin.state}`}
                </p>
                <div className="flex gap-2 pt-1 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleDeactivate(admin.id)}
                  >
                    {admin.active ? "Deactivate" : "Reactivate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Change password"
                    onClick={() => openChangePw(admin)}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(admin.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No admins found.</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            data={rows}
            columns={[
              { key: "name", header: "Name" },
              { key: "email", header: "Email" },
              {
                key: "location",
                header: "Facility",
                render: (row) => (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {row.location}
                  </span>
                ),
              },
              { key: "state", header: "State" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Badge variant={row.active ? "success" : "secondary"}>
                    {row.active ? "Active" : "Inactive"}
                  </Badge>
                ),
              },
              {
                key: "action",
                header: "Actions",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleDeactivate(row.id)}>
                      {row.active ? "Deactivate" : "Reactivate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Change password"
                      onClick={() => openChangePw(row)}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </SectionCard>

      {/* Create Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create admin account</DialogTitle>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Choose location carefully.</strong> The admin will only be able to manage doctors, services, and users for the selected facility.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Facility Location *</Label>
                <Select
                  value={form.location}
                  onValueChange={(v) => setForm((p) => ({ ...p, location: v as typeof form.location }))}
                >
                  <SelectTrigger className="border-primary/60 ring-1 ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>State *</Label>
                {form.location === "Other" ? (
                  <Input
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                ) : (
                  <Select
                    value={form.state}
                    onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Olumide Adeyemi"
              />
            </div>
            <div className="space-y-1">
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin.location@nmsl.app"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Office Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Facility address"
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Creating…" : "Create admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Change password{pwTargetAdmin ? ` — ${pwTargetAdmin.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <Label>New Password *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            {pwError && (
              <p className="text-sm text-destructive">{pwError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" onClick={() => setPwDialogOpen(false)} disabled={pwSaving}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={pwSaving}>
                {pwSaving ? "Saving…" : "Change password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
