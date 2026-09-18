"use client"
import { PageHeader, EmptyState } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, QrCode, Receipt as ReceiptIcon, Eye, Loader2 } from "lucide-react";
import { useReceipts } from "@/hooks/queries/useReceipts";
import Link from "next/link";

export default function ReceiptsListPage() {
  const { receipts, isLoading, error, refetch, hasReceipts, count } = useReceipts();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Receipts" subtitle="QR-verified digital receipts" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Receipts" subtitle="QR-verified digital receipts" />
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load receipts</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Receipts" 
        subtitle={`QR-verified digital receipts • ${count} total`} 
      />
      
      {!hasReceipts ? (
        <EmptyState
          title="No receipts yet"
          desc="Receipts will appear here once invoices are paid."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptCard({ receipt }: { receipt: any }) {
  return (
    <Card className="p-5 bg-gradient-card border-border/40 hover:shadow-elegant transition-smooth">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center">
          <ReceiptIcon className="h-5 w-5" />
        </div>
        <Badge className="bg-success/15 text-success border-success/30">Paid</Badge>
      </div>
      
      <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
        Receipt
      </div>
      <div className="font-mono font-semibold text-sm">{receipt.receiptNumber}</div>
      
      <div className="text-2xl font-bold tracking-tight mt-2">
        ₦{receipt.amount.toLocaleString()}
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        {receipt.customerName} • {receipt.levyType}
      </div>
      
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {new Date(receipt.paidAt).toLocaleDateString()} • {receipt.paymentMethod.toUpperCase()}
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link href={`/dashboard/receipts/${receipt.id}`}>
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/receipts/${receipt.id}`}>
            <QrCode className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
