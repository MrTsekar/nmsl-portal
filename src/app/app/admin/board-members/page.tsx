"use client";

import { useEffect, useState } from "react";
import { UserCircle, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { boardMembersApi } from "@/lib/api/board-members.api";
import type { BoardMember } from "@/types";
import Image from "next/image";

type FormState = {
  name: string;
  title: string;
  photoUrl: string;
  bio: string;
  order: number;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  title: "",
  photoUrl: "",
  bio: "",
  order: 0,
  isActive: true,
});

export default function AdminBoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    boardMembersApi.listAll().then((data) => {
      setMembers(data);
      setLoading(false);
    });
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Step 1: Get signed upload URL from backend
      const { data } = await boardMembersApi.getUploadUrl(file.name, file.type);

      // Step 2: Upload directly to Azure
      await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type,
        },
      });

      // Step 3: Save final URL to form
      setForm({ ...form, photoUrl: data.finalUrl });
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      order: members.length + 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (member: BoardMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      title: member.title,
      photoUrl: member.photoUrl,
      bio: member.bio || "",
      order: member.order,
      isActive: member.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await boardMembersApi.update(editingId, form);
      } else {
        await boardMembersApi.create(form);
      }
      setDialogOpen(false);
      const updated = await boardMembersApi.listAll();
      setMembers(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this board member?")) return;
    
    try {
      await boardMembersApi.delete(id);
      const updated = await boardMembersApi.listAll();
      setMembers(updated);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const toggleActive = async (member: BoardMember) => {
    try {
      await boardMembersApi.toggleActive(member.id);
      const updated = await boardMembersApi.listAll();
      setMembers(updated);
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Board Members" subtitle="Manage board of directors displayed on the website" />
        <Card>
          <CardContent className="p-8 text-center text-slate-500">Loading board members...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Board Members"
        subtitle="Manage board of directors displayed on the website"
        actionLabel="+ Add member"
        onAction={openCreate}
      />

      <SectionCard title="Board of Directors">
        {members.length === 0 ? (
          <div className="p-8 text-center">
            <UserCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No board members yet</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first board member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {members.map((member) => (
              <Card key={member.id} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="relative h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        width={200}
                        height={160}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <UserCircle className="h-16 w-16 text-slate-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{member.name}</h3>
                      <Badge variant={member.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                      {member.title}
                    </p>
                    {member.bio && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {member.bio}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">Order: {member.order}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(member)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(member)}
                    >
                      {member.isActive ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
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
            <DialogTitle>{editingId ? "Edit Board Member" : "Add Board Member"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Dr. John Smith"
              />
            </div>

            <div>
              <Label htmlFor="title">Title/Position *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Chairman, MD, EVP"
              />
            </div>

            <div>
              <Label htmlFor="photoUrl">Photo *</Label>
              <div className="space-y-2">
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <p className="text-sm text-blue-600">Uploading photo...</p>
                )}
                {form.photoUrl && !uploading && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <Image
                        src={form.photoUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-green-600">Photo uploaded successfully</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio/Description (optional)</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief description of the board member"
                rows={3}
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
            <Button onClick={handleSubmit} disabled={saving || !form.name || !form.title || !form.photoUrl}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
