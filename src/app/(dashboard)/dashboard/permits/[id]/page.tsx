/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/shared";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import { toast } from "sonner";
import {
  CheckCircle2,
  Printer,
  Copy,
  Share2,
  ShieldCheck,
  Loader2,
  CreditCard,
  Banknote,
  Wallet,
  Link2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useBusinessPermits } from "@/hooks/queries/useBusiness";
import { useFieldOfficerPayments } from "@/hooks/queries/useFieldOfficer";
import { tokenManager } from "@/services/apiAuth";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useInvoicePayment } from "@/hooks/queries/useInvoices";

export default function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: permitId } = React.use(params);
  const user = tokenManager.getUser();

  const { useGetPermit } = useBusinessPermits();
  const { data: permit, isLoading, error, refetch } = useGetPermit(permitId);

  // const { recordPayment, isRecording } = useFieldOfficerPayments(permitId);
  const invoiceNumber = permit?.invoice?.invoiceNumber;
  const {
    recordPayment,
    isRecordingPayment: isRecording, // renamed to keep the rest of this file's variable names unchanged
    initializeOnlinePayment,
    isInitializingPayment,
    sendPaymentLink,
    isSendingPaymentLink,
  } = useInvoicePayment(invoiceNumber ?? "");

  // State for confirmation modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  // Check roles explicitly
  const userRole = user?.role;
  const canProcessPayment = [
    "field_officer",
    "lga_admin",
    "super_admin",
  ].includes(userRole || "");
  const isCitizenOrOwner = ["business_owner", "citizen"].includes(
    userRole || "",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Permit not found</h2>
        <p className="text-muted-foreground mb-4">
          The permit may have been deleted or you don't have access.
        </p>
        <Button asChild>
          <Link href="/dashboard/permits">Back to list</Link>
        </Button>
      </div>
    );
  }

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/permits/verify?code=${permit.verificationCode || permit.qrToken}`
      : "";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  // Open confirmation modal
  const handlePaymentClick = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  // Process payment after confirmation
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod || !invoiceNumber) {
      toast.error("No invoice found for this permit");
      setShowPaymentModal(false);
      return;
    }
    try {
      await recordPayment({
        method: selectedPaymentMethod as any, // "cash" | "pos" | "bank_transfer"
        amount:
          Number(permit.invoice?.balanceDue) ||
          Number(permit.invoice?.totalAmount) ||
          0,
        narration: `Payment for permit ${permit.permitNumber}`,
      });
      setShowPaymentModal(false);
      setSelectedPaymentMethod(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Could not log payment session");
    }
  };


  const isPermitActive = permit.status === "issued";
  const isPendingPayment = permit.status === "pending_payment";

  // Get payment method display name
  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Cash",
      pos: "POS",
      bank_transfer: "Bank Transfer",
      online: "Online",
    };
    return methods[method] || method;
  };

  return (
    <div>
      <PageHeader
        title={permit.business?.businessName || "Permit Details"}
        subtitle={`Permit ${permit.permitNumber.slice(1)} • ${permit.config?.name || "Trade Permit"}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print / PDF
            </Button>
            {/* <Button variant="outline" onClick={handleShareWhatsApp}>
              <Share2 className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button> */}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Certificate */}
        <Card className="p-8 lg:col-span-2 bg-gradient-card border-2 border-gold/30 print:shadow-none">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                the Local Government Area
              </div>
              <div className="text-xl font-bold">Trade Permit Certificate</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-gold-foreground" />
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="grid grid-cols-2 gap-6">
            <Detail label="Permit Number" value={permit.permitNumber} mono />
            <Detail label="Status">
              <Badge
                variant="outline"
                className={
                  permit.status === "issued"
                    ? "bg-success/15 text-success border-success/30"
                    : permit.status === "pending_payment"
                      ? "bg-warning/15 text-warning-foreground border-warning/30"
                      : "bg-destructive/15 text-destructive border-destructive/30"
                }
              >
                {permit.status.replace("_", " ")}
              </Badge>
            </Detail>
            <Detail
              label="Business Name"
              value={permit.business?.businessName}
            />
            <Detail
              label="Owner"
              value={`${permit.business?.owner?.firstName ?? ""} ${permit.business?.owner?.lastName || ""}`}
            />
            <Detail
              label="Permit Type"
              value={permit?.config?.name ?? "Trade Permit"}
            />
            <Detail
              label="Category"
              value={permit?.business?.category?.replace(/_/g, " ") || ""}
            />
            <Detail
              label="Phone"
              value={permit.business?.owner?.phone ?? " - "}
            />
            {permit.business?.address && (
              <Detail
                label="Address"
                value={permit.business.address}
                className="col-span-2"
              />
            )}
            <Detail
              label="Issue Date"
              value={
                permit.validFrom
                  ? new Date(permit.validFrom).toLocaleDateString()
                  : " - "
              }
            />
            <Detail
              label="Expiry Date"
              value={
                permit.validTo
                  ? new Date(permit.validTo).toLocaleDateString()
                  : " - "
              }
            />
            <Detail
              label="Verification Code"
              value={permit.verificationCode || " - "}
              mono
            />
            <Detail
              label="Issuing Authority"
              value={
                permit.issuedBy
                  ? `${permit.issuedBy.firstName} ${permit.issuedBy.lastName}`
                  : "Pending issuance"
              }
            />
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground max-w-md">
              This certificate is the official trade permit of the LGA
              LGA. Verify authenticity by scanning the QR code or visiting the
              verification portal with the code above.
            </div>
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG value={verifyUrl} size={120} />
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {isPendingPayment && permit.invoice && (
            <Card className="p-5 space-y-3">
              <h3 className="font-semibold">Payment Required</h3>
              <div className="text-sm text-muted-foreground">
                Invoice: {permit.invoice.invoiceNumber || permit.invoice.id}
              </div>
              <div className="text-2xl font-bold">
                ₦
                {(
                  permit.invoice.balanceDue || permit.invoice.totalAmount
                ).toLocaleString()}
              </div>

              {/* FIELD OFFICER COLLECTION ACTION INTERFACE */}
              {canProcessPayment && (
                <div className="space-y-2 border-b pb-3 mb-2 last:border-0 last:pb-0">
                  <p className="text-xs text-muted-foreground font-semibold">
                    Field Collection Tools:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePaymentClick("cash")}
                      disabled={isRecording}
                      className="cursor-pointer"
                    >
                      <Wallet className="h-4 w-4 mr-1" />
                      Cash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePaymentClick("pos")}
                      disabled={isRecording}
                      className="cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      POS
                    </Button>
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePaymentClick("bank_transfer")}
                      disabled={isRecording}
                      className="cursor-pointer text-xs"
                    >
                      <Banknote className="h-4 w-4 mr-1" />
                      Transfer
                    </Button> */}
                    <Button
                      size="sm"
                      onClick={() => sendPaymentLink()}
                      disabled={isSendingPaymentLink}
                      className="cursor-pointer text-xs"
                    >
                      {isSendingPaymentLink ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Link2 className="h-4 w-4 mr-1" />
                      )}
                      Send Link
                    </Button>
                  </div>
                </div>
              )}

              {/* CITIZEN / BUSINESS OWNER DIRECT PAYMENT INTERFACE */}
              {isCitizenOrOwner && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Choose your payment option:
                  </p>

                  <Button
                    className="w-full bg-gradient-hero text-white font-medium"
                    onClick={() => initializeOnlinePayment()}
                    disabled={isInitializingPayment}
                  >
                    {isInitializingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />{" "}
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-1.5" /> Pay Online 
                      </>
                    )}
                  </Button>

                  {/* Phase 7 Gateway Hook Placeholder */}
                  {/* 
                  <Button className="w-full bg-primary" onClick={() => initializePaystack()}>
                    Pay Online with Paystack
                  </Button>
                  */}

                  <p className="text-[11px] text-center text-muted-foreground mt-1">
                    Your trade permit certificate activates instantly once full
                    settlement clears.
                  </p>
                </div>
              )}

              {!canProcessPayment && !isCitizenOrOwner && (
                <div className="rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p>
                    Please log in or contact an authorized field officer to
                    settle this balance.
                  </p>
                </div>
              )}
            </Card>
          )}

          {isPermitActive && (
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Permit Active
              </div>
              <p className="text-sm text-muted-foreground">
                This permit is verified and active. Share the verification link
                or print the certificate.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer"
                  onClick={() => handleCopy(verifyUrl, "Verification link")}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy Link
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer"
                >
                  <Link href={`/verify?code=${encodeURIComponent(permit.verificationCode || permit.qrToken || "")}`}>
                    <Link2 className="h-3.5 w-3.5 mr-1" />
                    Verify
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Invoice Info */}
          {permit.invoice && (
            <Card className="p-5 space-y-2">
              <h4 className="font-semibold text-sm">Invoice Details</h4>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice #</span>
                  <span className="font-mono text-xs">
                    {permit.invoice.invoiceNumber || permit.invoice.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span>₦{permit.invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>₦{permit.invoice.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Balance</span>
                  <span>₦{permit.invoice.balanceDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px]">
                    {permit.invoice.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle>Confirm Payment</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Please confirm the payment details before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium">
                  {permit.business?.businessName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Permit</span>
                <span className="font-mono text-sm">{permit.permitNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">
                  {getPaymentMethodDisplay(selectedPaymentMethod || "")}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-lg">
                  ₦
                  {(
                    permit.invoice?.balanceDue ||
                    permit.invoice?.totalAmount ||
                    0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
              <p className="text-xs text-warning-foreground flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  This action will record the payment and automatically issue
                  the permit. This cannot be undone.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedPaymentMethod(null);
              }}
              disabled={isRecording}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isRecording}
              className="cursor-pointer bg-warning-foreground hover:bg-warning-foreground/90"
            >
              {isRecording ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  children,
  mono,
  className = "",
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 font-medium ${mono ? "font-mono text-sm" : ""}`}>
        {value ?? children}
      </div>
    </div>
  );
}

