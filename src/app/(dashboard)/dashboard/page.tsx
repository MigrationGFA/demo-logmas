/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { StatCard, StatusBadge, RoleBanner } from "@/components/dashboard/shared";
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
  Clock,
  AlertCircle,
  FileText,
  Users,
  FileBadge,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  UserCog,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/queries/useAuth";
import { tokenManager } from "@/services/apiAuth";
import CitizenOverview from "@/components/dashboard/overview/citizenOverview";
import { Role } from "@/services/apiOverview";
import BusinessOverview from "@/components/dashboard/overview/businessOverview";
import TreasurerOverview from "@/components/dashboard/overview/TreasurerOverview";
import FieldOfficerOverview from "@/components/dashboard/overview/FieldOfficerOverview";
import AdminOverview from "@/components/dashboard/overview/AdminOverview";
import {
  useChairmanApplications,
  useChairmanComplaints,
  useChairmanOverview,
  useChairmanRevenue,
  useChairmanWards,
} from "@/hooks/queries/useChairman";
import { useOverview } from "@/hooks/queries/useOverview";
import AuditorOverview from "@/components/dashboard/overview/AuditorOverview";
import ContractorOverview from "@/components/dashboard/overview/ContractorOverview";
import Link from "next/link";
import CouncillorOverview from "@/components/dashboard/overview/CouncillorOverview";


export default function DashboardOverview() {
 const { isLoadingUser, isLoggingOut, user } = useAuth();
  
  // Show loading if user is being fetched OR logging out
  if (isLoadingUser || isLoggingOut) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;
  const role = user.role as Role;
  return (
    <div>
      <RoleBanner role={role} />
      {role === "field_officer" && <FieldOfficerOverview />}
      {role === "contractor" && <ContractorOverview role={role} />}
      {role === "agent" && <ContractorOverview role={role} />}
      {role === "citizen" && <CitizenOverview role={role} />}
      {role === "business_owner" && <BusinessOverview role={role} />}
      {role === "treasurer" && <TreasurerOverview role={role} />}
      {role === "lga_admin" && <AdminOverview />}
      {role === "super_admin" && <SuperAdminOverview />}
      {role === "ward_councillor" && <CouncillorOverview role={role} />}
      {role === "chairman" && <ChairmanOverview role={role} />}
      {role === "auditor" && <AuditorOverview role={role} />}
    </div>
  );
}

// export function MiniChart() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   const max = Math.max(...REVENUE_CHART.map((r) => r.amount));
//   return (
//     <Card className="p-6 bg-gradient-card border-border/40 lg:col-span-2">
//       <div className="flex items-center justify-between mb-5">
//         <div>
//           <h3 className="font-semibold">Revenue Trend</h3>
//           <p className="text-xs text-muted-foreground">Last 12 months (₦M)</p>
//         </div>
//         {/* <Badge className="bg-success/15 text-success border-success/30">+24.6%</Badge> */}
//       </div>
//       <div className="flex items-end gap-1.5 h-40">
//         {REVENUE_CHART.map((r, i) => (
//           <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5">
//             <div
//               className="w-full rounded-t-md bg-gradient-hero transition-all duration-700"
//               style={{
//                 height: mounted ? `${(r.amount / max) * 100}%` : "0%",
//                 transitionDelay: `${i * 30}ms`,
//               }}
//             />
//             <span className="text-[10px] text-muted-foreground">{r.month}</span>
//           </div>
//         ))}
//       </div>
//     </Card>
//   );
// }

interface MiniChartProps {
  revenueTrendChart?: Array<{ month: string; amount: number }>;
}

