/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  XCircle,
  Sliders,
  Receipt,
  Building2,
  Phone,
  RefreshCw,
} from "lucide-react";
import {
  getLgaApplications,
  issueTreasuryInvoice,
  updateApplicationStatus,
  APPLICATIONS_EVENT_KEY,
  LgaApplication,
} from "@/lib/lgaApplications";
import { tokenManager } from "@/services/apiAuth";
import { toast } from "sonner";

export default function AssessmentApprovalTab() {
  const user = tokenManager.getUser();

  const [applications, setApplications] = useState<LgaApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LgaApplication | null>(null);

  // Dialog states
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Form states
  const [approvedFee, setApprovedFee] = useState(15000);
  const [revenueHead, setRevenueHead] = useState("");
  const [treasuryNotes, setTreasuryNotes] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  const loadApps = () => {
    setApplications(getLgaApplications());
  };

  useEffect(() => {
    loadApps();
    const handleStoreChange = () => loadApps();
    window.addEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
    return () => window.removeEventListener(APPLICATIONS_EVENT_KEY, handleStoreChange);
  }, []);

  // Filter applications requiring Treasury assessment or generated invoices
  const pendingAssessments = useMemo(() => {
    return applications.filter(
      (a) =>
        a.status === "Inspection Completed" ||
        a.status === "Awaiting Assessment" ||
        a.status === "Submitted"
    );
  }, [applications]);

  const activeInvoices = useMemo(() => {
    return applications.filter(
      (a) => a.invoiceNumber || a.status === "Invoice Generated" || a.status === "Awaiting Payment"
    );
  }, [applications]);

  // Open Assessment modal
  const handleOpenAssess = (app: LgaApplication) => {
    setSelectedApp(app);
    setApprovedFee(app.inspectionReport?.recommendedFee || app.amount || 15000);
    setRevenueHead(app.revenueHead || "1001 - Statutory Head");
    setTreasuryNotes(
      app.inspectionReport?.completed
        ? `Field Officer ${app.inspectionReport.inspectorName} recommended ₦${app.inspectionReport.recommendedFee?.toLocaleString()}. Assessment approved.`
        : "Direct Treasury Tariff Assessment."
    );
    setAssessDialogOpen(true);
  };

  // Submit Assessment & Authorize Invoice
  const handleSaveAssessment = () => {
    if (!selectedApp) return;
    const updated = issueTreasuryInvoice(
      selectedApp.id,
      {
        approvedFee: Number(approvedFee),
        revenueHead,
        treasuryNotes,
      },
      { name: user?.firstName ? `${user.firstName} (Treasurer)` : "Yetunde Treasurer", role: "treasurer" }
    );

    if (updated) {
      toast.success(`Statutory Demand Notice (${updated.invoiceNumber}) authorized for ${updated.applicant}!`);
      setAssessDialogOpen(false);
      loadApps();
    }
  };

  // Open Adjustment modal
  const handleOpenAdjust = (app: LgaApplication) => {
    setSelectedApp(app);
    setAdjustmentAmount(app.amount);
    setTreasuryNotes("Treasury tariff concession / adjustment applied upon formal petition review.");
    setAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!selectedApp) return;
    const updated = updateApplicationStatus(
      selectedApp.id,
      "Invoice Generated",
      { name: user?.firstName ? `${user.firstName} (Treasurer)` : "Treasurer", role: "treasurer" },
      {
        description: `Invoice amount adjusted from ₦${selectedApp.amount.toLocaleString()} to ₦${Number(adjustmentAmount).toLocaleString()}. Reason: ${treasuryNotes}`,
        updates: {
          amount: Number(adjustmentAmount),
        },
      }
    );

    if (updated) {
      toast.success(`Invoice adjusted to ₦${Number(adjustmentAmount).toLocaleString()}`);
      setAdjustDialogOpen(false);
      loadApps();
    }
  };

  // Open Cancel modal
  const handleOpenCancel = (app: LgaApplication) => {
    setSelectedApp(app);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleSaveCancel = () => {
    if (!selectedApp || !cancelReason.trim()) {
      toast.error("Please enter a valid cancellation reason.");
      return;
    }

    const updated = updateApplicationStatus(
      selectedApp.id,
      "Returned For Correction",
      { name: user?.firstName ? `${user.firstName} (Treasurer)` : "Treasurer", role: "treasurer" },
      {
        description: `Unpaid Invoice ${selectedApp.invoiceNumber || ""} cancelled by Treasury. Reason: ${cancelReason}`,
        updates: {
          rejectionReason: `Invoice Cancelled by Treasury: ${cancelReason}`,
          paymentStatus: "unpaid",
        },
      }
    );

    if (updated) {
      toast.info(`Invoice cancelled. Application returned for correction.`);
      setCancelDialogOpen(false);
      loadApps();
    }
  };

  return (
    <div className="space-y-6">
      {/* Field Officer Recommendation Review & Assessment Queue */}
      <Card className="p-5 bg-gradient-card border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Field Officer Recommendations & Tariff Assessment Queue
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review field inspection reports, verify statutory tariff rules, and authorize official Demand Notices.
            </p>
          </div>
          <Button onClick={loadApps} variant="outline" size="sm" className="text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
          </Button>
        </div>

        <div className="rounded-lg border border-border/60 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>App Reference</TableHead>
                <TableHead>Applicant & Business</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Field Officer Findings & Rec.</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead className="text-right">Treasury Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    All field officer recommendations cleared! No applications awaiting tariff assessment.
                  </TableCell>
                </TableRow>
              ) : (
                pendingAssessments.map((app) => (
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
                    <TableCell className="text-xs max-w-[260px]">
                      {app.inspectionReport?.completed ? (
                        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-[11px]">
                          <div><strong>Inspector ({app.inspectionReport.inspectorName}):</strong></div>
                          <div className="text-muted-foreground">{app.inspectionReport.findings}</div>
                          <div className="font-bold text-purple-700 dark:text-purple-300 mt-1">
                            Recommended: ₦{app.inspectionReport.recommendedFee?.toLocaleString()} ({app.inspectionReport.recommendedCategory})
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Pending field report or direct statutory rate</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-600">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs"
                        onClick={() => handleOpenAssess(app)}
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Approve Fee & Issue Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Invoice Management: Adjustments & Cancellations */}
      <Card className="p-5 bg-card border-border/60">
        <h3 className="font-bold text-base flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          Active Issued Invoices  -  Adjustments & Cancellation Management
        </h3>

        <div className="rounded-lg border border-border/60 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Invoice #</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Service & Revenue Head</TableHead>
                <TableHead>Invoiced Amount (₦)</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Treasury Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                    No active invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                activeInvoices.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs font-bold">{app.invoiceNumber || app.id}</TableCell>
                    <TableCell className="text-xs font-medium">{app.applicant}</TableCell>
                    <TableCell className="text-xs">
                      <div>{app.serviceName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{app.revenueHead}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs">
                      ₦{app.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={app.paymentStatus === "paid" ? "border-emerald-500/40 text-emerald-600" : "border-amber-500/40 text-amber-600"}
                      >
                        {app.paymentStatus === "paid" ? "Paid" : "Unpaid / Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {app.paymentStatus !== "paid" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleOpenAdjust(app)} className="text-xs gap-1">
                            <Sliders className="h-3.5 w-3.5" /> Adjust Amount
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenCancel(app)} className="text-xs text-rose-600 border-rose-300 gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Cancel Invoice
                          </Button>
                        </>
                      )}
                      {app.paymentStatus === "paid" && (
                        <span className="text-[11px] text-emerald-600 font-medium">Receipt Issued ({app.receiptNumber})</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ASSESS DIALOG */}
      {selectedApp && (
        <Dialog open={assessDialogOpen} onOpenChange={setAssessDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Treasury Tariff Assessment & Invoice Authorisation
              </DialogTitle>
              <DialogDescription>
                {selectedApp.serviceName} ({selectedApp.applicationNo})  -  {selectedApp.applicant}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div>
                <Label>Approved Statutory Fee (₦) *</Label>
                <Input
                  type="number"
                  value={approvedFee}
                  onChange={(e) => setApprovedFee(Number(e.target.value))}
                />
              </div>

              <div>
                <Label>Revenue Head Account *</Label>
                <Input
                  value={revenueHead}
                  onChange={(e) => setRevenueHead(e.target.value)}
                  placeholder="e.g. 1001 - Certificate Fees"
                />
              </div>

              <div>
                <Label>Treasury Assessment Remarks</Label>
                <Textarea
                  rows={2}
                  value={treasuryNotes}
                  onChange={(e) => setTreasuryNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAssessDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAssessment} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Authorise Demand Notice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ADJUST DIALOG */}
      {selectedApp && (
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Invoice Tariff Concession / Adjustment</DialogTitle>
              <DialogDescription>
                Modify invoice amount for {selectedApp.invoiceNumber} ({selectedApp.applicant})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div>
                <Label>New Adjusted Payable Amount (₦) *</Label>
                <Input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <Label>Justification / Remission Reason *</Label>
                <Textarea
                  rows={2}
                  value={treasuryNotes}
                  onChange={(e) => setTreasuryNotes(e.target.value)}
                  placeholder="State formal concession reason..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAdjustment}>Save Adjusted Invoice</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CANCEL DIALOG */}
      {selectedApp && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-600">Cancel Incorrect Unpaid Invoice</DialogTitle>
              <DialogDescription>
                Revoke invoice {selectedApp.invoiceNumber} for {selectedApp.applicant}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div>
                <Label>Reason for Cancellation (Mandatory Audit Requirement) *</Label>
                <Textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Duplicate assessment, incorrect revenue category, or applicant correction request..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Close</Button>
                <Button onClick={handleSaveCancel} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Cancel Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

