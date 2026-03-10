"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/mocks/data";

export default function AdminUsersPage() {
  const [deactivatedIds, setDeactivatedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const rows = useMemo(() => {
    const allUsers = mockUsers.map((user) => ({
      ...user,
      active: !deactivatedIds.includes(user.id),
    }));

    if (!searchQuery.trim()) {
      return allUsers;
    }

    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query)
    );
  }, [deactivatedIds, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="User directory across patient, doctor, and admin roles" />
      
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          placeholder="Search by name, email, role, or location..."
        />
      </div>

      <DataTable
        data={rows}
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "role", header: "Role" },
          { key: "location", header: "Location" },
          {
            key: "state",
            header: "Account",
            render: (row) => <Badge variant={row.active ? "success" : "secondary"}>{row.active ? "Active" : "Deactivated"}</Badge>,
          },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/app/admin/users/${row.id}`} className="text-primary hover:underline">
                  Open profile
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeactivatedIds((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id],
                    )
                  }
                >
                  {row.active ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