export function MiniChart({ revenueTrendChart = [] }: MiniChartProps) {
  const [mounted, setMounted] = useState(false);
  
  // Triggers the entry animation right after layout paint
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the passed props array directly (defaulting to empty array to avoid undefined map errors)
  const revenueData = revenueTrendChart;

  // Determine baseline height reference point
  const max = Math.max(...revenueData.map((r) => r.amount), 1);

  // Calculate percentage change between the last two active data indices
  const getPercentageChange = () => {
    if (revenueData.length < 2) return null;
    const lastTwo = revenueData.slice(-2);
    const prevAmount = lastTwo[0]?.amount || 0;
    const currentAmount = lastTwo[1]?.amount || 0;
    if (prevAmount === 0) return null;
    return ((currentAmount - prevAmount) / prevAmount) * 100;
  };

  const percentageChange = getPercentageChange();
  const isPositive = (percentageChange || 0) >= 0;

  // Handles clean textual presentation labels safely
  const formatMonthLabel = (label: string) => {
    if (!label) return "N/A";
    if (isNaN(Date.parse(label))) {
      return label; // e.g. Already "Jan", "Feb"
    }
    const date = new Date(label);
    return date.toLocaleDateString("default", { month: "short" });
  };

  // If there's no data passed down yet, show a clean empty layout state
  if (revenueData.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border-border/40 lg:col-span-2 flex items-center justify-center h-56 text-sm text-muted-foreground">
        No trend data available
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border/40 lg:col-span-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold">Revenue Trend</h3>
          <p className="text-xs text-muted-foreground">Last {revenueData.length} periods</p>
        </div>
        {percentageChange !== null && (
          <Badge
            className={`${isPositive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"} border-none`}
          >
            {isPositive ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </Badge>
        )}
      </div>

      <div className="flex items-end gap-1.5 h-40">
        {revenueData.map((r, i) => {
          // Dynamic calculation mapping value matrix to 100% bounds safely
          const columnHeight = max > 1 ? (r.amount / max) * 100 : 0;

          return (
            <div 
              key={`${r.month}-${i}`} 
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end" 
              title={`₦${r.amount.toLocaleString()}`}
            >
              <div
                className="w-full rounded-t-md bg-gradient-hero transition-all duration-700 min-h-[2px]"
                style={{
                  height: mounted ? `${columnHeight}%` : "0%",
                  transitionDelay: `${i * 20}ms`,
                }}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatMonthLabel(r.month)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export interface RecentInvoiceItem {
  id: string;
  reference: string;
  customerName: string;
  amount: number;
  status: string;
}

interface RecentInvoicesProps {
  limit?: number;
  invoices?: RecentInvoiceItem[];
}
export function RecentInvoices({ limit = 5, invoices }: RecentInvoicesProps) {
  return (
    <Card className="p-0 bg-gradient-card border-border/40 overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="font-semibold">Recent Invoices</h3>
          <p className="text-xs text-muted-foreground">Latest billing activity</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/invoices">
            View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.slice(0, limit).map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-mono text-xs">
                <div className="truncate max-w-20 md:max-w-35">{i.reference}</div>
              </TableCell>
              <TableCell>{i.customerName}</TableCell>
              <TableCell>₦{i.amount.toLocaleString()}</TableCell>
              <TableCell>
                <StatusBadge status={i.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/dashboard/invoices/${i.id}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function QuickActions({ items }: { items: { icon: any; label: string; to: string }[] }) {
  return (
    <Card className="p-5 bg-gradient-card border-border/40">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((q) => (
          <Button
            key={q.label}
            asChild
            variant="outline"
            className="h-auto py-3 px-3 flex-col gap-1.5 hover:border-primary hover:bg-primary/5"
          >
            <Link href={q.to as any}>
              <q.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{q.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}


function SuperAdminOverview() {
  // Fetch overview data explicitly for the super admin scope
  const { overviewData, isLoading, error } = useOverview("super_admin");

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
        Loading system infrastructure telemetry logs...
      </div>
    );
  }

  if (error || !overviewData?.metrics) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to fetch core platform statistics.</span>
      </div>
    );
  }

  // Cast metrics directly from your payload structure safely
  const metrics = overviewData.metrics as any;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total LGAs"
          value={String(metrics.totalLgas ?? 1)}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Platform Users"
          value={(metrics.platformUsers ?? 0).toLocaleString()}
          icon={Users}
          trend="+12.4%"
          color="info"
        />
        <StatCard
          label="System Officers"
          value={String(metrics.systemOfficers ?? 0)}
          icon={UserCog}
          color="success"
        />
        <StatCard
          label="Audit Events"
          value={(metrics.auditEvents ?? 0).toLocaleString()}
          icon={FileText}
          color="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* <MiniChart /> */}
        <QuickActions
          items={[
            { icon: Users, label: "Manage LGAs", to: "/dashboard/customers" },
            { icon: UserCog, label: "User Management", to: "/dashboard/field-officers" },
            { icon: BarChart3, label: "System Analytics", to: "/dashboard/reports" },
            { icon: FileText, label: "Audit Logs", to: "/dashboard/notifications" },
          ]}
        />
      </div>
    </>
  );
}

interface ChairmanOverviewProps {
  role: Role;
}

// Update the UI component to use all available metrics
function ChairmanOverview({ role }: ChairmanOverviewProps) {
  const { metrics, isLoading: overviewLoading } = useChairmanOverview();
  const { totalApplications, approvalRate, isLoading: appsLoading } = useChairmanApplications();
  const { openComplaints, resolutionRate, isLoading: complaintsLoading } = useChairmanComplaints();
  const { totalStats, isLoading: wardsLoading } = useChairmanWards();

  const isLoading = overviewLoading || appsLoading || complaintsLoading || wardsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Format currency in thousands (K)
  const formattedRevenue = `₦${(metrics.totalRevenue).toFixed(0)}`;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={formattedRevenue}
          icon={TrendingUp}
          // trend="+24.6%"
          color="success"
        />
        <StatCard
          label="Pending Applications"
          value={String(metrics.pendingApplications || 0)}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Approved Certificates"
          value={String(metrics.approvedCertificates || 0)}
          icon={CheckCircle2}
          color="primary"
        />
        <StatCard
          label="Pending Complaints"
          value={String(openComplaints || metrics.pendingComplaints || 0)}
          icon={MessageSquare}
          color="info"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* <MiniChart /> */}
        <QuickActions
          items={[
            { icon: BarChart3, label: "Revenue Overview", to: "/dashboard/reports" },
            { icon: FileBadge, label: "Applications", to: "/dashboard/applications" },
            { icon: MessageSquare, label: "Complaints", to: "/dashboard/complaints" },
            { icon: Users, label: "Ward Performance", to: "/dashboard/customers" },
          ]}
        />
      </div>

      <Card className="mt-6 p-6 bg-gradient-card border-border/40">
        <h3 className="font-semibold mb-3">Executive Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Active Field Officers</div>
            <div className="text-xl font-bold mt-1">{metrics.activeOfficersCount || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Invoices Issued</div>
            <div className="text-xl font-bold mt-1">{metrics.totalInvoicesCount || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Pending Bills</div>
            <div className="text-xl font-bold mt-1">{metrics.pendingBillsCount || 0}</div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid sm:grid-cols-3 gap-4 text-sm mt-4">
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Total Applications</div>
            <div className="text-xl font-bold mt-1">{totalApplications || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Approval Rate</div>
            <div className="text-xl font-bold mt-1">{approvalRate || 0}%</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40">
            <div className="text-xs text-muted-foreground">Complaint Resolution</div>
            <div className="text-xl font-bold mt-1">{resolutionRate || 0}%</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Read-only executive access. Use the sidebar to drill into each module.
        </p>
      </Card>
    </>
  );
}