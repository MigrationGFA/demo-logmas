import React from "react";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import { LGA_CONFIG } from "@/config/lga.config";

interface CertificateQRCodeProps {
  value: string;
  size?: number;
  label?: string;
  subLabel?: string;
  className?: string;
}

export function CertificateQRCode({
  value,
  size = 72,
  label = "Scan to verify authenticity",
  subLabel = `or visit: ${LGA_CONFIG.verification.domain}`,
  className = "",
}: CertificateQRCodeProps) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Framed QR Code Container */}
      <div className="p-2 bg-white rounded-md border-2 border-[#166534]/50 shadow-sm">
        <QRCodeSVG value={value} size={size} />
      </div>

      {/* Verification Instructions */}
      {label && (
        <div className="mt-1.5 text-[9.5px] font-medium text-slate-700 text-center tracking-tight leading-tight">
          {label}
        </div>
      )}
      {subLabel && (
        <div className="text-[8.5px] text-slate-500 font-mono text-center tracking-tight leading-tight">
          {subLabel}
        </div>
      )}
    </div>
  );
}
