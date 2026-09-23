/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { ReceiptDetails, Receipt } from "@/services/apiReceipts";
import {
  OFFICIAL_RECEIPT_CONFIG,
  MasterReceiptConfig,
  ReceiptFieldDefinition,
} from "@/config/receiptTemplateConfig";
import { QRCodeSVG } from "@/components/dashboard/qr-code";
import { getLgaVerificationUrl } from "@/config/lga.config";

interface ReceiptRendererProps {
  receipt: ReceiptDetails | Receipt | any;
  config?: MasterReceiptConfig;
  className?: string;
  isWatermarked?: boolean;
}

export function ReceiptRenderer({
  receipt,
  config = OFFICIAL_RECEIPT_CONFIG,
  className = "",
  isWatermarked = false,
}: ReceiptRendererProps) {
  // Verification URL for QR scanning
  const qrVerificationUrl = useMemo(() => {
    const code = receipt?.verificationCode || receipt?.qrToken || receipt?.receiptNumber || "";
    // Slashes are legal in a query value and must stay readable in the printed QR.
    return getLgaVerificationUrl(code);
  }, [receipt]);

  return (
    <div
      className={`receipt-canvas-container relative w-full select-none bg-white shadow-2xl transition-all ${className}`}
      style={{
        aspectRatio: config.aspectRatio,
        maxWidth: "1080px",
        minHeight: config.minHeight,
        margin: "0 auto",
        containerType: "inline-size",
      }}
    >
      {/* 1. OFFICIAL BLANK MASTER TEMPLATE ARTWORK BACKGROUND */}
      <img
        src={config.backgroundImage}
        alt={`${config.name} Official Master Artwork`}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        style={{
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      />

      {/* 2. DYNAMIC TEXT OVERLAY LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {Object.entries(config.fields).map(([fieldKey, field]: [string, ReceiptFieldDefinition]) => {
          // Resolve dynamic value
          const value = field.format
            ? field.format(receipt)
            : (receipt as any)?.[fieldKey] || "";

          if (!value) return null;

          const isCenter = field.textAlign === "center";
          const isRight = field.textAlign === "right";

          const fontFamily = field.fontFamily || config.templateDefaults.fontFamily;
          const fontSize = field.fontSize || config.templateDefaults.fontSize;
          const fontWeight = field.fontWeight || config.templateDefaults.fontWeight;
          const fontColor = field.color || config.templateDefaults.color;
          const lineHeight = field.lineHeight || config.templateDefaults.lineHeight;

          return (
            <div
              key={fieldKey}
              id={`receipt-field-${fieldKey}`}
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
                whiteSpace: field.maxLines && field.maxLines > 1 ? "normal" : "nowrap",
                wordBreak: "break-word",
                textOverflow: "ellipsis",
              }}
            >
              <span className="w-full select-text leading-tight drop-shadow-xs">{value}</span>
            </div>
          );
        })}

        {/* 3. DYNAMIC OFFICIAL QR CODE INSIDE AUTHENTICITY BOX */}
        {config.qrCode && (
          <div
            id="receipt-qr-code-box"
            className="absolute flex items-center justify-center pointer-events-auto"
            style={{
              top: `${config.qrCode.y}%`,
              left: `${config.qrCode.x}%`,
              width: `${config.qrCode.width}%`,
              height: `${config.qrCode.height}%`,
              transform: "translate(-50%, -50%)",
              padding: config.qrCode.padding ? `${config.qrCode.padding}px` : 0,
              backgroundColor: "transparent",
            }}
          >
            <div className="w-full h-full flex items-center justify-center p-1.5 bg-white rounded-md shadow-xs border border-emerald-950/20">
              <QRCodeSVG
                value={qrVerificationUrl}
                size={140}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* 4. WATERMARK / DEMO OVERLAY (IF REQUIRED) */}
        {isWatermarked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-hidden">
            <div className="transform -rotate-30 font-serif font-black uppercase text-center px-12 py-3 border-4 rounded-xl shadow-2xl select-none text-slate-500/40 border-slate-500/40 bg-slate-100/40 text-3xl">
              PREVIEW COPY
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
