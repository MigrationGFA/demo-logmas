/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReceiptDetails, Receipt } from "@/services/apiReceipts";
import { LGA_CONFIG } from "@/config/lga.config";

export interface ReceiptFieldDefinition {
  key: string;
  label?: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width?: number; // percentage width (0 - 100)
  height?: number; // percentage height (0 - 100)
  textAlign?: "left" | "center" | "right";
  fontFamily?: string;
  fontSize?: string; // Container query width (cqw) or px
  fontWeight?: number | string;
  letterSpacing?: string;
  lineHeight?: string;
  color?: string;
  textTransform?: "uppercase" | "capitalize" | "lowercase" | "none";
  fontStyle?: "normal" | "italic";
  maxLines?: number;
  format?: (receipt: ReceiptDetails | Receipt | any) => string;
}

export interface MasterReceiptConfig {
  id: string;
  name: string;
  orientation: "landscape";
  aspectRatio: string;
  minHeight: string;
  backgroundImage: string;
  defaultTitle: string;
  templateDefaults: {
    fontFamily: string;
    fontSize: string;
    fontWeight: number | string;
    color: string;
    lineHeight: string;
  };
  qrCode: {
    x: number; // percentage from left
    y: number; // percentage from top
    width: number;
    height: number;
    padding?: number;
  };
  fields: Record<string, ReceiptFieldDefinition>;
}

export const RECEIPT_FONTS = {
  SERIF: "'Cormorant Garamond', 'Cinzel', 'Times New Roman', serif",
  SANS: "'Albert Sans', 'Segoe UI', system-ui, sans-serif",
  MONO: "'JetBrains Mono', 'Courier New', Courier, monospace",
};

/**
 * MASTER OFFICIAL RECEIPT CONFIGURATION
 * Image Background: /certificates/templates/receipt-template.jpg
 */
export const OFFICIAL_RECEIPT_CONFIG: MasterReceiptConfig = {
  id: "official_receipt",
  name: `Official ${LGA_CONFIG.identity.name} LGA Statutory Receipt`,
  orientation: "landscape",
  aspectRatio: "4 / 3",
  minHeight: "680px",
  backgroundImage: "/certificates/templates/receipt-template.jpg",
  defaultTitle: "OFFICIAL RECEIPT",

  templateDefaults: {
    fontFamily: RECEIPT_FONTS.SANS,
    fontSize: "0.95cqw",
    fontWeight: 600,
    color: "#0D3B1E",
    lineHeight: "1.2",
  },

  qrCode: {
    x: 81.5, // Centered inside the right column square box
    y: 58.8,
    width: 15.2,
    height: 20.2,
    padding: 3,
  },

  fields: {
    // ==========================================
    // 1. LEFT COLUMN  -  5 FORM BOXES
    // ==========================================
    receiptNumber: {
      key: "receiptNumber",
      label: "Receipt No.",
      x: 11.6,
      y: 36.6,
      width: 16.5,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.MONO,
      fontSize: "0.92cqw",
      fontWeight: 700,
      color: "#064E3B",
      textTransform: "uppercase",
      format: (r) => r.receiptNumber || "ODE/REC/2026/0001",
    },

    verificationCode: {
      key: "verificationCode",
      label: "Verification Code",
      x: 11.6,
      y: 45.4,
      width: 16.5,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.MONO,
      fontSize: "0.90cqw",
      fontWeight: 700,
      color: "#0F766E",
      textTransform: "uppercase",
      format: (r) => r.verificationCode || r.qrToken || "VER-ODE-REC-001",
    },

    invoiceRef: {
      key: "invoiceRef",
      label: "Invoice Ref.",
      x: 11.6,
      y: 54.2,
      width: 16.5,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.MONO,
      fontSize: "0.90cqw",
      fontWeight: 600,
      color: "#1E293B",
      textTransform: "uppercase",
      format: (r) => r.invoiceRef || r.invoiceId || "INV-ODE-2026-001",
    },

    paymentMethod: {
      key: "paymentMethod",
      label: "Payment Method",
      x: 11.6,
      y: 63.0,
      width: 16.5,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.SANS,
      fontSize: "0.88cqw",
      fontWeight: 700,
      color: "#1E293B",
      textTransform: "uppercase",
      format: (r) => (r.paymentMethod ? `${r.paymentMethod.toUpperCase()} (VERIFIED)` : "ONLINE / CARD (SETTLED)"),
    },

    customer: {
      key: "customer",
      label: "Customer",
      x: 11.6,
      y: 71.8,
      width: 16.8,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.SANS,
      fontSize: "0.90cqw",
      fontWeight: 700,
      color: "#0D3B1E",
      textTransform: "uppercase",
      format: (r) => r.customerName || r.serviceName || r.payerName || `${LGA_CONFIG.identity.name} Indigene / Resident`,
    },

    // ==========================================
    // 2. CENTER ORNATE "PAID" GOLD BOX
    // ==========================================
    amountDisplay: {
      key: "amountDisplay",
      label: "Statutory Amount",
      x: 50.0,
      y: 39.2,
      width: 31.0,
      textAlign: "center",
      fontFamily: RECEIPT_FONTS.SERIF,
      fontSize: "2.35cqw",
      fontWeight: 900,
      color: "#0D3B1E",
      format: (r) => `₦${Number(r.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
    },

    serviceDescription: {
      key: "serviceDescription",
      label: "Statutory Purpose",
      x: 50.0,
      y: 45.4,
      width: 30.0,
      textAlign: "center",
      fontFamily: RECEIPT_FONTS.SANS,
      fontSize: "0.95cqw",
      fontWeight: 700,
      color: "#166534",
      textTransform: "uppercase",
      format: (r) => r.levyType || r.serviceName || "Statutory Council Revenue Settlement",
    },

    paidDateMetadata: {
      key: "paidDateMetadata",
      label: "Settlement Timestamp",
      x: 50.0,
      y: 49.2,
      width: 30.0,
      textAlign: "center",
      fontFamily: RECEIPT_FONTS.SANS,
      fontSize: "0.78cqw",
      fontWeight: 500,
      color: "#475569",
      format: (r) => {
        const dateStr = r.paidAt ? new Date(r.paidAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) : "26th August, 2026";
        return `Settled: ${dateStr} • Council E-Treasury Approved`;
      },
    },

    // ==========================================
    // 3. RIGHT COLUMN  -  AUTHENTICITY BOX
    // ==========================================
    verificationStatusHeader: {
      key: "verificationStatusHeader",
      label: "Verification Status",
      x: 83.2,
      y: 43.5,
      width: 13.5,
      textAlign: "left",
      fontFamily: RECEIPT_FONTS.MONO,
      fontSize: "0.78cqw",
      fontWeight: 700,
      color: "#059669",
      textTransform: "uppercase",
      format: (r) => r.verificationCode || "VALID & SECURED",
    },
  },
};

