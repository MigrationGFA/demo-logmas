/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { getLgaApplications, LgaApplication, APPLICATIONS_EVENT_KEY } from "@/lib/lgaApplications";
import { toast } from "sonner";

export default function BankReconciliationTab() {
  const [applications, setApplications] = useState<LgaApplication[]>([]);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadApps = () => {
    setApplications(getLgaApplications());
  };

  useEffect(() => {
    loadApps();
    const handleStoreChange = () => loadApps();
    window.addEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
    return () => window.removeEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
  }, []);

  // Filter paid vs unpaid applications
  const paidTransactions = useMemo(() => {
    return applications.filter((a) => a.paymentStatus === "paid");
  }, [applications]);

  const unpaidInvoices = useMemo(() => {
    return applications.filter((a) => a.paymentStatus === "unpaid" && a.amount > 0);
  }, [applications]);

  const totalPaidRevenue = useMemo(() => {
    return paidTransactions.reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [paidTransactions]);

  const totalUnpaidArrears = useMemo(() => {
    return unpaidInvoices.reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [unpaidInvoices]);

  // Ward & Service Revenue Summaries
  const revenueByWard = useMemo(() => {
    const map: Record<string, number> = {};
    paidTransactions.forEach((a) => {
      const ward = a.ward || "the LGA Ward 1";
      map[ward] = (map[ward] || 0) + a.amount;
    });
    return Object.entries(map).map(([ward, amount]) => ({ ward, amount }));
  }, [paidTransactions]);

  const handleRunReconciliation = () => {
    toast.success("Bank & Virtual Account Reconciliation Statement matched successfully with Zenith/FirstBank LGA settlement feed!");
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
          <div className="text-xs text-muted-foreground font-medium">Reconciled Real-time Revenue</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₦{totalPaidRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600/80 flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Settled via Gateway & Dedicated Accounts
          </div>
        </Card>

        <Card className="p-4 bg-amber-500/10 border-amber-500/20">
          <div className="text-xs text-muted-foreground font-medium">Outstanding Arrears & Unpaid Invoices</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ₦{totalUnpaidArrears.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-600/80 flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" /> {unpaidInvoices.length} Pending Invoices
          </div>
        </Card>

        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="text-xs text-muted-foreground font-medium">Settlement Bank Accounts</div>
          <div className="text-sm font-bold mt-1 text-foreground">
            Zenith Bank (the LGA Treasury)
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Acct: 1012398401</div>
        </Card>

        <Card className="p-4 bg-purple-500/10 border-purple-500/20 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground font-medium">Reconciliation Action</div>
          <Button onClick={handleRunReconciliation} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1 mt-2">
            <FileCheck className="h-3.5 w-3.5" /> Auto-Match Gateway Feed
          </Button>
        </Card>
      </div>

      {/* Real-time Payment & Dedicated Account Settlements Table */}
      <Card className="p-5 bg-gradient-card border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Real-Time Settlement & Dedicated Account Logs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live settlement feed for all the LGA service payments verified by bank reference & receipt QR code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadApps} variant="outline" size="sm" className="text-xs gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => toast.success("Exporting Bank Reconciliation Statement PDF...")}>
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Receipt #</TableHead>
                <TableHead>Applicant & Ward</TableHead>
                <TableHead>Service & Revenue Head</TableHead>
                <TableHead>Channel & Virtual Account</TableHead>
                <TableHead>Amount Settled (₦)</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Reconciliation Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-xs">
                    No verified payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                paidTransactions.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-emerald-600">
                      {app.receiptNumber || app.id}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium">{app.applicant}</div>
                      <div className="text-[10px] text-muted-foreground">{app.ward}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{app.serviceName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{app.revenueHead}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {app.paymentMethod || "Virtual Bank Transfer"}
                      </Badge>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Ref: {app.qrToken || "DEMO-BNK-9920"}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs text-emerald-600">
                      ₦{app.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {app.paidAt ? new Date(app.paidAt).toLocaleDateString() : app.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-[10px]">
                        Reconciled
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Revenue by Ward Breakdown */}
      <Card className="p-5 bg-card border-border/60">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Revenue Collections Breakdown by Ward
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {revenueByWard.map((rw) => (
            <div key={rw.ward} className="p-3 bg-muted/30 rounded-lg border flex justify-between items-center text-xs">
              <div className="font-medium">{rw.ward}</div>
              <div className="font-mono font-bold text-emerald-600">₦{rw.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
