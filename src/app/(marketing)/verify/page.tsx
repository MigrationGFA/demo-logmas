"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, QrCode, CheckCircle2, XCircle, Loader2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiVerification } from "@/services/apiVerification";

export const usePublicVerification = (code: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["public-verify", code],
    queryFn: async () => {
      const response = await apiVerification.verifyDocument(code);
      return response;
    },
    enabled: !!code && enabled,
    retry: false,
    staleTime: 0,
  });
};

// Form validation schema
const verificationSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [submittedCode, setSubmittedCode] = useState<string | null>(initialCode || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: initialCode },
  });

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setValue("code", codeParam);
      setSubmittedCode(codeParam);
    }
  }, [searchParams, setValue]);

  const codeValue = watch("code");

  // Use the public verification hook
  const { data: response, isLoading, error } = usePublicVerification(
    submittedCode || "",
    !!submittedCode
  );

  const onSubmit = (data: VerificationFormData) => {
    setSubmittedCode(data.code);
  };

  const handleReset = () => {
    setSubmittedCode(null);
    setValue("code", "");
  };

  // Extract result from API response
  const result = response?.data || (response?.valid ? (response as any) : null);
  const isValid = response?.valid === true && !!result;
  const isNotFound = submittedCode && !isLoading && (!isValid || !!error);

  // Helper to format currency
  const formatNgn = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine badge color based on type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SOO":
        return <Badge className="bg-blue-600 text-white">State of Origin</Badge>;
      case "PERMIT":
        return <Badge className="bg-purple-600 text-white">Operational Permit</Badge>;
      case "LEVY":
        return <Badge className="bg-amber-600 text-white">Revenue Levy</Badge>;
      default:
        return <Badge>Document</Badge>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-elegant mb-4">
          <ShieldCheck className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Document Verification
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Verify the authenticity of the LGA Certificates of Origin, trade permits, and official receipts.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-gradient-card border-border/40 shadow-elegant">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-sm font-medium">
              Enter Verification Code or Certificate Number
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="code"
                placeholder="e.g. ODE/SOO/2026/001 or QR Code"
                {...register("code")}
                className="pl-10 font-mono text-sm uppercase bg-background"
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.code && (
              <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !codeValue}
              className="flex-1 bg-gradient-hero shadow-elegant"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Document
                </>
              )}
            </Button>
            {submittedCode && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Clear
              </Button>
            )}
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
          <span>You can also scan the QR code printed on the official document</span>
        </div>
      </Card>

      {/* Valid Result */}
      {!isLoading && isValid && result && (
        <Card className="mt-6 p-6 border-2 border-success/40 bg-success/5 animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-success text-success-foreground">Authentic & Verified</Badge>
                {getTypeBadge(result.type)}
              </div>
              <h3 className="font-semibold text-lg mt-1">{result.title}</h3>
              <p className="text-sm text-muted-foreground">
                Issued by the Local Government Council · {result.status}
                {result.isExpired && (
                  <span className="ml-2 text-destructive font-medium">(Expired)</span>
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <Field label="ID Number" value={result.idNumber} />
                <Field label="Holder" value={result.holder} />
                <Field label="Issued On" value={formatDate(result.issuedAt)} />
                <Field label="Expires" value={result.expiresAt ? formatDate(result.expiresAt) : "Never"} />

                {result.type === "SOO" && (
                  <>
                    <Field label="Gender" value={result.metadata?.gender || "N/A"} />
                    <Field label="Ward" value={result.metadata?.ward || "N/A"} />
                    <Field label="Purpose" value={result.metadata?.purpose || "N/A"} />
                  </>
                )}

                {(result.type === "LEVY" || result.type === "PERMIT") && (
                  <>
                    <Field label="Amount Paid" value={formatNgn(result.amount)} />
                    <Field label="Business Owner" value={result.metadata?.ownerName || "N/A"} />
                    <Field label="Business Address" value={result.metadata?.businessAddress || "N/A"} />
                    <Field label="Category" value={result.metadata?.categoryName || "N/A"} />
                    <Field label="Ward" value={result.metadata?.wardName || "N/A"} />
                  </>
                )}

                {result.type === "DOCUMENT" && (
                  <>
                    {result.amount > 0 && <Field label="Statutory Fee" value={formatNgn(result.amount)} />}
                    <Field label="Ward" value={result.metadata?.ward || result.metadata?.wardName || "N/A"} />
                    <Field label="Service / Category" value={result.metadata?.categoryName || "Statutory Service"} />
                    <Field label="Location / LGA" value={result.metadata?.businessAddress || "the Local Government, Ogun State"} />
                  </>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-success/20 flex flex-wrap items-center gap-2.5">
                {(result.certificateNumber || result.publicToken || result.idNumber) && (
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 bg-[#0D3B1E] hover:bg-[#14532D] text-white font-semibold text-xs h-8 shadow-sm"
                  >
                    <Link
                      href={`/certificate/${encodeURIComponent(result.certificateNumber || result.idNumber)}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Certificate</span>
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-8">
                  Verify Another
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Not Found Result */}
      {!isLoading && isNotFound && (
        <Card className="mt-6 p-6 border-2 border-destructive/40 bg-destructive/5 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="destructive">Not Found</Badge>
              <h3 className="font-semibold text-lg mt-1">
                Document could not be verified
              </h3>
              <p className="text-sm text-muted-foreground">
                {response?.error || `No official record matches "${submittedCode}". Check the code and try again.`}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Need help?{" "}
        <Link href="/contact" className="text-primary font-medium underline">
          Contact the LGA
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-mesh py-12 md:py-20 px-4">
        <Suspense fallback={<div className="text-center py-12 text-sm text-muted-foreground">Loading verification...</div>}>
          <VerifyContent />
        </Suspense>
      </main>
      <SiteFooter />
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
