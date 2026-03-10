"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { mockResults } from "@/lib/mocks/data";
import { useUiStore } from "@/store/ui-store";

export default function AdminSettingsPage() {
  const companyLogoUrl = useUiStore((state) => state.companyLogoUrl);
  const setCompanyLogoUrl = useUiStore((state) => state.setCompanyLogoUrl);
  const [preview, setPreview] = useState<string | null>(companyLogoUrl);
  const [announcement, setAnnouncement] = useState("Routine maintenance every Sunday at 01:00 AM.");
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    setPreview(companyLogoUrl);
  }, [companyLogoUrl]);

  const onUploadLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setPreview(result);
      setCompanyLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Admin Settings" subtitle="System-level controls and operational defaults" />

      <SectionCard title="Branding">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-[180px_1fr]">
          <div className="flex h-28 w-full sm:w-40 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Company logo preview" className="max-h-24 w-auto object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">No logo uploaded</span>
            )}
          </div>
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
              <ImagePlus className="h-4 w-4" />
              Upload company logo
              <input type="file" accept="image/*" className="hidden" onChange={onUploadLogo} />
            </label>
            <div>
              <Button variant="outline" size="sm" onClick={() => { setPreview(null); setCompanyLogoUrl(null); }}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove logo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Recommended: PNG/SVG, transparent background, square or horizontal lockup.</p>
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
