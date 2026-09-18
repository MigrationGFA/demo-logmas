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
import { SlidersHorizontal, Plus, Power, Building2, ShieldCheck, RefreshCw } from "lucide-react";
import { LGA_SERVICES, ServiceType } from "@/config/lgaServices";
import { toast } from "sonner";
import { LGA_CONFIG } from "@/config/lga.config";

const LEVY_PERMIT_FEES_STORAGE_KEY = `${LGA_CONFIG.identity.id}_levy_permit_fees`;

export default function LevyPermitFeeTab() {
  const levyServices = useMemo(
    () =>
      LGA_SERVICES.filter(
        (s) => s.category === "Rates & Levies" || s.category === "Licences & Permits" || s.category === "Urban Development"
      ),
    []
  );

  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form fields
  const [scheduleName, setScheduleName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [feeType, setFeeType] = useState<"fixed" | "variable" | "tiered">("variable");
  const [baseFee, setBaseFee] = useState(25000);
  const [revenueHead, setRevenueHead] = useState("");
  const [calculationRule, setCalculationRule] = useState("");
  const [latePenaltyRate, setLatePenaltyRate] = useState(15);
  const [billingCycle, setBillingCycle] = useState("Annual Renewal");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEVY_PERMIT_FEES_STORAGE_KEY);
      if (stored) {
        setFeeSchedules(JSON.parse(stored));
      } else {
        const initial = levyServices.map((s) => ({
          id: `SCH-LEVY-${s.id}`,
          serviceId: s.id,
          name: s.name,
          category: s.category,
          feeType: s.feeType,
          baseFee: s.defaultFee,
          revenueHead: s.revenueHead,
          calculationRule: s.feeDescription || "Assessed based on annual valuation or capacity rating",
          latePenaltyRate: 15,
          billingCycle: "Annual Statutory Renewal",
          isActive: true,
          updatedAt: new Date().toISOString().slice(0, 10),
        }));
        setFeeSchedules(initial);
        localStorage.setItem(LEVY_PERMIT_FEES_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      // fallback
    }
  }, [levyServices]);

  const saveFeeSchedules = (updated: any[]) => {
    setFeeSchedules(updated);
    try {
      localStorage.setItem(LEVY_PERMIT_FEES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed saving levy fee schedules", e);
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
    setScheduleName("New Levy / Permit Fee Schedule");
    setServiceId("tenement_rate");
    setFeeType("variable");
    setBaseFee(25000);
    setRevenueHead("2001 - Tenement & Property Rates");
    setCalculationRule("Formula based on property rental value and location ward");
    setLatePenaltyRate(15);
    setBillingCycle("Annual Renewal");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedSchedule) {
      const updated = feeSchedules.map((sch) =>
        sch.id === selectedSchedule.id
          ? {
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
            }
          : sch
      );
      saveFeeSchedules(updated);
      toast.success(`Updated rate schedule for ${scheduleName}`);
    } else {
      const newSch = {
        id: `SCH-LEVY-${Date.now()}`,
        serviceId,
        name: scheduleName,
        category: "Rates, Licences & Permits",
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
      toast.success(`Created new levy fee schedule: ${scheduleName}`);
    }
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    const updated = feeSchedules.map((sch) => (sch.id === id ? { ...sch, isActive: !sch.isActive } : sch));
    saveFeeSchedules(updated);
    toast.info("Levy schedule status toggled.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            Rates, Licences, Levies & Permit Fee Schedules
          </h3>
          <p className="text-xs text-muted-foreground">
            Treasury rules for Tenement Rate, Haulage, Liquor, Viewing Centre, Quarry Permits, Street Naming, & Kiosks.
          </p>
        </div>
        <Button onClick={handleOpenNew} size="sm" className="gap-1 text-xs">
          <Plus className="h-4 w-4" /> Create Levy Schedule
        </Button>
      </div>

      <Card className="p-0 bg-gradient-card border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Service / Rate Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Revenue Head</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead>Base Rate (₦)</TableHead>
              <TableHead>Fee Formula & Rules</TableHead>
              <TableHead>Arrears Penalty</TableHead>
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
                <TableCell className="text-xs text-muted-foreground">{sch.category}</TableCell>
                <TableCell className="font-mono text-xs">{sch.revenueHead}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {sch.feeType}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">
                  ₦{Number(sch.baseFee).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs max-w-[240px] text-muted-foreground truncate">
                  {sch.calculationRule}
                </TableCell>
                <TableCell className="text-xs font-mono">{sch.latePenaltyRate}%</TableCell>
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
              <SlidersHorizontal className="h-5 w-5 text-amber-600" />
              {selectedSchedule ? "Modify Rates & Permit Schedule" : "New Rates & Permit Schedule"}
            </DialogTitle>
            <DialogDescription>
              Configure fee calculation rules, location multipliers, and penalty charges.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div>
              <Label>Schedule Name</Label>
              <Input value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fee Structure Type</Label>
                <Select value={feeType} onValueChange={(v: any) => setFeeType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Rate</SelectItem>
                    <SelectItem value="tiered">Tiered by Size/Capacity</SelectItem>
                    <SelectItem value="variable">Valuation / Formula Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Base Rate Amount (₦)</Label>
                <Input type="number" value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Revenue Head Account</Label>
              <Input value={revenueHead} onChange={(e) => setRevenueHead(e.target.value)} />
            </div>

            <div>
              <Label>Calculation Rule / Formula</Label>
              <Textarea
                rows={2}
                value={calculationRule}
                onChange={(e) => setCalculationRule(e.target.value)}
                placeholder="e.g. Rate = Property Rental Value * Ward Multiplier"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Late Charge / Arrears (%)</Label>
                <Input type="number" value={latePenaltyRate} onChange={(e) => setLatePenaltyRate(Number(e.target.value))} />
              </div>

              <div>
                <Label>Billing Cycle</Label>
                <Input value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">Save Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
