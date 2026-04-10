"use client";

import { useEffect, useState } from "react";
import { Award, BarChart3, Clock, GripVertical, Heart, Plus, Save, Star, Trash2, Users, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { statisticsApi } from "@/lib/api/statistics.api";
import type { Statistic } from "@/types";

const ICON_OPTIONS: { value: Statistic["icon"]; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "clock", label: "Clock (years / time)", Icon: Clock },
  { value: "building", label: "Building (locations)", Icon: Building2 },
  { value: "users", label: "Users (people / staff)", Icon: Users },
  { value: "award", label: "Award (certification)", Icon: Award },
  { value: "heart", label: "Heart (health / care)", Icon: Heart },
  { value: "star", label: "Star (ratings)", Icon: Star },
];

function StatIcon({ name, className }: { name: Statistic["icon"]; className?: string }) {
  const map: Record<Statistic["icon"], React.ComponentType<{ className?: string }>> = {
    clock: Clock,
    building: Building2,
    users: Users,
    award: Award,
    heart: Heart,
    star: Star,
  };
  const Icon = map[name] ?? BarChart3;
  return <Icon className={className} />;
}

const DEFAULT_STATS: Statistic[] = [
  { id: "default-1", value: "0", label: "Years of Service", sublabel: "Serving since 1978", icon: "clock" },
  { id: "default-2", value: "0", label: "Locations Nationwide", sublabel: "Across Nigeria", icon: "building" },
  { id: "default-3", value: "0", label: "Staff Enrolled", sublabel: "Active beneficiaries", icon: "users" },
  { id: "default-4", value: "0", label: "Certified Standard", sublabel: "ISO 9001:2015", icon: "award" },
];

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    statisticsApi.list().then((data) => {
      setStats(data.length > 0 ? data : DEFAULT_STATS);
      setLoading(false);
    });
  }, []);

  const update = (id: string, patch: Partial<Statistic>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setSaved(false);
  };

  const addStat = () => {
    const newStat: Statistic = {
      id: `stat-${Date.now()}`,
      value: "",
      label: "",
      sublabel: "",
      icon: "star",
    };
    setStats((prev) => [...prev, newStat]);
    setSaved(false);
  };

  const removeStat = (id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await statisticsApi.updateAll(stats);
      setStats(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Statistics"
        subtitle="Edit the key figures shown on the public homepage"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={addStat} className="gap-2">
              <Plus className="h-4 w-4" /> Add stat
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </Button>
          </div>
        }
      />

      {/* Live preview */}
      <SectionCard title="Live preview">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-white dark:bg-slate-900 p-4 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-lime-600">
                <StatIcon name={stat.icon} className="h-6 w-6 text-white" />
              </div>
              <p className="text-xl font-extrabold text-green-600 dark:text-green-400">{stat.value || "—"}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stat.label || "Label"}</p>
              <p className="text-xs text-muted-foreground">{stat.sublabel || "Sublabel"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Edit cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <Card key={stat.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Stat {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeStat(stat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Value *</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => update(stat.id, { value: e.target.value })}
                      placeholder="e.g. 45+ or ISO 9001:2015"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Label *</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => update(stat.id, { label: e.target.value })}
                      placeholder="e.g. Years of Service"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Sublabel</Label>
                    <Input
                      value={stat.sublabel}
                      onChange={(e) => update(stat.id, { sublabel: e.target.value })}
                      placeholder="e.g. Serving since 1978"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Icon</Label>
                    <Select value={stat.icon} onValueChange={(v) => update(stat.id, { icon: v as Statistic["icon"] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(({ value, label, Icon }) => (
                          <SelectItem key={value} value={value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
