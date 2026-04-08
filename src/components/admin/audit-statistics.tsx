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
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { adminApi } from "@/lib/api/admin.api";
import type { OfficerStatistics, AuditLog } from "@/types";

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
  const [officerFilter, setOfficerFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statisticsQuery = useQuery({
    queryKey: ["officer-statistics", startDate, endDate],
    queryFn: () => adminApi.getOfficerStatistics({ startDate, endDate }),
  });

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs", startDate, endDate, officerFilter],
    queryFn: () => 
      adminApi.getAuditLogs({ 
        startDate, 
        endDate, 
        officer: officerFilter === "all" ? undefined : officerFilter 
      }),
  });

  const statistics: OfficerStatistics[] = statisticsQuery.data?.statistics ?? [];
  const auditLogs: AuditLog[] = auditLogsQuery.data?.logs ?? [];

  const totalStats = useMemo(() => {
    return statistics.reduce(
      (acc, stat) => ({
        totalProcessed: acc.totalProcessed + stat.totalProcessed,
        accepted: acc.accepted + stat.accepted,
        rejected: acc.rejected + stat.rejected,
        rescheduled: acc.rescheduled + stat.rescheduled,
        completed: acc.completed + stat.completed,
      }),
      {
        totalProcessed: 0,
        accepted: 0,
        rejected: 0,
        rescheduled: 0,
        completed: 0,
      }
    );
  }, [statistics]);

  const isLoading = statisticsQuery.isLoading || auditLogsQuery.isLoading;
  const isError = statisticsQuery.isError || auditLogsQuery.isError;

  if (isLoading) return <LoadState />;
  if (isError) return <ErrorState message="Could not load audit statistics." />;

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="officer-filter" className="text-sm font-medium mb-1.5 block">
              Filter by Officer
            </Label>
            <select
              id="officer-filter"
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
            >
              <option value="all">All Officers</option>
              {statistics.map((stat) => (
                <option key={stat.officerEmail} value={stat.officerEmail}>
                  {stat.officerName}
                </option>
              ))}
            </select>
          </div>
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
                setOfficerFilter("all");
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Officer Performance Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Officer Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {statistics.map((stat) => (
            <Card key={stat.officerEmail} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{stat.officerName}</p>
                    <p className="text-xs text-muted-foreground">{stat.officerEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.totalProcessed}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-semibold text-green-600 dark:text-green-400">{stat.accepted}</p>
                  <p className="text-muted-foreground">Accept</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-red-600 dark:text-red-400">{stat.rejected}</p>
                  <p className="text-muted-foreground">Reject</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{stat.rescheduled}</p>
                  <p className="text-muted-foreground">Resched</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">{stat.completed}</p>
                  <p className="text-muted-foreground">Done</p>
                </div>
              </div>

              {stat.lastActive && (
                <div className="pt-2 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last active {formatTimeAgo(stat.lastActive)}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Activity Log</h3>
        {auditLogs.length === 0 ? (
          <EmptyState 
            title="No audit logs found" 
            description="No activity recorded for the selected filters." 
          />
        ) : (
          <Card className="overflow-hidden">
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
        )}
      </div>
    </div>
  );
}
