"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { MapPin, Search } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useUsers } from "@/hooks/use-app-data";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const canManageUsers = user?.role === "admin";
  const usersQuery = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const rows = useMemo(() => {
    const allUsers = usersQuery.data ?? [];
    if (!searchQuery.trim()) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.location.toLowerCase().includes(query)
    );
  }, [usersQuery.data, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Users"
        subtitle={canManageUsers ? "User directory across patient, doctor, and admin roles" : "User directory (view only)"}
        action={
          canManageUsers ? (
            <Button>
              <span className="hidden sm:inline">Create User</span>
              <span className="sm:hidden">Create</span>
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 px-4 py-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Viewing all users across all NMSL facilities.
        </p>
      </div>

      {usersQuery.isLoading && <LoadState />}
      {usersQuery.isError && <ErrorState message="Could not fetch users from the server." />}

      {!usersQuery.isLoading && !usersQuery.isError && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
              placeholder="Search by name, email, role, or location..."
            />
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-base">{u.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{u.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <Badge variant="secondary" className="capitalize mt-1">{u.role}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium mt-1">{u.location}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <Link href={`/app/admin/users/${u.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Open profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <DataTable
              data={rows}
              columns={[
                { key: "name", header: "Name" },
                { key: "email", header: "Email" },
                { key: "role", header: "Role" },
                { key: "location", header: "Location" },
                {
                  key: "action",
                  header: "Action",
                  render: (row) => (
                    <Link href={`/app/admin/users/${row.id}`} className="text-primary hover:underline">
                      Open profile
                    </Link>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
