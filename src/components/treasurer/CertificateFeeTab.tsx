/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { SlidersHorizontal, Plus, Power, FileBadge, CheckCircle2, RefreshCw } from "lucide-react";
import { LGA_SERVICES, ServiceType } from "@/config/lgaServices";
import { toast } from "sonner";
import { LGA_CONFIG } from "@/config/lga.config";

const CERTIFICATE_FEES_STORAGE_KEY = `${LGA_CONFIG.identity.id}_certificate_fees`;

export default function CertificateFeeTab() {
  const certificateServices = useMemo(
    () => LGA_SERVICES.filter((s) => s.category === "Certificates" || s.id.includes("registration")),
    []
  );

  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form fields for fee schedule configuration
  const [scheduleName, setScheduleName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [feeType, setFeeType] = useState<"fixed" | "variable" | "tiered">("fixed");
  const [baseFee, setBaseFee] = useState(3500);
  const [revenueHead, setRevenueHead] = useState("");
  const [calculationRule, setCalculationRule] = useState("");
  const [latePenaltyRate, setLatePenaltyRate] = useState(10);
  const [billingCycle, setBillingCycle] = useState("One-time / Per Application");

  useEffect(() => {
    // Initialize or load from localStorage
    try {
      const stored = localStorage.getItem(CERTIFICATE_FEES_STORAGE_KEY);
      if (stored) {
        setFeeSchedules(JSON.parse(stored));
      } else {
        const initial = certificateServices.map(s => ({
          id: `SCH-CERT-${s.id}`,
          serviceId: s.id,
          name: s.name,
          category: "Certificate Services",
          feeType: s.feeType,
          baseFee: s.defaultFee,
          revenueHead: s.revenueHead,
          calculationRule: s.feeDescription || "Flat statutory fee per approved certificate issuance",
          latePenaltyRate: 10,
          billingCycle: s.supportsRenewal ? "Annual Renewal" : "One-time / Per Application",
          isActive: true,
          updatedAt: new Date().toISOString().slice(0, 10),
        }));
        setFeeSchedules(initial);
        localStorage.setItem(CERTIFICATE_FEES_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      // fallback
    }
  }, [certificateServices]);

  const saveFeeSchedules = (updated: any[]) => {
    setFeeSchedules(updated);
    try {
      localStorage.setItem(CERTIFICATE_FEES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed saving fee schedules", e);
    }
  };

  const handleOpenEdit = (sch: any) => {
    setSelectedSchedule(sch);
    setScheduleName(sch.name);
    setServiceId(sch.serviceId);
    setFeeType(sch.feeType);
    setBaseFee(sch.baseFee);
    setRevenueHead(sch.revenueHead);
    setCalculationRule(sch.calculationRule);
    setLatePenaltyRate(sch.latePenaltyRate);
    setBillingCycle(sch.billingCycle);
    setDialogOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedSchedule(null);
    setScheduleName("New Certificate Fee Schedule");
    setServiceId("certificate_of_origin");
    setFeeType("fixed");
    setBaseFee(5000);
    setRevenueHead("1001 - Certificate Fees");
    setCalculationRule("Fixed rate per certificate application");
    setLatePenaltyRate(10);
    setBillingCycle("One-time / Per Application");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedSchedule) {
      const updated = feeSchedules.map(sch => sch.id === selectedSchedule.id ? {
        ...sch,
        name: scheduleName,
        serviceId,
        feeType,
        baseFee: Number(baseFee),
        revenueHead,
        calculationRule,
        latePenaltyRate: Number(latePenaltyRate),
        billingCycle,
        updatedAt: new Date().toISOString().slice(0, 10),
      } : sch);
      saveFeeSchedules(updated);
      toast.success(`Updated tariff schedule for ${scheduleName}`);
    } else {
      const newSch = {
        id: `SCH-CERT-${Date.now()}`,
        serviceId,
        name: scheduleName,
        category: "Certificate Services",
        feeType,
        baseFee: Number(baseFee),
        revenueHead,
        calculationRule,
        latePenaltyRate: Number(latePenaltyRate),
        billingCycle,
        isActive: true,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      saveFeeSchedules([newSch, ...feeSchedules]);
      toast.success(`Created new certificate fee schedule: ${scheduleName}`);
    }
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    const updated = feeSchedules.map(sch => sch.id === id ? { ...sch, isActive: !sch.isActive } : sch);
    saveFeeSchedules(updated);
    toast.info("Fee schedule status updated.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-primary" />
            the LGA Certificate Fee Schedules
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure statutory fees, calculation rules, penalty rates, and billing cycles for all Certificate Services.
          </p>
        </div>
        <Button onClick={handleOpenNew} size="sm" className="gap-1 text-xs">
          <Plus className="h-4 w-4" /> Create Certificate Schedule
        </Button>
      </div>

      <Card className="p-0 bg-gradient-card border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Certificate Service</TableHead>
              <TableHead>Revenue Head</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Statutory Base Fee (₦)</TableHead>
              <TableHead>Calculation Rule & Notes</TableHead>
              <TableHead>Penalty Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeSchedules.map((sch) => (
              <TableRow key={sch.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sch.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span>{sch.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{sch.revenueHead}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {sch.feeType}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  ₦{Number(sch.baseFee).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs max-w-[240px] text-muted-foreground truncate">
                  {sch.calculationRule}
                </TableCell>
                <TableCell className="text-xs font-mono">{sch.latePenaltyRate}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={sch.isActive ? "border-emerald-500/40 text-emerald-600" : "border-rose-500/40 text-rose-600"}>
                    {sch.isActive ? "Active Schedule" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(sch)} className="h-8 text-xs gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Edit Rule
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(sch.id)} className="h-8 text-xs text-muted-foreground">
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* EDIT / CREATE DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              {selectedSchedule ? "Modify Certificate Fee Schedule" : "New Certificate Fee Schedule"}
            </DialogTitle>
            <DialogDescription>
              Set Treasury assessment rates and calculation formulas for certificate issuance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div>
              <Label>Schedule / Service Name</Label>
              <Input value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fee Structure Type</Label>
                <Select value={feeType} onValueChange={(v: any) => setFeeType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Standard Tariff</SelectItem>
                    <SelectItem value="tiered">Tiered Scale</SelectItem>
                    <SelectItem value="variable">Variable Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Base Statutory Amount (₦)</Label>
                <Input type="number" value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Revenue Head Code & Name</Label>
              <Input value={revenueHead} onChange={(e) => setRevenueHead(e.target.value)} />
            </div>

            <div>
              <Label>Calculation Rule / Assessment Description</Label>
              <Textarea
                rows={2}
                value={calculationRule}
                onChange={(e) => setCalculationRule(e.target.value)}
                placeholder="e.g. Fixed statutory fee per approved certificate"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Late Payment Penalty (%)</Label>
                <Input type="number" value={latePenaltyRate} onChange={(e) => setLatePenaltyRate(Number(e.target.value))} />
              </div>

              <div>
                <Label>Billing Cycle</Label>
                <Input value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
