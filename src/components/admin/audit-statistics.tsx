"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, User, CheckCircle2, XCircle, RefreshCcw, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { LoadState } from "@/components/shared/load-state";
import { EmptyState } from "@/components/shared/empty-state";
import { adminApi } from "@/lib/api/admin.api";
import { useAppointments } from "@/hooks/use-app-data";
import type { AuditLog } from "@/types";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(dateString);
}

const actionColors: Record<string, string> = {
  accepted: "text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
  rejected: "text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  rescheduled: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  completed: "text-purple-700 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
};

interface AuditStatisticsProps {
  className?: string;
}

export function AuditStatistics({ className }: AuditStatisticsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const appointments = useAppointments();

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs", startDate, endDate],
    queryFn: () => 
      adminApi.getAuditLogs({ 
        startDate, 
        endDate,
      }),
  });

  const auditLogs: AuditLog[] = auditLogsQuery.data?.logs ?? [];

  const totalStats = useMemo(() => {
    const data = appointments.data ?? [];
    
    // Calculate stats from actual appointment statuses
    const confirmed = data.filter(a => a.status === 'confirmed').length;
    const rejected = data.filter(a => a.status === 'rejected').length;
    const rescheduled = data.filter(a => a.status === 'rescheduled').length;
    const completed = data.filter(a => a.status === 'completed').length;
    const totalProcessed = confirmed + rejected + rescheduled + completed;
    
    return {
      totalProcessed,
      accepted: confirmed,
      rejected,
      rescheduled,
      completed,
    };
  }, [appointments.data]);

  const isLoading = appointments.isLoading || auditLogsQuery.isLoading;

  if (isLoading) return <LoadState />;

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Processed"
          value={totalStats.totalProcessed}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Accepted"
          value={totalStats.accepted}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Rejected"
          value={totalStats.rejected}
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Rescheduled"
          value={totalStats.rescheduled}
          icon={<RefreshCcw className="h-5 w-5" />}
        />
        <StatCard
          title="Completed"
          value={totalStats.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="start-date" className="text-sm font-medium mb-1.5 block">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-sm font-medium mb-1.5 block">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Activity Log</h3>
        {auditLogs.length === 0 ? (
          <EmptyState 
            title="No audit logs found" 
            description="No activity recorded for the selected filters." 
          />
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="space-y-3 md:hidden">
              {auditLogs.map((log) => (
                <Card key={log.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionColors[log.action] ?? ""}`}>
                      {log.action === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {log.action === "rejected" && <XCircle className="h-3.5 w-3.5" />}
                      {log.action === "rescheduled" && <RefreshCcw className="h-3.5 w-3.5" />}
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(log.performedAt)}</span>
                  </div>
                  <p className="font-medium text-sm">{log.patientName}</p>
                  <p className="text-xs text-muted-foreground">{log.performedBy}</p>
                  {log.details && <p className="text-xs text-muted-foreground border-t pt-2">{log.details}</p>}
                </Card>
              ))}
            </div>

            {/* Desktop table */}
            <Card className="overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Timestamp</th>
                      <th className="text-left px-4 py-3 font-semibold">Patient</th>
                      <th className="text-left px-4 py-3 font-semibold">Action</th>
                      <th className="text-left px-4 py-3 font-semibold">Officer</th>
                      <th className="text-left px-4 py-3 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.performedAt)}
                        </td>
                        <td className="px-4 py-3 font-medium">{log.patientName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionColors[log.action] ?? ""}`}>
                            {log.action === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {log.action === "rejected" && <XCircle className="h-3.5 w-3.5" />}
                            {log.action === "rescheduled" && <RefreshCcw className="h-3.5 w-3.5" />}
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{log.performedBy}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                          {log.details || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
