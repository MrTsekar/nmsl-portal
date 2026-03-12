"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { servicesApi } from "@/lib/api/services.api";
import type { KeyService, Service, ServiceCategory } from "@/types";

const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Emergency Services",
  "Specialized Care",
  "Dental Care",
  "Primary Care",
  "Surgical Services",
  "Diagnostic Services",
  "Women's Health",
  "Pediatric Care",
  "Mental Health",
  "Rehabilitation",
];

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  "Emergency Services": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Specialized Care": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Dental Care": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Primary Care": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Surgical Services": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Diagnostic Services": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Women's Health": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Pediatric Care": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "Mental Health": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Rehabilitation": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

type FormState = {
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  bannerImageUrl: string | undefined;
  iconImageUrl: string | undefined;
  keyServices: KeyService[];
};

const emptyForm = (): FormState => ({
  name: "",
  category: "Primary Care",
  shortDescription: "",
  fullDescription: "",
  bannerImageUrl: undefined,
  iconImageUrl: undefined,
  keyServices: [],
});

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  // Key service row being edited
  const [ksTitle, setKsTitle] = useState("");
  const [ksDesc, setKsDesc] = useState("");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Track local object URLs to revoke on unmount / change
  const bannerObjectUrl = useRef<string | undefined>(undefined);
  const iconObjectUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    servicesApi.list().then((data) => {
      setServices(data);
      setLoading(false);
    });
    return () => {
      if (bannerObjectUrl.current) URL.revokeObjectURL(bannerObjectUrl.current);
      if (iconObjectUrl.current) URL.revokeObjectURL(iconObjectUrl.current);
    };
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setKsTitle("");
    setKsDesc("");
    setDialogOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      category: svc.category,
      shortDescription: svc.shortDescription,
      fullDescription: svc.fullDescription,
      bannerImageUrl: svc.bannerImageUrl,
      iconImageUrl: svc.iconImageUrl,
      keyServices: svc.keyServices.map((ks) => ({ ...ks })),
    });
    setKsTitle("");
    setKsDesc("");
    setDialogOpen(true);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "bannerImageUrl" | "iconImageUrl",
    objectUrlRef: React.MutableRefObject<string | undefined>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setForm((prev) => ({ ...prev, [field]: url }));
    // Reset input so same file can be re-selected
    event.target.value = "";
  };

  const addKeyService = () => {
    if (!ksTitle.trim()) return;
    const newKs: KeyService = {
      id: `ks-new-${Date.now()}`,
      title: ksTitle.trim(),
      description: ksDesc.trim(),
    };
    setForm((prev) => ({ ...prev, keyServices: [...prev.keyServices, newKs] }));
    setKsTitle("");
    setKsDesc("");
  };

  const removeKeyService = (id: string) => {
    setForm((prev) => ({ ...prev, keyServices: prev.keyServices.filter((ks) => ks.id !== id) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.shortDescription.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await servicesApi.update(editingId, form);
        setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await servicesApi.create(form);
        setServices((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await servicesApi.delete(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Services"
        subtitle="Manage the services shown on the public website"
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add service
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <SectionCard title="">
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <ImagePlus className="h-10 w-10 opacity-30" />
            <p className="text-sm">No services yet. Click <strong>Add service</strong> to get started.</p>
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc.id} className="overflow-hidden border-border/60">
              {/* Banner */}
              <div className="relative h-36 bg-gradient-to-br from-green-500/20 to-lime-500/10 overflow-hidden">
                {svc.bannerImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={svc.bannerImageUrl} alt={svc.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImagePlus className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Icon badge */}
                {svc.iconImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={svc.iconImageUrl}
                    alt="Icon"
                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 object-cover bg-white shadow"
                  />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm leading-tight">{svc.name}</p>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[svc.category]}`}>
                      {svc.category}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(svc)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(svc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{svc.shortDescription}</p>

                {svc.keyServices.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {svc.keyServices.slice(0, 3).map((ks) => (
                      <Badge key={ks.id} variant="secondary" className="text-xs py-0 px-2">{ks.title}</Badge>
                    ))}
                    {svc.keyServices.length > 3 && (
                      <Badge variant="secondary" className="text-xs py-0 px-2">+{svc.keyServices.length - 3} more</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit service" : "Add new service"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">

            {/* Basic info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Service Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Cardiology Services"
                />
              </div>
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as ServiceCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Short Description * <span className="text-xs text-muted-foreground">(shown on service card)</span></Label>
              <Input
                value={form.shortDescription}
                onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                placeholder="One-line summary of the service"
              />
            </div>

            <div className="space-y-1">
              <Label>Full Description <span className="text-xs text-muted-foreground">(shown on service detail page)</span></Label>
              <Textarea
                rows={4}
                value={form.fullDescription}
                onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))}
                placeholder="Detailed description of the service..."
              />
            </div>

            {/* Images */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Banner */}
              <div className="space-y-2">
                <Label>Banner Image <span className="text-xs text-muted-foreground">(full-width hero)</span></Label>
                <div
                  className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {form.bannerImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.bannerImageUrl} alt="Banner preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                        onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, bannerImageUrl: undefined })); }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Click to upload banner</span>
                    </div>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "bannerImageUrl", bannerObjectUrl)}
                />
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label>Service Icon <span className="text-xs text-muted-foreground">(small badge / thumbnail)</span></Label>
                <div
                  className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20"
                  onClick={() => iconInputRef.current?.click()}
                >
                  {form.iconImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.iconImageUrl} alt="Icon preview" className="h-20 w-20 rounded-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                        onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, iconImageUrl: undefined })); }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Click to upload icon</span>
                    </div>
                  )}
                </div>
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "iconImageUrl", iconObjectUrl)}
                />
              </div>
            </div>

            {/* Key Services */}
            <div className="space-y-3">
              <Label>Key Services <span className="text-xs text-muted-foreground">(feature list shown on service page)</span></Label>

              {form.keyServices.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border/60 p-3">
                  {form.keyServices.map((ks, i) => (
                    <div key={ks.id} className="flex items-start gap-3 group">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-lime-600 text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ks.title}</p>
                        {ks.description && <p className="text-xs text-muted-foreground">{ks.description}</p>}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => removeKeyService(ks.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add key service row */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">Title</span>
                  <Input
                    value={ksTitle}
                    onChange={(e) => setKsTitle(e.target.value)}
                    placeholder="e.g. General Anaesthesia"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyService(); } }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">Description (optional)</span>
                  <Input
                    value={ksDesc}
                    onChange={(e) => setKsDesc(e.target.value)}
                    placeholder="Short description"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyService(); } }}
                  />
                </div>
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={addKeyService}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.shortDescription.trim()}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create service"}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
