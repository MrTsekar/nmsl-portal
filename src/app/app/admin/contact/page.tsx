"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { contactApi } from "@/lib/api/contact.api";
import type { ContactInfo } from "@/types";

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    contactApi.get().then((data) => {
      setContact(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    if (!contact) return;
    setContact({ ...contact, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);
    try {
      const updated = await contactApi.update({
        phone: contact.phone,
        emailPrimary: contact.emailPrimary,
        emailSecondary: contact.emailSecondary,
        addressLine1: contact.addressLine1,
        addressLine2: contact.addressLine2,
        city: contact.city,
        country: contact.country,
        officeHours: contact.officeHours,
        emergencyHours: contact.emergencyHours,
      });
      setContact(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Contact Information" subtitle="Manage contact details displayed on the website" />
        <Card>
          <CardContent className="p-8 text-center text-slate-500">Loading contact information...</CardContent>
        </Card>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Contact Information" subtitle="Manage contact details displayed on the website" />
        <Card>
          <CardContent className="p-8 text-center text-slate-500">No contact information found</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Contact Information"
        subtitle="Manage contact details displayed on the website"
        action={
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Phone Section */}
        <SectionCard title="Phone">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <Label htmlFor="phone" className="text-xs text-slate-600 dark:text-slate-400">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={contact.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+234 XXX XXX XXXX"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Email Section */}
        <SectionCard title="Email">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="emailPrimary" className="text-xs text-slate-600 dark:text-slate-400">
                    Primary Email
                  </Label>
                  <Input
                    id="emailPrimary"
                    type="email"
                    value={contact.emailPrimary}
                    onChange={(e) => handleChange("emailPrimary", e.target.value)}
                    placeholder="primary@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emailSecondary" className="text-xs text-slate-600 dark:text-slate-400">
                    Secondary Email (optional)
                  </Label>
                  <Input
                    id="emailSecondary"
                    type="email"
                    value={contact.emailSecondary || ""}
                    onChange={(e) => handleChange("emailSecondary", e.target.value)}
                    placeholder="secondary@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Location Section */}
        <SectionCard title="Location">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="p-2 bg-slate-700 dark:bg-slate-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="addressLine1" className="text-xs text-slate-600 dark:text-slate-400">
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    value={contact.addressLine1}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2" className="text-xs text-slate-600 dark:text-slate-400">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    value={contact.addressLine2}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    placeholder="City, State"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city" className="text-xs text-slate-600 dark:text-slate-400">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={contact.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs text-slate-600 dark:text-slate-400">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={contact.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="Country"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Office Hours Section */}
        <SectionCard title="Office Hours">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="officeHours" className="text-xs text-slate-600 dark:text-slate-400">
                    Regular Hours
                  </Label>
                  <Input
                    id="officeHours"
                    value={contact.officeHours}
                    onChange={(e) => handleChange("officeHours", e.target.value)}
                    placeholder="Monday - Friday: 9AM - 5PM"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyHours" className="text-xs text-slate-600 dark:text-slate-400">
                    Emergency Hours
                  </Label>
                  <Input
                    id="emergencyHours"
                    value={contact.emergencyHours}
                    onChange={(e) => handleChange("emergencyHours", e.target.value)}
                    placeholder="Available 24/7"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
