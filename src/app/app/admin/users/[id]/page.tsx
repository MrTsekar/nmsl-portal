"use client";

import { use, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-app-data";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useUser(id);
  const [active, setActive] = useState(true);

  if (query.isLoading) {
    return <LoadState />;
  }

  if (query.isError || !query.data) {
    return <ErrorState />;
  }

  const user = query.data;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={user.name} subtitle="Access, identity, and activity context" />
      <SectionCard title="Profile summary">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{user.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{user.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">State</p>
            <p className="font-medium">{user.state ?? "-"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Access controls">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={active ? "success" : "secondary"}>{active ? "Account active" : "Account deactivated"}</Badge>
          <Button variant="outline" size="sm" onClick={() => setActive((prev) => !prev)}>
            {active ? "Deactivate account" : "Reactivate account"}
          </Button>
          <Button variant="outline" size="sm">Reset password</Button>
        </div>
      </SectionCard>
    </div>
  );
}
