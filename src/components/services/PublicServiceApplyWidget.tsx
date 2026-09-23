"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useServices } from "@/hooks/queries/useServices";
import {
  ServiceType,
  getConfiguredFeeForService,
} from "@/config/lgaServices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ServiceApplicationGuideSteps } from "./ServiceApplicationGuideSteps";
import { invoicesService } from "@/services/apiInvoice";
import { toast } from "sonner";
import {
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building,
  Key,
  Copy,
  ExternalLink,
  RefreshCw,
  FileCheck2,
  LogIn,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatAndValidateNigerianPhoneNumber } from "@/lib/helper";

export interface PublicServiceApplyWidgetProps {
  initialServiceId?: string;
  className?: string;
  showStepGuide?: boolean;
}

function PublicServiceApplyWidgetInner({
  initialServiceId = "certificate_of_origin",
  className = "",
  showStepGuide = true,
}: PublicServiceApplyWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlServiceId = searchParams ? searchParams.get("serviceId") : null;

  const { services: servicesData, isLoading } = useServices();

  const services = useMemo(() => {
    const list = Array.isArray(servicesData)
      ? servicesData
      : (servicesData as any)?.data || [];
    if (list && list.length > 0) {
      return list;
    }
    return [];
  }, [servicesData]);

  // Initial state derived from URL or initialServiceId
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    urlServiceId || initialServiceId || "certificate_of_origin",
  );
  // Demo has exactly ONE citizen user — prefill + lock their email so the
  // public pay-first flow always links back to the same login-able account.
  const DEMO_CITIZEN_EMAIL = "citizen@logmas.gov.ng";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(DEMO_CITIZEN_EMAIL);
  const [phone, setPhone] = useState("+234 803 123 4567");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync state when URL serviceId or initialServiceId changes
  useEffect(() => {
    if (urlServiceId) {
      setSelectedServiceId(urlServiceId);
    } else if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [urlServiceId, initialServiceId]);

  // Find currently selected service
  const selectedService = useMemo(() => {
    if (!services || services.length === 0) return null;
    const match = services.find(
      (s: any) =>
        s.id === selectedServiceId ||
        s.code?.toLowerCase() === selectedServiceId?.toLowerCase() ||
        s.id?.toLowerCase() === selectedServiceId?.toLowerCase() ||
        s.slug?.toLowerCase() === selectedServiceId?.toLowerCase(),
    );
    return match || services[0];
  }, [services, selectedServiceId]);

  // Calculate statutory fee
  const statutoryFee = useMemo(() => {
    if (!selectedService) return 0;
    if (
      selectedService.feeConfig?.amount !== undefined &&
      selectedService.feeConfig?.amount !== null
    ) {
      return Number(selectedService.feeConfig.amount);
    }
    const configured = getConfiguredFeeForService(selectedService.id);
    if (configured) return configured;
    return Number(selectedService.defaultFee ?? selectedService.amount ?? 0);
  }, [selectedService]);

  // Calculate required documents
  const requiredDocuments: string[] = useMemo(() => {
    if (!selectedService) return [];
    if (
      Array.isArray(selectedService.requiredDocuments) &&
      selectedService.requiredDocuments.length > 0
    ) {
      return selectedService.requiredDocuments;
    }
    if (
      Array.isArray(selectedService.requirements) &&
      selectedService.requirements.length > 0
    ) {
      return selectedService.requirements;
    }
    return [
      "National Identity Number (NIN) Slip",
      "Passport Photograph (red background)",
      "Proof of Residency or Family Identification",
    ];
  }, [selectedService]);

  // When user changes service in dropdown
  const handleServiceChange = (newServiceId: string) => {
    setSelectedServiceId(newServiceId);
    try {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : "",
      );
      params.set("serviceId", newServiceId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } catch (e) {
      console.error("Failed to update URL search parameters", e);
    }
  };

  // Generated Result for UI
  const [successDetails, setSuccessDetails] = useState<{
    reference: string;
    generatedPass: string;
    paidAmount: number;
    serviceName: string;
    email: string;
    phone: string;
    fullName: string;
  } | null>(null);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedService || !selectedService.id) {
      const msg = "Please select a valid statutory service to continue.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!fullName.trim()) {
      const msg = "Please enter your full applicant name";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      const msg = "Please enter a valid email address";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const phoneValidation = formatAndValidateNigerianPhoneNumber(phone);
    console.log(phoneValidation, "phoneValidation");

    if (!phoneValidation.isValid) {
      const msg =
        phoneValidation.error || "Please enter a valid Nigerian phone number";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: create the invoice + underlying (pay-first) application in the
      // local demo store. This also stamps the single citizen user so the app
      // shows up under "My Applications" after login.
      const created: any = await invoicesService.initializePublicPayment({
        serviceId: selectedService.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phoneValidation.formattedNumber,
      });

      const invoiceId: string =
        created?.invoiceId || created?.data?.invoiceId || "";
      const createdAppId: string =
        created?.applicationId || created?.data?.applicationId || "";
      const invoiceNumber: string =
        created?.reference ||
        created?.data?.reference ||
        created?.invoiceNumber ||
        invoiceId;
      const payableAmount: number = Number(
        created?.amount ?? created?.data?.amount ?? statutoryFee ?? 0
      );

      if (!invoiceId && !invoiceNumber) {
        throw new Error(
          created?.message ||
            "Invoice could not be generated. Please try again."
        );
      }

      // Step 2: hand off to the Paystack initialize route — exactly like the
      // dashboard invoice flow. With keys configured this returns Paystack's
      // hosted checkout URL (user pays there, then lands on /payment/result).
      // Without keys it returns configured:false and we settle locally, then
      // jump straight to verification — no /pay/:id detour either way.
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoiceId || invoiceNumber,
          invoiceNumber,
          amount: payableAmount,
          email: email.trim(),
          applicationId: createdAppId || undefined,
        }),
      });
      const initJson: any = await initRes.json().catch(() => null);
      const checkoutUrl: string | null =
        initJson?.data?.authorization_url ||
        initJson?.data?.payment_url ||
        null;

      const paystackRef: string =
        initJson?.data?.reference || invoiceNumber;

      if (paystackRef) {
        sessionStorage.setItem("pendingPaymentReference", paystackRef);
        sessionStorage.setItem("publicPaymentServiceId", selectedService.id);
        try {
          localStorage.setItem("pendingPaymentReference", paystackRef);
        } catch {}
      }

      if (checkoutUrl) {
        toast.success("Redirecting to Paystack secure checkout...");
        window.location.href = checkoutUrl;
        return;
      }

      // No gateway configured: settle locally (receipt + Payment Confirmed)
      // and go straight to the verification page for the completion step.
      await invoicesService.simulatePayment(invoiceId || invoiceNumber);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("logmas:store-change"));
      }
      toast.success("Payment confirmed! Proceed to complete your application.");
      router.push(
        `/payment/result?reference=${encodeURIComponent(invoiceNumber)}`
      );
    } catch (err: any) {
      console.error("Public payment initialization failed:", err);
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Payment initialization failed. Please verify service availability and try again.";
      setFormError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleReset = () => {
    setIsPaidSuccess(false);
    setSuccessDetails(null);
    setFullName("");
    setEmail(DEMO_CITIZEN_EMAIL);
    setPhone("+234 803 123 4567");
  };

  return (
    <div
      id="public-service-apply-container"
      className={`space-y-8 ${className}`}
    >
      {/* 6-Step Application Process Banner Posted Before Payment */}
      {showStepGuide && (
        <ServiceApplicationGuideSteps
          title="Official 6-Step Application & Payment Process"
          subtitle="Follow these mandatory steps to pay, auto-create your citizen portal account, and complete your application form."
        />
      )}

      {/* Main Interactive Form / Payment Box */}
      <Card
        id="service-payment-card"
        className="p-6 md:p-8 bg-card border-border/80 shadow-elegant"
      >
        {!isPaidSuccess ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> First-Timer Fast
                    Application
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    Instant Account Auto-Provisioning
                  </Badge>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  Select Service & Make Online Payment
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Pay your statutory fee online to instantly generate your
                  portal login credentials and proceed to the dashboard.
                </p>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60 text-right shrink-0">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Statutory Payable Amount
                </div>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  ₦{statutoryFee.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3" /> Official Government
                  Treasury Fee
                </div>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Service & Fee Details */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="service-select"
                      className="text-xs font-semibold text-foreground uppercase tracking-wider"
                    >
                      1. Select Statutory Service{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="service-select"
                      value={selectedService?.id || selectedServiceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border/80 bg-background px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs"
                    >
                      {services.map((s: any) => {
                        const fee = Number(
                          s.feeConfig?.amount ??
                            getConfiguredFeeForService(s.id) ??
                            s.defaultFee ??
                            0,
                        );
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.category || "Statutory"})  - {" "}
                            {fee > 0 ? `₦${fee.toLocaleString()}` : "Variable"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Service info card */}
                  {selectedService && (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Selected Service:
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedService.name}
                        </span>
                      </div>
                      {selectedService.description && (
                        <div className="pt-1 text-muted-foreground text-[11px] leading-relaxed border-t border-border/30">
                          {selectedService.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30">
                        <span className="text-muted-foreground font-medium">
                          Revenue Head:
                        </span>
                        <span className="font-mono text-[11px] text-foreground">
                          {selectedService.revenueHead ||
                            "1001 - General Revenue"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Processing Time SLA:
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedService.processingTime ||
                            (selectedService.estimatedDays
                              ? `${selectedService.estimatedDays} Business Days`
                              : "1 - 3 Business Days")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground font-medium">
                          Total Statutory Fee:
                        </span>
                        <span className="font-bold text-sm text-primary">
                          ₦{statutoryFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Required Docs note */}
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                      <FileCheck2 className="h-3.5 w-3.5 text-primary" /> Step 4
                      Note (Documents to Prepare):
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {requiredDocuments.slice(0, 3).map((d, i) => (
                        <li key={i} className="truncate">
                          {d}
                        </li>
                      ))}
                      {requiredDocuments.length > 3 && (
                        <li>
                          +{requiredDocuments.length - 3} more statutory
                          document(s)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Applicant Details Form */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="applicant-name"
                      className="text-xs font-semibold text-foreground uppercase tracking-wider"
                    >
                      Applicant Full Name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="applicant-name"
                        placeholder="e.g. Oladimeji Babatunde Adeyemi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 text-sm h-11 bg-background"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Enter full name exactly as it appears on your official
                      identification document.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="applicant-email"
                      className="text-xs font-semibold text-foreground uppercase tracking-wider"
                    >
                      Valid Email Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="applicant-email"
                        type="email"
                        placeholder="e.g. applicant@gmail.com"
                        value={email}
                        disabled
                        readOnly
                        title="Demo account email — pre-filled and locked"
                        className="pl-10 text-sm h-11 bg-muted cursor-not-allowed"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      Demo account email — pre-filled. After payment, log in with
                      this email to find your application in the dashboard.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="applicant-phone"
                      className="text-xs font-semibold text-foreground uppercase tracking-wider"
                    >
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="applicant-phone"
                        type="tel"
                        placeholder="e.g. 0803 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 text-sm h-11 bg-background"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Used for SMS notifications on application progress and LGA
                      approvals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice & CTA Button */}
              <div className="pt-4 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Secured by 256-bit encryption. Card, Bank Transfer & USSD
                    accepted.
                  </span>
                </div>

                <Button
                  id="pay-statutory-fee-button"
                  type="submit"
                  disabled={isProcessing}
                  size="lg"
                  className="w-full md:w-auto min-w-[240px] bg-gradient-hero text-primary-foreground font-semibold shadow-elegant h-12"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment & Account...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ₦{statutoryFee.toLocaleString()} & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Success & Account Auto-Created State */
          <div
            id="payment-success-container"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            <div className="text-center max-w-xl mx-auto py-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 mb-2 text-xs font-semibold"
              >
                Payment Confirmed & Account Provisioned
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Payment Successful!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your statutory fee of{" "}
                <strong className="text-foreground">
                  ₦{successDetails?.paidAmount.toLocaleString()}
                </strong>{" "}
                for{" "}
                <strong className="text-foreground">
                  {successDetails?.serviceName}
                </strong>{" "}
                has been received.
              </p>
            </div>

            {/* Generated Credentials & Instructions Card */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Credentials Box */}
              <div className="p-5 rounded-2xl bg-secondary/50 border border-border/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">
                    Your Auto-Created Account Details
                  </h4>
                </div>

                <p className="text-xs text-muted-foreground">
                  An account has been created for you automatically. Your login
                  details have also been dispatched to{" "}
                  <strong className="text-foreground">
                    {successDetails?.email}
                  </strong>
                  .
                </p>

                <div className="space-y-2.5 text-xs bg-background p-4 rounded-xl border border-border/60">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Payment Reference:
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {successDetails?.reference}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Login Email:</span>
                    <span className="font-medium text-foreground">
                      {successDetails?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">
                      Temporary Password:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {successDetails?.generatedPass}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(successDetails?.generatedPass || "")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {copiedKey && (
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Password copied to
                    clipboard!
                  </div>
                )}
              </div>

              {/* Mandatory Next Steps Check (Steps 3-6) */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3.5">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  Next Mandatory Steps to Complete:
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Check Your Email
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Verify your inbox for confirmation and login
                        instructions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Get Your Documents Ready
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Prepare clear digital copies (PDF/JPG) of required
                        statutory documents.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                      5
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Log In with Credentials
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Sign into your portal dashboard using your email &
                        password.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      6
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Fill Application & Upload Documents
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Complete your application form and submit files
                        step-by-step.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                Apply for Another Service
              </Button>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href="/login">
                    <LogIn className="mr-1.5 h-3.5 w-3.5" /> Go to Login Page
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-hero text-xs font-semibold shadow-elegant"
                >
                  <Link
                    href={`/dashboard/services/${selectedService?.id || "certificate_of_origin"}`}
                  >
                    Continue Application on Dashboard{" "}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function PublicServiceApplyWidget(props: PublicServiceApplyWidgetProps) {
  return (
    <Suspense
      fallback={
        <Card className="p-8 bg-card border-border/80 shadow-elegant text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs text-muted-foreground">
            Loading service application form...
          </p>
        </Card>
      }
    >
      <PublicServiceApplyWidgetInner {...props} />
    </Suspense>
  );
}

