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
import { getLgaVerificationUrl } from "@/config/lga.config";

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
    const maxRows = config.contentZone.maxRows || 6;
    return extractCertificateContentRows(certificate, maxRows);
  }, [certificate, config.contentZone]);

  // Generate verification URL for QR code
  const qrVerificationUrl = useMemo(() => {
    if (certificate.verification?.verificationUrl) {
      return certificate.verification.verificationUrl;
    }
    return getLgaVerificationUrl(
      certificate.certificateNumber || certificate.publicToken || "",
    );
  }, [certificate]);

  const isInvalid = certificate.status === "revoked" || certificate.status === "expired";

  return (
    <div
      translate="no"
      className={`cert-canvas-container notranslate relative w-full select-none bg-white shadow-2xl transition-all ${className}`}
      style={{
        aspectRatio: config.aspectRatio || "1.414 / 1",
        maxWidth: "1120px",
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
          const rawValue = field.format
            ? field.format(certificate)
            : (certificate.certificateData as any)?.[fieldKey] || "";

          const value =
            typeof rawValue === "string"
              ? rawValue.trim()
              : rawValue !== null && rawValue !== undefined
              ? String(rawValue).trim()
              : "";

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
                  (value.includes("\n")
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
                title={value}
              >
                {value}
              </span>
            </div>
          );
        })}

        {/* 2b. DYNAMIC REPEATING CONTENT ROWS (Universal Service Form Data Schema) */}
        {config.contentZone &&
          dynamicRows
            .filter((row) => row.value && row.value.trim() !== "")
            .map((row, index, allRows) => {
              const zone = config.contentZone!;
              const isTwoCol = zone.columns === 2 && allRows.length > 3;
              const splitIndex = zone.splitAfterRow ?? Math.ceil(allRows.length / 2);
              const isRightCol = isTwoCol && index >= splitIndex;
              const colRowIndex = isRightCol ? index - splitIndex : index;

              const rowY = zone.startY + colRowIndex * zone.rowHeight;
              const labelX = isRightCol ? (zone.rightColumnLabelX ?? 62.5) : zone.labelX;
              const labelWidth = isRightCol ? (zone.rightColumnLabelWidth ?? 10.0) : zone.labelWidth;
              const valueX = isRightCol ? (zone.rightColumnValueX ?? 73.0) : zone.valueX;
              const valueWidth = isRightCol ? (zone.rightColumnValueWidth ?? 15.5) : zone.valueWidth;

              const labelFontFamily = zone.labelFontFamily || config.templateDefaults.fontFamily;
              const labelFontSize = zone.labelFontSize || config.templateDefaults.fontSize;
              const labelColor = zone.labelColor || "#0D3B1E";
              const valueFontFamily = zone.valueFontFamily || config.templateDefaults.fontFamily;
              const valueFontSize = zone.valueFontSize || config.templateDefaults.fontSize;
              const valueColor = zone.valueColor || config.templateDefaults.color;

              // Coordinate calculations
              const colonX = labelX + labelWidth;
              const colonWidth = Math.max(0.5, valueX - colonX);

              return (
                <React.Fragment key={`dynamic-row-${row.key}-${index}`}>
                  {/* Row Label */}
                  <div
                    id={`cert-row-label-${row.key}`}
                    className="absolute flex items-center overflow-hidden"
                    style={{
                      top: `${rowY}%`,
                      left: `${labelX}%`,
                      width: `${labelWidth}%`,
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
                    <span className="truncate select-text" title={row.label}>{row.label}</span>
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
                      left: `${valueX}%`,
                      width: `${valueWidth}%`,
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
                    <span className="truncate select-text" title={row.value}>{row.value}</span>
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
              mixBlendMode: "multiply",
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
