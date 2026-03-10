"use client";

import { useMemo, useState } from "react";
import { Eye, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useResults } from "@/hooks/use-app-data";

export default function PatientMedicalResultsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const query = useResults();

  const detail = useMemo(() => query.data?.find((result) => result.id === selected), [query.data, selected]);

  return (
    <div className="space-y-6">
      <PageHeader title="Medical Results" subtitle="Review lab and diagnostic results with current status" />

      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            All test results are included in your consultation fee
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            You can view all your results below at no additional cost
          </p>
        </div>
      </div>

      {query.isLoading ? <LoadState /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.isSuccess && query.data.length === 0 ? <EmptyState title="No results yet" description="Your test results will appear here once available." /> : null}
      {query.data?.length ? (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {query.data.map((result) => (
              <Sheet key={result.id}>
                <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-base">{result.testName}</h3>
                    <StatusBadge status={result.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium">{result.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                      <p className="font-medium">{result.doctor}</p>
                    </div>
                  </div>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelected(result.id)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </Button>
                  </SheetTrigger>
                </div>
                <SheetContent>
                  <SheetTitle className="text-lg font-semibold">{detail?.testName ?? "Result"}</SheetTitle>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 rounded-md border border-border bg-muted/20 p-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Patient</p>
                          <p className="font-medium">{detail?.patientName ?? "Arianna Lim"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <StatusBadge status={detail?.status ?? "pending"} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Doctor</p>
                          <p className="font-medium">{detail?.doctor ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Laboratory</p>
                          <p className="font-medium">{detail?.labName ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Specimen</p>
                          <p className="font-medium">{detail?.specimen ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Test Date</p>
                          <p className="font-medium">{detail?.date ?? "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-border p-3">
                      <h4 className="text-sm font-semibold">Result details</h4>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Result</p>
                          <p className="font-medium">{detail?.resultValue ?? "-"} {detail?.unit ?? ""}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reference range</p>
                          <p className="font-medium">{detail?.referenceRange ?? "-"}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{detail?.interpretation ?? detail?.summary ?? "No interpretation provided."}</p>
                    </div>

                    <div className="rounded-md border border-border p-3">
                      <h4 className="text-sm font-semibold">Timeline</h4>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Collected: {detail?.collectedAt ?? "-"}</p>
                        <p>Reported: {detail?.reportedAt ?? "Pending"}</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              data={query.data}
              columns={[
                { key: "testName", header: "Test" },
                { key: "date", header: "Date" },
                { key: "doctor", header: "Doctor" },
                { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "action",
                  header: "Details",
                  render: (row) => (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelected(row.id)}>
                          <Eye className="mr-1 h-4 w-4" /> Open
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetTitle className="text-lg font-semibold">{detail?.testName ?? "Result"}</SheetTitle>
                        <div className="mt-4 space-y-4">
                          <div className="grid gap-3 rounded-md border border-border bg-muted/20 p-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Patient</p>
                                <p className="font-medium">{detail?.patientName ?? "Arianna Lim"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <StatusBadge status={detail?.status ?? "pending"} />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Doctor</p>
                                <p className="font-medium">{detail?.doctor ?? "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Laboratory</p>
                                <p className="font-medium">{detail?.labName ?? "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Specimen</p>
                                <p className="font-medium">{detail?.specimen ?? "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Test Date</p>
                                <p className="font-medium">{detail?.date ?? "-"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-md border border-border p-3">
                            <h4 className="text-sm font-semibold">Result details</h4>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Result</p>
                                <p className="font-medium">{detail?.resultValue ?? "-"} {detail?.unit ?? ""}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Reference range</p>
                                <p className="font-medium">{detail?.referenceRange ?? "-"}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{detail?.interpretation ?? detail?.summary ?? "No interpretation provided."}</p>
                          </div>

                          <div className="rounded-md border border-border p-3">
                            <h4 className="text-sm font-semibold">Timeline</h4>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <p>Collected: {detail?.collectedAt ?? "-"}</p>
                              <p>Reported: {detail?.reportedAt ?? "Pending"}</p>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
