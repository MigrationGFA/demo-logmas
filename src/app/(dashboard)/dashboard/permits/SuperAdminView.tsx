import React from "react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import {
  Stamp,
  Clock,
  Search,
  Users,
  Wallet,
  MoreHorizontal,
  Eye,
  FilePlus2,
  ShieldAlert,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  usePermits,
  useRevokePermit,
  useWardManagement,
} from "@/hooks/queries/useLgaAdmin";
import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricsSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { NGN, statusClass } from "./page";

function SuperAdminView() {
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { useGetWards } = useWardManagement();

  const { data, isLoading, error, refetch } = usePermits({
    search: search || undefined,
    wardId: ward !== "all" ? ward : undefined,
    page,
    limit: 20,
  });

  const { mutate: revokePermit, isPending: isRevoking } = useRevokePermit();

  // console.log(data,"data")

  const permits = data?.permits || [];
  const stats = data?.stats || {
    issued: 0,
    pending: 0,
    totalRevenue: 0,
    activeOfficers: 0,
  };
  const meta = data?.meta;

  // Get unique wards from the permits data
  // const wards = useMemo(() => {
  //   return Array.from(
  //     new Set(permits.map((p) => p.ward).filter(Boolean) as string[]),
  //   ).sort();
  // }, [permits]);

  const { data: wardsData } = useGetWards({
    limit: 100,
  });

  const wards = useMemo(() => wardsData || [], [wardsData]);

  const handleRevoke = (id: string, permitNumber: string) => {
    if (confirm(`Are you sure you want to revoke permit ${permitNumber}?`)) {
      revokePermit({ id, revokeReason: "Administrative action" });
      // Refetch after a short delay to let the mutation complete
      setTimeout(() => refetch(), 1000);
    }
  };

  if (isLoading && permits.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Global Trade Permits Ledger"
          subtitle="Comprehensive local government authority compliance tracker."
          action={
            <Button asChild>
              <Link href="/dashboard/permits/new">
                <FilePlus2 className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
          }
        />
        <MetricsSkeleton count={4} />
        <TableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  if (error && permits.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Global Trade Permits Ledger"
          subtitle="Comprehensive local government authority compliance tracker."
          action={
            <Button asChild>
              <Link href="/dashboard/permits/new">
                <FilePlus2 className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
          }
        />
        <ErrorState
          title="Failed to load permits ledger"
          error={error}
          refetch={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Global Trade Permits Ledger"
        subtitle="Comprehensive local government authority compliance tracker."
        action={
          <Button asChild>
            <Link href="/dashboard/permits/new">
              <FilePlus2 className="h-4 w-4 mr-2" />
              New Application
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Permits Issued"
          value={String(stats.issued)}
          icon={Stamp}
          // trend="+12% MoM"
        />
        <StatCard
          label="Pending Approvals"
          value={String(stats.pending)}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Total Revenue Generated"
          value={NGN(stats.totalRevenue)}
          icon={Wallet}
          color="success"
        />
        <StatCard
          label="Active Field Officers"
          value={String(stats.activeOfficers)}
          icon={Users}
          color="primary"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name or permit numberâ€¦"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select value={ward} onValueChange={setWard}>
            <SelectTrigger className="w-[220px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Ward / Street" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permit Ref</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Ward / Zone</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map((p) => (
                <TableRow key={p.id} className="transition-smooth">
                  <TableCell className="font-mono text-xs">
                    {p.permitNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{p.businessName}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.ownerName}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.ward || " - "}</TableCell>
                  <TableCell>{NGN(p.fee)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.validTo ? new Date(p.validTo).toLocaleDateString() : " - "}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClass(p.status)}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/permits/${p.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/permits/${p.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRevoke(p.id, p.permitNumber)}
                            disabled={isRevoking}
                          >
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            {isRevoking ? "Revoking..." : "Revoke Permit"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {permits.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No permits found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm py-2 px-3">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SuperAdminView;

