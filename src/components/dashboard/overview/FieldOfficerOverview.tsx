/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StatCard, StatusBadge } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Clock,
  TrendingUp,
  FileText,
  ScanLine,
  Users,
  BarChart3,
  CreditCard,
  Eye,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Building2,
  Phone,
  FileBadge,
} from "lucide-react";
import { QuickActions } from "@/components/dashboard/DashboardWidgets";
import {
  getLgaApplications,
  recordFieldInspection,
  LgaApplication,
} from "@/lib/lgaApplications";
import { tokenManager } from "@/services/apiAuth";
import { toast } from "sonner";
import Link from "next/link";
import { APPLICATIONS_EVENT_KEY } from "@/lib/lgaApplications";

export default function FieldOfficerOverview() {
  const user = tokenManager.getUser();

  const [applications, setApplications] = useState<LgaApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LgaApplication | null>(null);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);

  // Form states for inspection
  const [inspectionFindings, setInspectionFindings] = useState("");
  const [recommendedCategory, setRecommendedCategory] = useState("Standard Commercial");
  const [recommendedFee, setRecommendedFee] = useState(15000);

  // Load live applications
  const loadApps = () => {
    setApplications(getLgaApplications());
  };

  useEffect(() => {
    loadApps();
    const handleStoreChange = () => loadApps();
    window.addEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
    return () => window.removeEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
  }, []);

  // Compute live metrics from the LGA applications
  const metrics = useMemo(() => {
    const pendingInspection = applications.filter(
      (a) => a.status === "Inspection Required" || a.status === "Submitted"
    );
    const completedInspection = applications.filter(
      (a) =>
        a.status === "Inspection Completed" ||
        a.status === "Awaiting Assessment" ||
        a.status === "Invoice Generated" ||
        a.status === "Payment Confirmed" ||
        a.status === "Completed"
    );
    const totalCollected = applications
      .filter((a) => a.paymentStatus === "paid")
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    return {
      pendingInspectionCount: pendingInspection.length,
      completedInspectionCount: completedInspection.length,
      totalCollected,
      totalApplications: applications.length,
      pendingInspectionList: pendingInspection,
    };
  }, [applications]);

  // Open inspection modal
  const handleStartInspection = (app: LgaApplication) => {
    setSelectedApp(app);
    setInspectionFindings(app.inspectionReport?.findings || "Property, site equipment, and premises inspected in good order.");
    setRecommendedCategory(app.inspectionReport?.recommendedCategory || app.category || "Standard Commercial");
    setRecommendedFee(app.amount || 15000);
    setInspectionModalOpen(true);
  };

  // Save inspection report
  const handleSaveInspection = () => {
    if (!selectedApp) return;
    const updated = recordFieldInspection(
      selectedApp.id,
      {
        findings: inspectionFindings,
        recommendedCategory,
        recommendedFee: Number(recommendedFee),
      },
      { name: user?.firstName ? `${user.firstName} (Field Officer)` : "Tunji Field Officer", role: "field_officer" }
    );

    if (updated) {
      toast.success(`Field inspection report logged for ${updated.applicationNo}. Forwarded to Treasury for tariff assessment!`);
      setInspectionModalOpen(false);
      loadApps();
    }
  };

  return (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending Inspections"
          value={String(metrics.pendingInspectionCount)}
          icon={ClipboardList}
          color="warning"
        />
        <StatCard
          label="Inspections Completed"
          value={String(metrics.completedInspectionCount)}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          label="Total Ward Revenue"
          value={`₦${metrics.totalCollected.toLocaleString()}`}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          label="Total Applications"
          value={String(metrics.totalApplications)}
          icon={FileText}
          color="info"
        />
      </div>

      {/* Main the LGA General Services Pending Inspection Queue */}
      <Card className="p-5 mb-6 bg-gradient-card border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              the LGA Services  -  Pending Field Inspection Queue
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Service requests (Tenement Rate, Quarry Permit, Liquor Licence, Kiosk Licence) requiring physical verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadApps} variant="outline" size="sm" className="text-xs gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button asChild size="sm" className="text-xs">
              <Link href="/dashboard/applications">
                View All Applications ({applications.length})
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>App Reference</TableHead>
                <TableHead>Applicant & Business</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Ward & Location</TableHead>
                <TableHead>Status Stage</TableHead>
                <TableHead className="text-right">Field Officer Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.pendingInspectionList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-60" />
                    All field inspections cleared! No pending applications requiring verification right now.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.pendingInspectionList.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {app.applicationNo || app.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {app.applicant}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {app.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {app.serviceName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{app.ward}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {app.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status.toLowerCase().replace(/\s+/g, "_")} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs"
                        onClick={() => handleStartInspection(app)}
                      >
                        <ClipboardList className="h-3.5 w-3.5" /> Conduct Inspection
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Quick Action Navigation Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 bg-card border-border/60 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" />
            Field Verification & Revenue Operations Guidelines
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            As an the Local Government Field Officer, inspect applicant premises for statutory accuracy. Measure physical shop footprints, quarry site equipment capacity, liquor outlet seating, and verify NIN documents. Once your field inspection report is submitted, the application automatically transitions to Treasury for tariff assessment and demand notice issuance.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/dashboard/permits">
                <Building2 className="h-3.5 w-3.5 mr-1" /> Field Enforcement Hub
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/dashboard/verify-payment">
                <ScanLine className="h-3.5 w-3.5 mr-1" /> Verify Payment QR
              </Link>
            </Button>
          </div>
        </Card>

        <QuickActions
          items={[
            { icon: FileBadge, label: "Services Catalogue", to: "/dashboard/services" },
            { icon: ClipboardList, label: "All Service Apps", to: "/dashboard/applications" },
            { icon: ScanLine, label: "Verify Payment", to: "/dashboard/verify-payment" },
            { icon: Building2, label: "Field Enforcement", to: "/dashboard/permits" },
            { icon: Users, label: "Customers & Shops", to: "/dashboard/customers" },
            { icon: BarChart3, label: "Field Reports", to: "/dashboard/reports" },
            { icon: CreditCard, label: "Invoices & Demand", to: "/dashboard/invoices" },
          ]}
        />
      </div>

      {/* FIELD OFFICER INSPECTION DIALOG */}
      {selectedApp && (
        <Dialog open={inspectionModalOpen} onOpenChange={setInspectionModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Conduct Field Inspection
              </DialogTitle>
              <DialogDescription>
                {selectedApp.serviceName} ({selectedApp.applicationNo})  -  {selectedApp.applicant}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div><strong>Address:</strong> {selectedApp.address} ({selectedApp.ward})</div>
                <div><strong>Applicant Phone:</strong> {selectedApp.phone}</div>
              </div>

              <div>
                <Label>Inspection Findings & Site Report *</Label>
                <Textarea
                  rows={3}
                  value={inspectionFindings}
                  onChange={(e) => setInspectionFindings(e.target.value)}
                  placeholder="Record property condition, size, equipment, sanitation, capacity..."
                />
              </div>

              <div>
                <Label>Recommended Tariff Category</Label>
                <Input
                  value={recommendedCategory}
                  onChange={(e) => setRecommendedCategory(e.target.value)}
                />
              </div>

              <div>
                <Label>Recommended Statutory Fee Tariff (₦)</Label>
                <Input
                  type="number"
                  value={recommendedFee}
                  onChange={(e) => setRecommendedFee(Number(e.target.value))}
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-900 dark:text-blue-200 text-[11px]">
                Submitting this inspection report will automatically change the application status to <strong>Inspection Completed</strong> and notify the Treasurer to issue an official Demand Notice.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setInspectionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveInspection} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Submit Inspection Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

