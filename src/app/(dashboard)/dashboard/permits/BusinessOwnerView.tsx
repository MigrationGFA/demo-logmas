

import React from 'react'
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  PageHeader,
  StatCard,
  EmptyState,
} from "@/components/dashboard/shared";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import {
  CheckCircle2,
  AlertTriangle,
  Wallet,
  FilePlus2,
  CreditCard,
  Download,
} from "lucide-react";
// import { useAuth } from "@/hooks/queries/useAuth";
import {
  useBusinessInvoices,
  useBusinessPermits,
} from "@/hooks/queries/useBusiness";

import Link from "next/link";
import { Permit } from "@/services/apiBusiness";
import { redirect } from "next/navigation";
import { NGN, statusClass } from './page';
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricsSkeleton, CardsSkeleton } from "@/components/ui/LoadingSkeleton";

function BusinessOwnerView() {
//   const { user } = useAuth();
  const {
    permits = [],
    isLoading: permitsLoading,
    error: permitsError,
    refetch: refetchPermits,
  } = useBusinessPermits();
  const { useGetInvoices } = useBusinessInvoices();

  // Fetch invoices to check payment status
  const { data: invoicesData } = useGetInvoices({ limit: 100 });
  const invoices = invoicesData?.data || [];

  // Filter permits for the current user (backend already filters, but ensure we have data)
  const mine = useMemo(() => {
    const allPermits = permits ?? [];
    if (!allPermits.length) return [];
    return allPermits;
  }, [permits]);

  // console.log(permits, "categories");
  const active = mine.filter((p) => p.status === "issued").length;
  const outstanding = mine
    .filter((p) => p.status !== "issued")
    .reduce((s, p) => s + p.fee, 0);

  const expiringSoon = useMemo(() => {
    const now = Date.now();
    const THIRTY = 30 * 24 * 60 * 60 * 1000;
    return mine.filter((p) => {
      if (!p.expiryDate) return false;
      const diff = new Date(p.expiryDate).getTime() - now;
      return diff > 0 && diff <= THIRTY;
    });
  }, [mine]);

  const handleDownloadCertificate =  (permit: Permit) => {
   
      // toast.success(`Certificate for ${permit.businessName} is being prepared`);
      redirect(`/dashboard/certificate/permit/${permit.id}`);
    
  };

  if (permitsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Business Permits"
          subtitle="Manage your company trade licenses and official digital certificates."
          action={
            <Button asChild>
              <Link href="/dashboard/permits/new">
                <FilePlus2 className="h-4 w-4 mr-2" />
                Apply for Permit
              </Link>
            </Button>
          }
        />
        <MetricsSkeleton count={3} />
        <CardsSkeleton count={3} />
      </div>
    );
  }

  if (permitsError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Business Permits"
          subtitle="Manage your company trade licenses and official digital certificates."
          action={
            <Button asChild>
              <Link href="/dashboard/permits/new">
                <FilePlus2 className="h-4 w-4 mr-2" />
                Apply for Permit
              </Link>
            </Button>
          }
        />
        <ErrorState
          title="Failed to load business permits"
          error={permitsError}
          refetch={refetchPermits}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Business Permits"
        subtitle="Manage your company trade licenses and official digital certificates."
        action={
          <Button asChild>
            <Link href="/dashboard/permits/new">
              <FilePlus2 className="h-4 w-4 mr-2" />
              Apply for Permit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Active Permits"
          value={String(active)}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          label="Outstanding Levies"
          value={NGN(outstanding)}
          icon={Wallet}
          color="destructive"
        />
        <StatCard
          label="Expiring Soon"
          value={String(expiringSoon.length)}
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {expiringSoon.length > 0 && (
        <Card className="p-4 mb-6 border-warning/40 bg-warning/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-foreground mt-0.5" />
            <div>
              <div className="font-semibold">
                {expiringSoon.length} permit(s) expiring within 30 days
              </div>
              <div className="text-sm text-muted-foreground">
                Renew now to avoid interruption:{" "}
                {expiringSoon.map((p) => p.businessName).join(", ")}.
              </div>
            </div>
          </div>
        </Card>
      )}

      {mine.length === 0 ? (
        <EmptyState
          title="No registered businesses yet"
          desc="Apply for your first trade license to start building your compliance portfolio."
          action={
            <Button asChild>
              <Link href="/dashboard/permits/new">
                <FilePlus2 className="h-4 w-4 mr-2" />
                Apply for First License
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mine.map((p) => {
            const isActive = p.status === "issued";
            const unpaidInvoice = invoices.find(
              (i) => i.id === p.invoiceId && i.status !== "paid",
            );
            const isExpiringSoon = expiringSoon.some((exp) => exp.id === p.id);

            return (
              <Card
                key={p.id}
                className={`p-5 bg-gradient-card hover:shadow-elegant transition-smooth flex flex-col ${
                  isExpiringSoon ? "border-warning/40" : "border-border/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.businessName}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {p.permitNumber}
                    </div>
                  </div>
                  <Badge variant="outline" className={statusClass(p.status)}>
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="mt-3">
                  <Badge variant="secondary">{p.permitType}</Badge>
                </div>

                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <div>
                    <span className="font-medium text-foreground">Issued:</span>{" "}
                    {p.issueDate
                      ? new Date(p.issueDate).toLocaleDateString()
                      : " - "}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Expires:
                    </span>{" "}
                    {p.expiryDate
                      ? new Date(p.expiryDate).toLocaleDateString()
                      : " - "}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Fee:</span>{" "}
                    {NGN(p.fee)}
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                  {isActive ? (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() => handleDownloadCertificate(p)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                      <div className="shrink-0 rounded-md border border-border/60 bg-background p-1">
                        <QRCodeSVG
                          value={p.qrToken || p.permitNumber}
                          size={56}
                        />
                      </div>
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link
                        href={
                          unpaidInvoice
                            ? `/dashboard/invoices/${unpaidInvoice.invoiceNumber}`
                            : `/dashboard/permits/${p.id}`
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Permit Levy Now
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default BusinessOwnerView
