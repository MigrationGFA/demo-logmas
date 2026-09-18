/* eslint-disable react/no-unescaped-entities */
"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, Search, CheckCircle2, XCircle, ScanLine, Loader2 } from "lucide-react";
import { useFieldOfficerReceiptVerification } from "@/hooks/queries/useFieldOfficer";

// Form validation schema
const verificationSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function VerifyPaymentPage() {
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  
  const { useVerifyReceipt } = useFieldOfficerReceiptVerification();
  const { data: verificationResult, isLoading, error, refetch } = useVerifyReceipt(
    submittedCode || "",
    !!submittedCode
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const codeValue = watch("code");

  const onSubmit = (data: VerificationFormData) => {
    setSubmittedCode(data.code);
  };

  const handleScanQR = () => {
    if (!codeValue) {
      toast.error("Please enter a QR token");
      return;
    }
    setSubmittedCode(codeValue);
  };

  const handleReset = () => {
    setSubmittedCode(null);
    setValue("code", "");
  };

  const result = verificationResult;
  const isValid = result?.valid === true;
  const isNotFound = submittedCode && !isLoading && (!result || error);

  // Format currency
  const formatNgn = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Verify Payment"
        subtitle="Scan QR or search by receipt / verification / invoice code"
      />
      
      <Card className="p-6 bg-gradient-card border-border/40">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "qr")}>
          <TabsList className="mb-4">
            <TabsTrigger value="code">
              <Search className="h-3.5 w-3.5 mr-1.5" /> Code
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-3.5 w-3.5 mr-1.5" /> QR Scan
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="code">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label>Receipt No. / Verification Code</Label>
                <Input
                  {...register("code")}
                  placeholder="e.g. RCP-12345 / VCODE-67890"
                  className={errors.code ? "border-red-500 mt-1.5" : "mt-1.5"}
                />
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading} className="bg-gradient-hero w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-1.5" />
                )}
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="qr">
            <div className="rounded-lg border-2 border-dashed border-border/60 p-8 text-center">
              <ScanLine className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Position the QR code in front of your camera, or paste the token below.
              </p>
              <Input
                {...register("code")}
                placeholder="Paste QR token..."
                className="max-w-sm mx-auto"
              />
              <Button 
                onClick={handleScanQR} 
                disabled={isLoading || !codeValue}
                className="mt-3 bg-gradient-hero"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-1.5" />
                )}
                {isLoading ? "Verifying..." : "Verify token"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Loading State */}
      {isLoading && submittedCode && (
        <Card className="mt-4 p-6 border-primary/40 bg-primary/5 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold">Verifying payment...</h3>
              <p className="text-sm text-muted-foreground">Checking code: {submittedCode}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Valid Result */}
      {!isLoading && isValid && result && (
        <Card className="mt-4 p-6 border-2 border-success/40 bg-success/5 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <Badge className="bg-success text-success-foreground">Authentic  -  Paid</Badge>
                <h3 className="font-semibold mt-1">Payment confirmed</h3>
                <p className="text-xs text-muted-foreground">
                  Verified by {result.issuedBy} • {result.issuingAuthority}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Receipt No." value={result.receiptNumber} />
              <Field label="Amount Paid" value={formatNgn(result.amountPaid)} />
              <Field label="Paid At" value={new Date(result.issuedAt).toLocaleString()} />
              <Field label="Verified By" value={result.issuedBy} />
              {result.business && (
                <>
                  <Field label="Business Name" value={result.business.name} />
                  <Field label="Business Owner" value={result.business.owner} />
                  <Field label="Business Address" value={result.business.address} />
                  <Field label="Levy Type" value={result?.levyType} />

                </>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-success/20">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Verify Another
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Not Found Result */}
      {!isLoading && isNotFound && (
        <Card className="mt-4 p-6 border-2 border-destructive/40 bg-destructive/5 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="destructive">Not Found</Badge>
              <h3 className="font-semibold mt-1">Could not verify "{submittedCode}"</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No matching receipt found. Please check the code and try again.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5 break-words">{value}</div>
    </div>
  );
}
