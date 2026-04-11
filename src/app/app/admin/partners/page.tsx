"use client";

import { useEffect, useState } from "react";
import { Handshake, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { partnersApi } from "@/lib/api/partners.api";
import type { Partner } from "@/types";
import Image from "next/image";

type FormState = {
  name: string;
  logoUrl: string;
  description: string;
  order: number;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  logoUrl: "",
  description: "",
  order: 0,
  isActive: true,
});

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    partnersApi.listAll().then((data) => {
      setPartners(data);
      setLoading(false);
    });
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      order: partners.length + 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      logoUrl: partner.logoUrl,
      description: partner.description || "",
      order: partner.order,
      isActive: partner.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        // Update existing partner
        await partnersApi.update(editingId, form);
      } else {
        // Create new partner
        await partnersApi.create(form);
      }
      setDialogOpen(false);
      // Refresh list
      const updated = await partnersApi.listAll();
      setPartners(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    
    try {
      await partnersApi.delete(id);
      // Refresh list
      const updated = await partnersApi.listAll();
      setPartners(updated);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm({ ...form, logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const toggleActive = async (partner: Partner) => {
    try {
      await partnersApi.toggleActive(partner.id);
      // Refresh list
      const updated = await partnersApi.listAll();
      setPartners(updated);
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Get signed upload URL from backend
      const { data } = await partnersApi.getUploadUrl(file.name, file.type);
      const { uploadUrl, finalUrl } = data;

      // Step 2: Upload directly to Azure
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to Azure failed');
      }

      // Step 3: Set final Azure URL in form
      setForm({ ...form, logoUrl: finalUrl });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Partners" subtitle="Manage trusted partners displayed on the website" />
        <Card>
          <CardContent className="p-8 text-center text-slate-500">Loading partners...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Partners"
        subtitle="Manage trusted partners displayed on the website"
        actionLabel="+ Add partner"
        onAction={openCreate}
      />

      <SectionCard title="All Partners">
        {partners.length === 0 ? (
          <div className="p-8 text-center">
            <Handshake className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No partners yet</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first partner
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="relative h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {partner.logoUrl ? (
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        width={120}
                        height={80}
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{partner.name}</h3>
                      <Badge variant={partner.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                        {partner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {partner.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {partner.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">Order: {partner.order}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(partner)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(partner)}
                    >
                      {partner.isActive ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(partner.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Partner" : "Add Partner"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Partner Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Nigerian Port Authority"
              />
            </div>

            <div>
              <Label htmlFor="logo">Partner Logo *</Label>
              <div
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => !uploading && document.getElementById("logo-upload")?.click()}
              >
                {form.logoUrl ? (
                  <div className="relative">
                    <div className="relative h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg mb-2">
                      <Image src={form.logoUrl} alt="Logo preview" width={200} height={128} className="max-h-32 w-auto object-contain" />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                      onClick={(e) => { e.stopPropagation(); setForm({ ...form, logoUrl: "" }); }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click to change logo</p>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium mb-1">
                      {uploading ? 'Uploading...' : 'Click to upload partner logo'}
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, SVG up to 5MB</p>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the partner"
              />
            </div>

            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <p className="text-xs text-slate-500 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (shown on website)
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !form.name || !form.logoUrl}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
