"use client";

import React, { useState } from "react";
import { PublicCertificate } from "@/types/publicCertificate";
import { CertificateRenderer } from "./CertificateRenderer";
import {
  MasterTemplateType,
  resolveTemplateForService,
  setServiceTemplateOverride,
} from "@/config/certificateTemplateMap";
import {
  MASTER_CERTIFICATE_CONFIGS,
  getMasterTemplateConfig,
  MasterCertificateConfig,
} from "@/config/certificateFieldConfig";
import { LGA_CONFIG } from "@/config/lga.config";
import {
  Download,
  Printer,
  ShieldCheck,
  Share2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ArrowLeft,
  LayoutTemplate,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";

interface CertificateViewerProps {
  certificate: PublicCertificate;
  showBackToDashboard?: boolean;
}

export function CertificateViewer({
  certificate,
  showBackToDashboard = false,
}: CertificateViewerProps) {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Determine initial master template (landscape or portrait)
  const [activeTemplateType, setActiveTemplateType] = useState<MasterTemplateType>(() => {
    return resolveTemplateForService(certificate.service.code || certificate.service.name);
  });

  const activeConfig: MasterCertificateConfig = getMasterTemplateConfig(activeTemplateType);

  // Handle live template switch
  const handleTemplateChange = (templateType: MasterTemplateType) => {
    setActiveTemplateType(templateType);
    const newConfig = getMasterTemplateConfig(templateType);
    toast.success(`Switched to ${newConfig.name}`);
  };

  // Save current template as default for this service
  const handleSaveAsDefault = () => {
    const serviceKey = certificate.service.code || certificate.service.name;
    setServiceTemplateOverride(serviceKey, activeTemplateType);
    toast.success(`Saved "${activeConfig.name}" as default master template for ${certificate.service.name}`);
  };

  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? window.location.href
          : `https://logmas.gov.ng/certificate/${certificate.publicToken}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Certificate verification link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLandscape = activeConfig.orientation === "landscape";

  return (
    <div className="certificate-viewer-root w-full min-h-screen bg-slate-100/90 dark:bg-slate-950 py-6 px-3 sm:px-6">
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
          .certificate-toolbar {
            display: none !important;
          }
          .certificate-viewer-root {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }
          .cert-document-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            transform: none !important;
            display: block !important;
          }
          .cert-canvas-container {
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: ${isLandscape ? "landscape" : "portrait"};
            margin: 0;
          }
        }
      `}</style>

      {/* TOP FLOATING / FIXED ACTION TOOLBAR */}
      <div className="no-print certificate-toolbar max-w-6xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left info & Status badge */}
          <div className="flex items-center gap-3">
            {showBackToDashboard ? (
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <Link href="/dashboard/applications">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Applications</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <Link href="/verify">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public Registry</span>
                </Link>
              </Button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white font-medium text-[11px] gap-1 px-2 py-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Document</span>
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {certificate.certificateNumber}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {certificate.service.name} • {LGA_CONFIG.identity.fullName}, {LGA_CONFIG.identity.state}
              </p>
            </div>
          </div>

          {/* Center/Right: Master Template Switcher & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* MASTER TEMPLATE SELECTOR */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pl-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Template:</span>
              </div>
              <Select
                value={activeTemplateType}
                onValueChange={(val) => handleTemplateChange(val as MasterTemplateType)}
              >
                <SelectTrigger className="h-7 text-xs bg-white dark:bg-slate-900 min-w-[195px] border-slate-200">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait" className="text-xs">
                    Portrait (Origin & Permits)
                  </SelectItem>
                  <SelectItem value="landscape" className="text-xs">
                    Landscape (Club & Associations)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-slate-600 hover:text-emerald-700 gap-1"
                onClick={handleSaveAsDefault}
                title="Save this master template layout as default for this service"
              >
                <Save className="w-3 h-3" />
                <span className="hidden xl:inline">Set Default</span>
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-mono font-medium">{zoomLevel}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel(100)}
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Share / Copy Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Share</span>
                </>
              )}
            </Button>

            {/* Verify in Public Registry */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 hidden sm:inline-flex"
            >
              <Link
                href={`/verify?code=${encodeURIComponent(certificate.certificateNumber)}`}
                target="_blank"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Verify</span>
              </Link>
            </Button>

            {/* Download Certificate as PDF */}
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 bg-[#0D3B1E] hover:bg-[#14532D] text-white font-semibold text-xs h-8 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>

            {/* Print Official Button */}
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 hidden sm:inline-flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CERTIFICATE DISPLAY CANVAS */}
      <div className="cert-document-wrapper w-full overflow-x-auto pb-12 flex justify-center">
        <div
          className="transition-transform duration-200 origin-top w-full flex justify-center"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
          }}
        >
          <CertificateRenderer
            certificate={certificate}
            config={activeConfig}
          />
        </div>
      </div>
    </div>
  );
}

