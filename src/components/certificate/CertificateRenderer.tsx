/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { PublicCertificate } from "@/types/publicCertificate";
import {
  MasterCertificateConfig,
  CertificateFieldDefinition,
  extractCertificateContentRows,
} from "@/config/certificateFieldConfig";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import { LGA_CONFIG } from "@/config/lga.config";

interface CertificateRendererProps {
  certificate: PublicCertificate;
  config: MasterCertificateConfig;
  className?: string;
  isWatermarked?: boolean;
}

export function CertificateRenderer({
  certificate,
  config,
  className = "",
  isWatermarked = false,
}: CertificateRendererProps) {
  // Extract dynamic repeating content rows if template defines a contentZone
  const dynamicRows = useMemo(() => {
    if (!config.contentZone) return [];
    const maxRows = config.contentZone.maxRows || 8;
    return extractCertificateContentRows(certificate, maxRows);
  }, [certificate, config.contentZone]);

  // Generate verification URL for QR code
  const qrVerificationUrl = useMemo(() => {
    if (certificate.verification?.verificationUrl) {
      return certificate.verification.verificationUrl;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/certificate/${certificate.publicToken}`;
    }
    return `https://${LGA_CONFIG.verification.domain}/certificate/${certificate.publicToken}`;
  }, [certificate]);

  const isInvalid = certificate.status === "revoked" || certificate.status === "expired";

  return (
    <div
      className={`cert-canvas-container relative w-full select-none bg-white shadow-2xl transition-all ${className}`}
      style={{
        aspectRatio: config.aspectRatio,
        maxWidth: config.orientation === "landscape" ? "1120px" : "800px",
        minHeight: config.minHeight,
        margin: "0 auto",
        containerType: "inline-size",
      }}
    >
      {/* 1. OFFICIAL BLANK MASTER TEMPLATE ARTWORK BACKGROUND */}
      <img
        src={config.backgroundImage}
        alt={`${config.name} Master Artwork`}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        style={{
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      />

      {/* 2. DYNAMIC TEXT OVERLAY LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {Object.entries(config.fields).map(([fieldKey, field]: [string, CertificateFieldDefinition]) => {
          // Resolve dynamic value
          const value = field.format
            ? field.format(certificate)
            : (certificate.certificateData as any)?.[fieldKey] || "";

          if (!value) return null;

          const isCenter = field.textAlign === "center";
          const isRight = field.textAlign === "right";

          // Use field typography or fallback to template defaults
          const fontFamily = field.fontFamily || config.templateDefaults.fontFamily;
          const fontSize = field.fontSize || config.templateDefaults.fontSize;
          const fontWeight = field.fontWeight || config.templateDefaults.fontWeight;
          const fontColor = field.color || config.templateDefaults.color;
          const lineHeight = field.lineHeight || config.templateDefaults.lineHeight;

          return (
            <div
              key={fieldKey}
              id={`cert-field-${fieldKey}`}
              className="absolute flex items-center overflow-hidden"
              style={{
                top: `${field.y}%`,
                left: `${field.x}%`,
                width: field.width ? `${field.width}%` : undefined,
                height: field.height ? `${field.height}%` : undefined,
                transform: isCenter
                  ? "translate(-50%, -50%)"
                  : isRight
                  ? "translate(-100%, -50%)"
                  : "translate(0, -50%)",
                justifyContent: isCenter ? "center" : isRight ? "flex-end" : "flex-start",
                textAlign: field.textAlign || "left",
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                letterSpacing: field.letterSpacing || "normal",
                lineHeight: lineHeight,
                color: fontColor,
                textTransform: field.textTransform || "none",
                fontStyle: field.fontStyle || "normal",
                whiteSpace:
                  field.whiteSpace ||
                  (typeof value === "string" && value.includes("\n")
                    ? "pre-line"
                    : field.maxLines && field.maxLines > 1
                    ? "normal"
                    : "nowrap"),
                wordBreak: "break-word",
                textOverflow: "ellipsis",
              }}
            >
              <span
                className="w-full select-text leading-tight"
                style={{ whiteSpace: "inherit" }}
              >
                {value}
              </span>
            </div>
          );
        })}

        {/* 2b. DYNAMIC REPEATING CONTENT ROWS (Universal Service Form Data Schema) */}
        {config.contentZone &&
          dynamicRows.map((row, index) => {
            const rowY = config.contentZone!.startY + index * config.contentZone!.rowHeight;
            const labelFontFamily = config.contentZone!.labelFontFamily || config.templateDefaults.fontFamily;
            const labelFontSize = config.contentZone!.labelFontSize || config.templateDefaults.fontSize;
            const labelColor = config.contentZone!.labelColor || "#0D3B1E";
            const valueFontFamily = config.contentZone!.valueFontFamily || config.templateDefaults.fontFamily;
            const valueFontSize = config.contentZone!.valueFontSize || config.templateDefaults.fontSize;
            const valueColor = config.contentZone!.valueColor || config.templateDefaults.color;

            // Coordinate calculations
            const colonX = config.contentZone!.labelX + config.contentZone!.labelWidth;
            const colonWidth = Math.max(1, config.contentZone!.valueX - colonX);

            return (
              <React.Fragment key={`dynamic-row-${row.key}-${index}`}>
                {/* Row Label */}
                <div
                  id={`cert-row-label-${row.key}`}
                  className="absolute flex items-center overflow-hidden"
                  style={{
                    top: `${rowY}%`,
                    left: `${config.contentZone!.labelX}%`,
                    width: `${config.contentZone!.labelWidth}%`,
                    transform: "translate(0, -50%)",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    fontFamily: labelFontFamily,
                    fontSize: labelFontSize,
                    fontWeight: 700,
                    color: labelColor,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span className="truncate select-text">{row.label}</span>
                </div>

                {/* Separator Colon */}
                <div
                  id={`cert-row-colon-${row.key}`}
                  className="absolute flex items-center justify-center select-none"
                  style={{
                    top: `${rowY}%`,
                    left: `${colonX}%`,
                    width: `${colonWidth}%`,
                    transform: "translate(0, -50%)",
                    fontFamily: labelFontFamily,
                    fontSize: labelFontSize,
                    fontWeight: 700,
                    color: labelColor,
                  }}
                >
                  :
                </div>

                {/* Row Value */}
                <div
                  id={`cert-row-value-${row.key}`}
                  className="absolute flex items-center overflow-hidden"
                  style={{
                    top: `${rowY}%`,
                    left: `${config.contentZone!.valueX}%`,
                    width: `${config.contentZone!.valueWidth}%`,
                    transform: "translate(0, -50%)",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    fontFamily: valueFontFamily,
                    fontSize: valueFontSize,
                    fontWeight: 600,
                    color: valueColor,
                    lineHeight: "1.25",
                    letterSpacing: "0.01em",
                    wordBreak: "break-word",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span className="truncate select-text">{row.value}</span>
                </div>
              </React.Fragment>
            );
          })}

        {/* 3. DYNAMIC OFFICIAL QR VERIFICATION CODE */}
        {config.qrCode && (
          <div
            id="cert-qr-code-box"
            className="absolute flex items-center justify-center pointer-events-auto"
            style={{
              top: `${config.qrCode.y}%`,
              left: `${config.qrCode.x}%`,
              width: `${config.qrCode.width}%`,
              height: `${config.qrCode.height}%`,
              padding: config.qrCode.padding ? `${config.qrCode.padding}px` : 0,
              backgroundColor: "transparent",
            }}
          >
            <div className="w-full h-full flex items-center justify-center p-0.5 bg-white/95 rounded-[3px] shadow-xs">
              <QRCodeSVG
                value={qrVerificationUrl}
                size={90}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* 4. OFFICIAL CHAIRMAN SIGNATURE IMAGE ASSET */}
        {config.signatureImage && (
          <img
            id="cert-signature-image"
            src={config.signatureImage.src}
            alt="Official Executive Chairman Signature"
            className="absolute pointer-events-none object-contain select-none"
            style={{
              top: `${config.signatureImage.y}%`,
              left: `${config.signatureImage.x}%`,
              width: `${config.signatureImage.width}%`,
              height: `${config.signatureImage.height}%`,
            }}
          />
        )}

        {/* 5. SECURITY / REVOKED / PREVIEW BANNER OVERLAY */}
        {(isWatermarked || isInvalid) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-hidden">
            <div
              className={`transform -rotate-30 font-serif font-black uppercase text-center px-12 py-3 border-4 rounded-xl shadow-2xl select-none ${
                certificate.status === "revoked"
                  ? "text-red-700/80 border-red-700/80 bg-red-100/70 text-4xl"
                  : certificate.status === "expired"
                  ? "text-amber-700/80 border-amber-700/80 bg-amber-100/70 text-4xl"
                  : "text-slate-500/40 border-slate-500/40 bg-slate-100/40 text-3xl"
              }`}
            >
              {certificate.status === "revoked"
                ? "REVOKED / CANCELLED"
                : certificate.status === "expired"
                ? "EXPIRED CERTIFICATE"
                : "PREVIEW COPY"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
