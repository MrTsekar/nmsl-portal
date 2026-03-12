"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockResults } from "@/lib/mocks/data";
import { useAuthStore } from "@/store/auth-store";

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [announcement, setAnnouncement] = useState("Routine maintenance every Sunday at 01:00 AM.");
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayAvatar = avatarPreview ?? user?.avatar;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD";

  const onUploadAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    updateUser({ avatar: preview });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Admin Settings" subtitle="System-level controls and operational defaults" />

      <SectionCard title="Admin profile">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-xl ring-4 ring-green-100 dark:ring-green-900/50">
              {displayAvatar ? <AvatarImage src={displayAvatar} alt="Admin avatar" /> : null}
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-green-500 to-lime-600 text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-base text-slate-900 dark:text-slate-100">{user?.name ?? "Admin"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
              <Badge variant="secondary" className="mt-1 capitalize">{user?.role ?? "admin"}</Badge>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Camera className="h-4 w-4" />
              Change profile photo
              <input type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
            </label>
            <p className="text-xs text-muted-foreground">PNG or JPG. Your photo appears in the sidebar and header.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Platform configuration">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <Input className="h-10" defaultValue="noreply@nmsl.app" />
          <Input className="h-10" defaultValue="15" />
          <Input className="h-10" defaultValue="Main Campus" />
          <Input className="h-10" defaultValue="UTC+8" />
        </div>
        <div className="mt-3 sm:mt-4">
          <Button>Save configuration</Button>
        </div>
      </SectionCard>

      <SectionCard title="Portal announcements">
        <div className="space-y-3 sm:space-y-4">
          <Textarea
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
            placeholder="Write a homepage announcement for all users"
            className="min-h-[80px]"
          />
          <Button
            onClick={() => {
              setAnnouncementSaved(true);
              window.setTimeout(() => setAnnouncementSaved(false), 1800);
            }}
          >
            Publish announcement
          </Button>
          {announcementSaved ? <p className="text-sm text-green-600 dark:text-green-400">Announcement published.</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="Lab result email delivery queue">
        {/* Mobile Card Layout */}
        <div className="space-y-3 lg:hidden">
          {mockResults.map((result, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-base">{result.patientName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.testName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium mt-1">{result.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <p className="text-sm font-medium mt-1">{result.status === "ready" ? "Paid" : "Pending payment"}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Send by email</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <DataTable
          data={mockResults.map((result) => ({
            ...result,
            paymentStatus: result.status === "ready" ? "Paid" : "Pending payment",
          }))}
          columns={[
            { key: "patientName", header: "Patient" },
            { key: "testName", header: "Result" },
            { key: "date", header: "Date" },
            { key: "paymentStatus", header: "Payment" },
            {
              key: "action",
              header: "Action",
              render: () => <Button variant="outline" size="sm">Send by email</Button>,
            },
          ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}
