/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import { useAuditLogs, useAuditLogFilters } from "@/hooks/queries/useAuditor";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Search,
  FileText,
  Filter,
  Loader2,
  Calendar,
} from "lucide-react";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { stats, logs, meta, isLoading, refetch } = useAuditLogs({
    search: search || undefined,
    action: (actionFilter as any) || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    limit: 10,
  });

  // console.log(logs,"logs")

  const { actionOptions } = useAuditLogFilters();

  const handleApplyFilters = () => {
    setPage(1);
    refetch();
  };

  const handleResetFilters = () => {
    setSearch("");
    setActionFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setTimeout(() => refetch(), 0);
  };

  const getActionColor = (action: string): string => {
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes("PAYMENT") || actionUpper.includes("RECEIPT")) {
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
    }
    if (actionUpper.includes("USER") || actionUpper.includes("LOGIN")) {
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
    }
    if (actionUpper.includes("PERMIT") || actionUpper.includes("CERTIFICATE")) {
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
    }
    if (
      actionUpper.includes("FAILED") ||
      actionUpper.includes("REVOKED") ||
      actionUpper.includes("REJECTED")
    ) {
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
    }
    return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "lga_admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "treasurer":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "chairman":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div>
        <PageHeader
          title="Audit Logs"
          subtitle="Immutable record of every financial action across the platform."
        />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of every financial action across the platform."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Events"
          value={String(stats.total)}
          icon={Activity}
          color="primary"
        />
        <StatCard
          label="Payment Events"
          value={String(stats.paymentEvents)}
          icon={ShieldCheck}
          color="success"
        />
        <StatCard
          label="Permit Events"
          value={String(stats.permitEvents)}
          icon={FileText}
          color="info"
        />
        <StatCard
          label="Suspicious / Reversed"
          value={String(stats.suspicious)}
          icon={AlertTriangle}
          color="destructive"
        />
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, actor, role, targetâ€¦"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button size="sm" onClick={handleApplyFilters}>
            Apply
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Action Type
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {(actionFilter || dateFrom || dateTo) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="text-sm"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Audit Logs Table */}
      <Card className="mt-4 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                {/* REMOVED: Target column */}
                <TableHead>Meta</TableHead>
                <TableHead className="text-right">Detail</TableHead> {/* NEW */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.actor}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant="outline"
                      className={getRoleColor(log.actorRole)}
                    >
                      {log.actorRole?.replace(/_/g, " ") || "System"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  {/* REMOVED: target cell */}
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {log.meta ? JSON.stringify(log.meta).slice(0, 40) : " - "}
                    {log.meta && JSON.stringify(log.meta).length > 40 && "..."}
                  </TableCell>
                  <TableCell className="text-right">
                    {" "}
                    {/* NEW */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setSelectedLog(log)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No audit events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination  -  now reads from meta */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * meta.limit + 1}-
              {Math.min(page * meta.limit, meta.total)} of {meta.total} events
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm py-2 px-3 tabular-nums">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail dialog */}
      <AuditDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

function AuditDetailDialog({
  log,
  open,
  onClose,
}: {
  log: any;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">{log?.action}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Timestamp</div>
              <div>{log && new Date(log.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Actor</div>
              <div className="font-medium">{log?.actor}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Role</div>
              <div>{log?.actorRole?.replace(/_/g, " ")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Entity</div>
              <div>{log?.entity ?? " - "}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Entity ID</div>
              <div className="font-mono text-xs break-all">
                {log?.entityId ?? " - "}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">IP Address</div>
              <div className="font-mono text-xs">{log?.ipAddress ?? " - "}</div>
            </div>
          </div>
          {log?.meta && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Details</div>
              <pre className="bg-muted/40 rounded p-3 text-xs overflow-auto max-h-48">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

