/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { ReceiptDetails, Receipt } from "@/services/apiReceipts";
import { ReceiptRenderer } from "./ReceiptRenderer";
import { OFFICIAL_RECEIPT_CONFIG } from "@/config/receiptTemplateConfig";
import {
  Printer,
  ShieldCheck,
  Share2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ArrowLeft,
  Download,
  FileText,
  CreditCard,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

interface ReceiptViewerProps {
  receipt: ReceiptDetails | Receipt | any;
  showBackToDashboard?: boolean;
}

export function ReceiptViewer({
  receipt,
  showBackToDashboard = true,
}: ReceiptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<"graphic" | "tabular">("graphic");

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify?code=${encodeURIComponent(receipt?.verificationCode || receipt?.receiptNumber || "")}`
    : `https://logmas.gov.ng/verify?code=${encodeURIComponent(receipt?.verificationCode || receipt?.receiptNumber || "")}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success("Receipt verification link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.info("Select 'Save as PDF' in the print dialogue for high-resolution document export.");
  };

  return (
    <div className="receipt-viewer-root w-full min-h-screen bg-slate-100/90 dark:bg-slate-950 py-6 px-3 sm:px-6">
      {/* PRINT STYLES INJECTION */}
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          nav,
          header,
          footer,
          .site-header,
          .site-footer,
          .receipt-toolbar {
            display: none !important;
          }
          .receipt-viewer-root {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }
          .receipt-document-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            transform: none !important;
            display: block !important;
          }
          .receipt-canvas-container {
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* TOP FLOATING / FIXED ACTION TOOLBAR */}
      <div className="no-print receipt-toolbar max-w-6xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left info & Status badge */}
          <div className="flex items-center gap-3">
            {showBackToDashboard && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <Link href="/dashboard/receipts">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Receipts</span>
                </Link>
              </Button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {receipt.receiptNumber || "Statutory Receipt"}
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] px-2 py-0.5 shadow-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" /> PAID & VERIFIED
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Official E-Treasury Statutory Settle • the Local Government Council
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Button
                variant={viewMode === "graphic" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("graphic")}
                className="h-7 text-xs px-2.5"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Official Graphic
              </Button>
              <Button
                variant={viewMode === "tabular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tabular")}
                className="h-7 text-xs px-2.5"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                Data View
              </Button>
            </div>

            {/* Zoom Controls (Graphic View only) */}
            {viewMode === "graphic" && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-mono px-1.5 text-muted-foreground select-none">
                  {zoomLevel}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setZoomLevel(100)}
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Share / Copy link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </Button>

            {/* Public Verify Link */}
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Link href={`/verify?code=${encodeURIComponent(receipt.verificationCode || "")}`} target="_blank">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify Online</span>
              </Link>
            </Button>

            {/* Print Document */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>

            {/* Download PDF */}
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-1.5 text-xs h-8 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {viewMode === "graphic" ? (
        <div className="receipt-document-wrapper flex justify-center items-center py-2 sm:py-6 overflow-x-auto">
          <div
            style={{
              transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : "none",
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="w-full max-w-5xl transition-transform"
          >
            <ReceiptRenderer
              receipt={receipt}
              config={OFFICIAL_RECEIPT_CONFIG}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold">Receipt Breakdown</h3>
                <p className="text-xs text-muted-foreground">Official E-Treasury Transaction Record</p>
              </div>
              <Badge className="bg-emerald-600 text-white">PAID</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 py-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Receipt Number</span>
                <span className="font-mono font-bold">{receipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Verification Code</span>
                <span className="font-mono font-bold text-emerald-600">{receipt.verificationCode}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Invoice Reference</span>
                <span className="font-mono font-semibold">{receipt.invoiceRef || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Payment Method</span>
                <span className="font-semibold uppercase">{receipt.paymentMethod || "Online Card / Remita"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Customer / Payer</span>
                <span className="font-semibold">{receipt.customerName || receipt.serviceName || "Citizen"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Statutory Purpose</span>
                <span className="font-semibold">{receipt.levyType || "Statutory Council Fee"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Amount Paid</span>
                <span className="text-xl font-black text-emerald-700">
                  ₦{Number(receipt.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Date of Settlement</span>
                <span className="font-medium">
                  {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : "26th August, 2026"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

