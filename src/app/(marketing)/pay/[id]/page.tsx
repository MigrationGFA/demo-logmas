"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building2,
  Receipt,
  FileCheck,
  ArrowRight,
  Loader2,
  Copy,
  Lock,
  Sparkles,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { LGA_CONFIG } from "@/config/lga.config";
import { invoicesService, type InvoiceDetails } from "@/services/apiInvoice";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import Link from "next/link";
import logo from "@/assets/logo.png";
import Image from "next/image";

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulated Card Fields
  const [cardNumber, setCardNumber] = useState("5399 8301 2294 8831");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("382");
  const [cardPin, setCardPin] = useState("1234");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const inv = await invoicesService.getInvoiceById(id);
        setInvoice(inv);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSimulatePayment = async () => {
    if (!invoice) return;
    try {
      setIsSimulating(true);
      const res = await invoicesService.simulatePayment(id);
      toast.success("Payment confirmed! Statutory receipt and certificate generated.");

      // Dispatch store change event for instant synchronization across all open views
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("logmas:store-change"));
      }

      // Route directly to the verified payment result page
      const ref = invoice.invoiceNumber || res.invoiceNumber || id;
      router.push(`/payment/result?reference=${encodeURIComponent(ref)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to simulate payment");
      setIsSimulating(false);
    }
  };

  const copyAccount = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Virtual Account Number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Retrieving Statutory Demand Notice & Payment Details...
            </p>
          </div>
        ) : error || !invoice ? (
          <Card className="p-8 text-center max-w-md mx-auto space-y-4 border-destructive/30">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold">Demand Notice Not Found</h2>
            <p className="text-sm text-muted-foreground">
              {error || "Could not locate this invoice in the council registry."}
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Official LGA Demand Notice */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 md:p-8 bg-card border-border shadow-md relative overflow-hidden">
                {/* Official Crest Header */}
                <div className="border-b border-border pb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Image
                        src={logo}
                        alt="Council Logo"
                        className="object-contain p-1"
                        fill
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {LGA_CONFIG.platform.fullName}
                      </div>
                      <h1 className="text-lg font-extrabold text-foreground leading-tight">
                        {LGA_CONFIG.identity.fullName}
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Statutory Assessment & Demand Notice
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={invoice.status === "paid" ? "default" : "outline"}
                    className={
                      invoice.status === "paid"
                        ? "bg-emerald-600 text-white font-semibold"
                        : "border-amber-500 text-amber-600 dark:text-amber-400 font-semibold"
                    }
                  >
                    {invoice.status === "paid" ? "SETTLED" : "UNPAID DEMAND"}
                  </Badge>
                </div>

                {/* Notice Info Details */}
                <div className="py-5 grid grid-cols-2 gap-4 text-xs border-b border-border/70">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block font-semibold">
                      Notice Reference
                    </span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block font-semibold">
                      Due Date
                    </span>
                    <span className="font-medium text-foreground">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Immediate"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block font-semibold">
                      Assessed Payer / Applicant
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      {invoice.customerName}
                    </span>
                    {invoice.customerPhone && (
                      <span className="block text-muted-foreground">
                        {invoice.customerPhone}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block font-semibold">
                      Revenue Service / Head
                    </span>
                    <span className="font-medium text-foreground">
                      {invoice.invoiceType || invoice.levyType || "Statutory Fee"}
                    </span>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="pt-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {invoice.description || invoice.invoiceType}
                    </span>
                    <span className="font-semibold">
                      ₦{Number(invoice.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                    <span className="font-bold text-base">Total Payable</span>
                    <span className="text-2xl font-extrabold text-primary">
                      ₦{Number(invoice.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* QR Code Verification Footer */}
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <span>Statutory Digital Ledger Stamp</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Council Rev Ref: {invoice.invoiceNumber}
                  </span>
                </div>
              </Card>

              {/* Security Seal Note */}
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-secondary/50 border border-border/70 text-xs text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <p>
                  Official Digital Public Infrastructure (DPI) Payment Gateway.
                  Simulated settlement directly issues tamper-proof QR receipts and official certificates.
                </p>
              </div>
            </div>

            {/* Right Column: In-App Payment Checkout & Simulator */}
            <div className="lg:col-span-5 space-y-6">
              {invoice.status === "paid" ? (
                <Card className="p-6 md:p-8 bg-emerald-500/5 border-emerald-500/30 text-center space-y-5 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                      Payment Confirmed
                    </Badge>
                    <h2 className="text-xl font-bold mt-2">Notice Settled in Full</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Statutory receipt and certificate are generated and active.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link
                        href={`/payment/result?reference=${encodeURIComponent(
                          invoice.invoiceNumber
                        )}`}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        View Official Receipt & Certificate
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard">Go to Council Dashboard</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-card border-border shadow-md space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Checkout Gateway
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Lock className="h-3 w-3" /> 256-Bit Encrypted
                      </span>
                    </div>
                    <h2 className="text-lg font-bold">Select Payment Method</h2>
                  </div>

                  {/* Primary 1-Click Instant Simulator Card */}
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Demo In-App Simulator
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        1-Click Test
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click below to simulate an instantaneous successful bank/card settlement
                      without requiring external real payment credentials.
                    </p>
                    <Button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Simulation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Simulate Successful Payment (₦{Number(invoice.totalAmount || 0).toLocaleString()})
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Alternative Simulated Methods (Tabs) */}
                  <Tabs defaultValue="card" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="card" className="text-xs">
                        <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="transfer" className="text-xs">
                        <Building2 className="h-3.5 w-3.5 mr-1.5" />
                        Transfer
                      </TabsTrigger>
                    </TabsList>

                    {/* Card Tab */}
                    <TabsContent value="card" className="space-y-3 pt-3">
                      <div>
                        <Label htmlFor="cardNumber" className="text-xs">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="font-mono text-sm mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExpiry" className="text-xs">
                            Expires
                          </Label>
                          <Input
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="font-mono text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv" className="text-xs">
                            CVV
                          </Label>
                          <Input
                            id="cardCvv"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="font-mono text-sm mt-1"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulating}
                        className="w-full mt-2 bg-primary hover:bg-primary/90 font-semibold"
                      >
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Authorizing Card...
                          </>
                        ) : (
                          `Pay ₦${Number(invoice.totalAmount || 0).toLocaleString()}`
                        )}
                      </Button>
                    </TabsContent>

                    {/* Transfer Tab */}
                    <TabsContent value="transfer" className="space-y-4 pt-3">
                      <div className="p-3.5 rounded-lg bg-secondary/40 border border-border/60 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Bank Name</span>
                          <span className="text-xs font-bold text-foreground">
                            {invoice.virtualAccount?.bankName ||
                              LGA_CONFIG.payment?.bankName ||
                              "LOGMAS Treasury Digital Bank"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Account Name</span>
                          <span className="text-xs font-semibold text-foreground text-right truncate max-w-[200px]">
                            {invoice.virtualAccount?.accountName ||
                              LGA_CONFIG.payment?.accountName ||
                              "Demo LGA Internal Revenue"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/60">
                          <span className="text-xs font-semibold text-foreground">
                            Virtual Account No.
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-sm text-primary">
                              {invoice.virtualAccount?.accountNumber ||
                                LGA_CONFIG.payment?.accountNumber ||
                                "0123456789"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyAccount(
                                  invoice.virtualAccount?.accountNumber ||
                                    LGA_CONFIG.payment?.accountNumber ||
                                    "0123456789"
                                )
                              }
                              className="p-1 text-muted-foreground hover:text-foreground rounded"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        Dedicated dynamic virtual treasury account. Auto-reconciled within 30 seconds.
                      </p>

                      <Button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulating}
                        className="w-full bg-primary hover:bg-primary/90 font-semibold"
                      >
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying Bank Transfer...
                          </>
                        ) : (
                          "I have Sent the Transfer (Verify Now)"
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
