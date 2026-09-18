import {
  StatCard,
  StatusBadge,
  RoleBanner,
} from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Wallet,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Receipt,
  BarChart3,
  UserCog,
  Stamp,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Search,
  Loader2,
} from "lucide-react";

import { useOverview } from "@/hooks/queries/useOverview";
import { Role } from "@/services/apiOverview";
import {
  MiniChart,
  QuickActions,
} from "@/components/dashboard/DashboardWidgets";
import Link from "next/link";

interface AuditorOverviewProps {
  role: Role;
}

function AuditorOverview({ role }: AuditorOverviewProps) {
  const { auditorMetrics, isLoading, error } = useOverview(role);
  //   console.log(auditorMetrics,"auditorMetrics")

  if (isLoading || !auditorMetrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load auditor data</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { metrics, anomalies, highValueTransactions, recentAudits } =
    auditorMetrics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBilled = metrics.totalCollected + metrics.outstanding;
  const collectionRate =
    totalBilled > 0
      ? Math.round((metrics.totalCollected / totalBilled) * 100)
      : 0;

  return (
    <>
      {/* Row 1 - Core Financial Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Collected"
          value={formatCurrency(metrics.totalCollected)}
          icon={TrendingUp}
          trend={`${collectionRate}% of billed`}
          color="success"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(metrics.outstanding)}
          icon={AlertCircle}
          color="destructive"
        />
        <StatCard
          label="Receipts Audited"
          value={String(metrics.receiptsCount)}
          icon={Receipt}
          color="info"
        />
        <StatCard
          label="Audit Events"
          value={String(metrics.auditEvents)}
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Mini Chart & Quick Actions */}
      <div className="flex gap-6">
        {/* <MiniChart /> */}
        {/* Recent Audit Trail */}
        <Card className="flex-1 p-6 bg-gradient-card border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Recent Audit Trail</h3>
              <p className="text-xs text-muted-foreground">
                Live stream of financial actions across the platform.
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/audit-logs">
                Open full log <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No audit events recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-start gap-3 p-3 rounded-md border border-border/40 bg-secondary/30"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate uppercase">
                      {audit.action}{" "}
                      <span className="text-muted-foreground font-normal">
                        â†’ {audit.target}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {audit.actor} •{" "}
                      {audit.actorRole?.replace(/_/g, " ") || "System"} •{" "}
                      {new Date(audit.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <QuickActions
          items={[
            // {
            //   icon: Search,
            //   label: "Verify Receipt",
            //   to: "/dashboard/receipts",
            // },
            {
              icon: FileText,
              label: "Invoice Audit",
              to: "/dashboard/invoices",
            },
            // { icon: Stamp, label: "Permit Audit", to: "/dashboard/permits" },
            {
              icon: AlertTriangle,
              label: "Audit Logs",
              to: "/dashboard/audit-logs",
            },
            {
              icon: BarChart3,
              label: "Revenue Audit",
              to: "/dashboard/reports",
            },
            // {
            //   icon: UserCog,
            //   label: "Officer Activity",
            //   to: "/dashboard/field-officers",
            // },
          ]}
        />
      </div>

      {/* Two Column Layout - Channel Breakdown & Anomalies */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Collection Channel Breakdown */}
        <Card className="p-6 bg-gradient-card border-border/40">
          <h3 className="font-semibold mb-1">Collection Channel Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Cash vs digital payments  -  used to detect leakage risk.
          </p>
          <div className="space-y-3">
            {[
              {
                label: "Cash",
                amt: metrics.cashCollected,
                color: "bg-yellow-500",
              },
              {
                label: "Digital (POS / Transfer / Online)",
                amt: metrics.digitalCollected,
                color: "bg-gradient-hero",
              },
            ].map((row) => {
              const pct =
                metrics.totalCollected > 0
                  ? (row.amt / metrics.totalCollected) * 100
                  : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{row.label}</span>
                    <span className="font-mono">
                      {formatCurrency(row.amt)} • {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs flex gap-2">
            <Activity className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold">Auditor note:</span> Cash share
              above 40% indicates elevated leakage risk. Review field officer
              activity for wards trending high.
            </span>
          </div> */}
        </Card>

        {/* Anomalies Detected */}
        <Card className="p-6 bg-gradient-card border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Anomalies Detected</h3>
              <p className="text-xs text-muted-foreground">
                Invoices flagged as paid without a matching receipt.
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                anomalies.length === 0
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }
            >
              {anomalies.length} flagged
            </Badge>
          </div>
          {anomalies.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-success py-6 justify-center">
              <CheckCircle2 className="h-4 w-4" /> No anomalies detected. Books
              are clean.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalies.slice(0, 5).map((anomaly) => (
                  <TableRow key={anomaly.id}>
                    <TableCell className="font-mono text-xs">
                      {anomaly.reference}
                    </TableCell>
                    <TableCell>{anomaly.customerName}</TableCell>
                    <TableCell>{formatCurrency(anomaly.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/invoices/${anomaly.id}`}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* High-Value Transactions */}
      <Card className="p-6 bg-gradient-card border-border/40 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">High-Value Transactions</h3>
            <p className="text-xs text-muted-foreground">
              Top 5 receipts by amount  -  verify supporting documentation.
            </p>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/receipts">
              All receipts <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Levy</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {highValueTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs">
                  {transaction.receiptNumber}
                </TableCell>
                <TableCell>{transaction.customerName}</TableCell>
                <TableCell className="text-sm">
                  {transaction.levyType}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {transaction.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/receipts/${transaction.id}`}>
                      Verify
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {highValueTransactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-6"
                >
                  No high-value transactions to audit yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export default AuditorOverview;

