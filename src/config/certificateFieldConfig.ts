/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicCertificate } from "@/types/publicCertificate";
import { MasterTemplateType } from "./certificateTemplateMap";
import { LGA_CONFIG } from "./lga.config";

/**
 * ============================================================================
 * OFFICIAL CERTIFICATE FONT REGISTRY (Strict Guidelines Compliant)
 * ============================================================================
 * Free Font Package:
 * 1. Cinzel (Roman titles/headers): Trajan Pro alternative
 * 2. EB Garamond (Official body text, narrative, subheadings, values)
 * 3. Libertinus Serif (Official labels, emphasis, club/applicant name, signer)
 * 4. Great Vibes (Authentic handwritten signature)
 * 5. Arimo (Crisp official sans-serif for sub-banners, contacts, footers)
 * 6. Marck Script / Pinyon Script (Alternative formal signatures)
 * 7. Playfair Display (Elegant alternative headers)
 * 8. JetBrains Mono (Security codes, document IDs, certificate numbers)
 */
export const CERTIFICATE_FONTS = {
  // Classical Roman Government Display Serifs (for Main Headers, Titles, Banners)
  CINZEL: "'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
  CINZEL_BOLD: "'Cinzel', 'Trajan Pro', 'Times New Roman', serif",

  // Official Narrative & Body Text (Body text, narrative clauses, field values)
  EB_GARAMOND: "'EB Garamond', 'Garamond', 'Times New Roman', serif",
  EB_GARAMOND_SEMIBOLD: "'EB Garamond', 'Garamond', 'Times New Roman', serif",
  EB_GARAMOND_ITALIC: "'EB Garamond', 'Garamond', 'Times New Roman', serif",

  // Official Emphasis, Field Labels, Applicant/Club Name, Signer Name
  LIBERTINUS_SERIF: "'Libertinus Serif', 'Times New Roman', 'Liberation Serif', serif",
  LIBERTINUS_SERIF_BOLD: "'Libertinus Serif', 'Times New Roman', 'Liberation Serif', serif",

  // Crisp Official Sans-Serif (Subtitles, Contacts, Footer & Disclaimers, Clean Labels)
  ARIMO: "'Arimo', Arial, sans-serif",
  ARIMO_BOLD: "'Arimo', Arial, sans-serif",

  // Authentic Handwritten Signature Script
  GREAT_VIBES: "'Great Vibes', cursive",
  MARCK_SCRIPT: "'Marck Script', cursive",
  PINYON_SCRIPT: "'Pinyon Script', cursive",

  // Elegant Display
  PLAYFAIR: "'Playfair Display', 'Georgia', serif",

  // Security / Monospace & Certificate Numbering
  JETBRAINS_MONO: "'JetBrains Mono', 'Courier New', Courier, monospace",
};

/**
 * Individual field layout and typography specification
 */
export interface CertificateFieldDefinition {
  key: string;
  label?: string;
  x: number; // Horizontal position in % (0 - 100)
  y: number; // Vertical position in % (0 - 100)
  width?: number; // Maximum width in % (0 - 100) to prevent overflow
  height?: number; // Optional height in %
  textAlign?: "left" | "center" | "right";
  
  // TYPOGRAPHY (Strictly conforming to official guidelines)
  fontFamily?: string;
  fontSize?: string; // Container query width (e.g. "1.2cqw", "0.95cqw") or px
  fontWeight?: number | string; // e.g. 400, 600, 700, 900
  letterSpacing?: string; // e.g. "0.05em", "0.15em", "normal"
  lineHeight?: string; // e.g. "1.2", "1.4"
  color?: string; // e.g. "#0D3B1E", "#1E293B", "#FFFFFF"
  textTransform?: "uppercase" | "capitalize" | "lowercase" | "none";
  fontStyle?: "normal" | "italic";
  whiteSpace?: "normal" | "nowrap" | "pre-line" | "pre-wrap";
  maxLines?: number;
  
  // Custom Dynamic Value Extractor
  format?: (certificate: PublicCertificate) => string;
}

/**
 * Master Template Layout Configuration
 */
export interface MasterCertificateConfig {
  id: MasterTemplateType;
  name: string;
  orientation: "landscape" | "portrait";
  aspectRatio: string;
  minHeight: string;
  backgroundImage: string;
  defaultTitle: string;
  
  // Template-level typography defaults
  templateDefaults: {
    fontFamily: string;
    fontSize: string;
    fontWeight: number | string;
    color: string;
    lineHeight: string;
  };

  // QR Code coordinates matching the blank template's box
  qrCode: {
    x: number;
    y: number;
    width: number;
    height: number;
    padding?: number;
  };

  // Official Signature Image overlay configuration
  signatureImage?: {
    src: string;
    x: number;      // % from left
    y: number;      // % from top
    width: number;  // % width
    height: number; // % height
  };

  // Dynamic Repeating Row Content Zone Configuration (Phase 5 Scalability)
  contentZone?: CertificateContentZone;

  // Field dictionary
  fields: Record<string, CertificateFieldDefinition>;
}

/**
 * Dynamic Content Zone configuration for repeating data rows
 */
export interface CertificateContentZone {
  startY: number;       // % from top where the first row begins
  rowHeight: number;    // % vertical gap between rows
  labelX: number;       // % left position for labels
  labelWidth: number;   // % max width for labels
  valueX: number;       // % left position for values
  valueWidth: number;   // % max width for values
  labelFontFamily: string;
  labelFontSize: string;
  valueFontFamily: string;
  valueFontSize: string;
  labelColor: string;
  valueColor: string;
  maxRows: number;       // safety cap so overflow content doesn't run off the card
}

export interface CertificateContentRow {
  key: string;
  label: string;
  value: string;
}

/**
 * Human-readable label dictionary for per-service form field keys
 */
export const FIELD_LABELS_MAP: Record<string, string> = {
  // Personal & Indigene fields
  nameOfApplicant: "Name of Applicant",
  fullName: "Full Name of Applicant",
  applicantName: "Applicant Name",
  stateOfOrigin: "State of Origin",
  lgaOfOrigin: "LGA of Origin",
  state: "State of Origin",
  lga: "Local Government Area",
  ward: "Electoral Ward",
  wardName: "Electoral Ward",
  lgaWard: "Ward / Community",
  compoundName: "Family Compound / Quarter",
  placeOfBirth: "Place of Birth",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  occupation: "Occupation",
  phone: "Phone Number",
  email: "Email Address",
  nin: "National Identity Number (NIN)",

  // Address fields
  address: "Official Address",
  residentialAddress: "Residential Address",
  secretariatAddress: "Secretariat Address",
  businessAddress: "Business / Site Address",

  // Business / Permits / Trade
  businessName: "Business / Enterprise Name",
  natureOfBusiness: "Nature of Business",
  descriptionOfGoods: "Description of Goods",
  countryOfDestination: "Country of Destination",
  purpose: "Purpose of Application",
  purposeDescription: "Purpose / Line of Trade",

  // Club / Association / CDA
  clubName: "Name of Association / Club",
  associationName: "Association / Body Name",
  registrationNo: "Registration Number",
  category: "Designated Category",
  objectives: "Core Aims & Objectives",
  aims: "Core Aims & Objectives",
  motto: "Motto / Slogan",
  dateFounded: "Date Founded / Established",
  meetingAddress: "Meeting Place / Secretariat",
  boardChairman: "President / Chairman",
  generalSecretary: "General Secretary",
  membershipCount: "Registered Membership",

  // Health / Environment / Sanitation
  premisesType: "Type of Premises",
  sanitationGrade: "Sanitation Standard / Grade",
  inspectionDate: "Date of Inspection",
  sanitaryOfficer: "Inspecting Officer",

  // Haulage / Rates / Revenue
  vehicleNumber: "Vehicle Reg. Number",
  cargoType: "Cargo / Haulage Type",
  tonnageCapacity: "Tonnage / Capacity",
  routePermitted: "Permitted Transit Route",
  rateAssessment: "Assessed Statutory Rate",
  propertyReference: "Property / Tenement Ref",

  // Validity / Tenor
  validity: "Period of Validity",
  validUntil: "Valid Until",
  tenor: "Permit Tenor",
};

/**
 * Converts a raw camelCase or snake_case key into a human-readable title label
 */
export function formatFieldLabel(key: string): string {
  if (FIELD_LABELS_MAP[key]) return FIELD_LABELS_MAP[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/**
 * Keys excluded from repeating dynamic rows because they are handled
 * by universal fixed fields, headers, signatures, or system metadata.
 */
const EXCLUDED_ROW_KEYS = new Set([
  "id",
  "token",
  "publicToken",
  "documentId",
  "certificateNumber",
  "applicationNo",
  "applicationNumber",
  "status",
  "statusMessage",
  "dateOfIssue",
  "dateOfRegistration",
  "issuedAt",
  "validUntil",
  "expiryDate",
  "councilHeader",
  "councilSubHeader",
  "councilTitle",
  "councilSubtitle",
  "councilAddress",
  "secretariatAddress",
  "phoneEmailWeb",
  "certificateTitle",
  "certifyingIntro",
  "statutoryNotice",
  "statutoryLawNotice",
  "footerDisclaimer",
  "footerBanner",
  "qrCodeLabel",
  "qrUrl",
  "qrToken",
  "verificationUrl",
  "verificationCode",
  "verificationMessage",
  "signerName",
  "signerTitle",
  "signerSignature",
  "password",
  "pin",
  "passportUrl",
  "signatureUrl",
  "documents",
  "uploadedFiles",
  "declarationChecked",
  "requiresInspection",
  "requiresLgaApproval",
  "isApproved",
  "reviewStatus",
]);

/**
 * Standard logical priority order for displaying certificate attributes
 */
const FIELD_PRIORITY_ORDER: string[] = [
  "nameOfApplicant",
  "fullName",
  "applicantName",
  "clubName",
  "associationName",
  "businessName",
  "natureOfBusiness",
  "category",
  "address",
  "residentialAddress",
  "secretariatAddress",
  "businessAddress",
  "stateOfOrigin",
  "lgaOfOrigin",
  "ward",
  "wardName",
  "compoundName",
  "descriptionOfGoods",
  "countryOfDestination",
  "purpose",
  "purposeDescription",
  "objectives",
  "aims",
  "motto",
  "registrationNo",
  "premisesType",
  "sanitationGrade",
  "tonnageCapacity",
  "vehicleNumber",
  "routePermitted",
  "rateAssessment",
  "validity",
];

/**
 * Extracts and orders dynamic content rows from a certificate's certificateData/formData
 */
export function extractCertificateContentRows(
  certificate: PublicCertificate,
  maxRows: number = 8
): CertificateContentRow[] {
  const sourceData: Record<string, any> = {
    ...(certificate.certificateData || {}),
    ...(certificate.application?.formData || {}),
  };

  // Ensure baseline applicant information is available if missing from source data
  if (
    !sourceData.nameOfApplicant &&
    !sourceData.fullName &&
    !sourceData.clubName &&
    !sourceData.businessName &&
    certificate.applicant?.name
  ) {
    sourceData.nameOfApplicant = certificate.applicant.name;
  }
  if (
    !sourceData.address &&
    !sourceData.businessAddress &&
    !sourceData.secretariatAddress &&
    certificate.applicant?.address
  ) {
    sourceData.address = certificate.applicant.address;
  }
  if (!sourceData.ward && certificate.applicant?.ward) {
    sourceData.ward = certificate.applicant.ward;
  }

  // Filter valid candidate keys
  const candidateKeys = Object.keys(sourceData).filter((key) => {
    if (EXCLUDED_ROW_KEYS.has(key)) return false;
    const val = sourceData[key];
    if (val === null || val === undefined) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (typeof val === "boolean") return false;
    if (typeof val === "object" && !Array.isArray(val)) return false;
    return true;
  });

  // Sort by priority order
  candidateKeys.sort((a, b) => {
    const indexA = FIELD_PRIORITY_ORDER.indexOf(a);
    const indexB = FIELD_PRIORITY_ORDER.indexOf(b);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

  const rows: CertificateContentRow[] = [];
  for (const key of candidateKeys) {
    if (rows.length >= maxRows) break;
    const rawVal = sourceData[key];
    const displayVal = Array.isArray(rawVal) ? rawVal.join(", ") : String(rawVal);
    rows.push({
      key,
      label: formatFieldLabel(key),
      value: displayVal,
    });
  }

  return rows;
}

/**
 * Official leadership signatories for statutory certificates
 * Sourced from central LGA_CONFIG.
 */
export const OFFICIAL_CHAIRMAN = {
  name: LGA_CONFIG.leadership.chairman.name,
  title: LGA_CONFIG.leadership.chairman.title,
  organization: LGA_CONFIG.identity.fullName,
  fullTitle: LGA_CONFIG.leadership.chairman.fullTitle,
} as const;

/**
 * ============================================================================
 * 1. UNIFIED MASTER LANDSCAPE TEMPLATE CONFIGURATION (All Services)
 * Background Artwork: /certificates/templates/club-registration-template.jpg
 * ============================================================================
 */
export const LANDSCAPE_TEMPLATE_CONFIG: MasterCertificateConfig = {
  id: LGA_CONFIG.certificates.templates.landscape.id,
  name: LGA_CONFIG.certificates.templates.landscape.name,
  orientation: "landscape",
  aspectRatio: "1.414 / 1", // A4 Landscape Aspect Ratio
  minHeight: "750px",
  backgroundImage: LGA_CONFIG.certificates.templates.landscape.backgroundImage,
  defaultTitle: LGA_CONFIG.certificates.templates.landscape.defaultTitle,

  templateDefaults: {
    fontFamily: CERTIFICATE_FONTS.EB_GARAMOND,
    fontSize: "0.95cqw",
    fontWeight: 500,
    color: "#1E293B",
    lineHeight: "1.3",
  },

  qrCode: {
    x: 78.4,
    y: 73.8,
    width: 7.8,
    height: 11.0,
    padding: 2,
  },

  signatureImage: {
    src: LGA_CONFIG.leadership.chairman.signatureImagePath,
    x: 14.5,
    y: 73.5,
    width: 14.5,
    height: 6.2,
  },

  contentZone: {
    startY: 48.0,
    rowHeight: 4.2,
    labelX: 18.0,
    labelWidth: 26.0,
    valueX: 46.0,
    valueWidth: 42.0,
    labelFontFamily: CERTIFICATE_FONTS.LIBERTINUS_SERIF_BOLD,
    labelFontSize: "0.88cqw",
    valueFontFamily: CERTIFICATE_FONTS.EB_GARAMOND,
    valueFontSize: "0.92cqw",
    labelColor: "#0D3B1E",
    valueColor: "#1E293B",
    maxRows: 6,
  },

  fields: {
    // Top Right Certificate Number
    certificateNumber: {
      key: "certificateNumber",
      x: 88.2,
      y: 8.6,
      width: 17.0,
      textAlign: "left",
      fontFamily: CERTIFICATE_FONTS.ARIMO,
      fontSize: "0.92cqw",
      fontWeight: 600,
      letterSpacing: "0.03em",
      color: "#0D3B1E",
      format: (c) => c.certificateNumber || c.certificateData?.registrationNo || `${LGA_CONFIG.certificates.namingConventions.generalPrefix}/2026/00123`,
    },

    // Top Right Date of Issue
    dateOfIssue: {
      key: "dateOfIssue",
      x: 88.2,
      y: 14.5,
      width: 17.0,
      textAlign: "left",
      fontFamily: CERTIFICATE_FONTS.EB_GARAMOND,
      fontSize: "0.92cqw",
      fontWeight: 600,
      color: "#1E293B",
      format: (c) => c.certificateData?.dateOfRegistration || c.certificateData?.dateOfIssue || c.issuedAt || "21st August, 2026",
    },

    // Green Ribbon Certificate Title Banner (Dynamic to Service being viewed)
    certificateTitle: {
      key: "certificateTitle",
      x: 50.0,
      y: 34.0,
      width: 65.0,
      textAlign: "center",
      fontFamily: CERTIFICATE_FONTS.CINZEL_BOLD,
      fontSize: "1.65cqw",
      fontWeight: 900,
      letterSpacing: "0.08em",
      color: "#FFFFFF",
      textTransform: "uppercase",
      format: (c) => c.service?.name?.toUpperCase() || c.certificateData?.certificateTitle?.toUpperCase() || "OFFICIAL STATUTORY CERTIFICATE",
    },

    // Executive Chairman Signer Name (above signature line)
    signerName: {
      key: "signerName",
      x: 21.8,
      y: 81.5,
      width: 22.0,
      textAlign: "center",
      fontFamily: CERTIFICATE_FONTS.LIBERTINUS_SERIF_BOLD,
      fontSize: "0.90cqw",
      fontWeight: 700,
      letterSpacing: "0.02em",
      color: "#0D3B1E",
      format: (c) => c.issuer?.name || OFFICIAL_CHAIRMAN.name,
    },

    // Executive Chairman Official Title
    signerTitle: {
      key: "signerTitle",
      x: 21.8,
      y: 84.5,
      width: 24.0,
      textAlign: "center",
      fontFamily: CERTIFICATE_FONTS.EB_GARAMOND,
      fontSize: "0.75cqw",
      fontWeight: 500,
      lineHeight: "1.2",
      color: "#334155",
      whiteSpace: "pre-line",
      format: (c) => c.issuer?.title || OFFICIAL_CHAIRMAN.fullTitle,
    },

    // Verification QR Code Label
    qrCodeLabel: {
      key: "qrCodeLabel",
      x: 82.3,
      y: 86.5,
      width: 18.0,
      textAlign: "center",
      fontFamily: CERTIFICATE_FONTS.ARIMO,
      fontSize: "0.62cqw",
      color: "#475569",
      lineHeight: "1.2",
      whiteSpace: "pre-line",
      format: () => `Scan to verify authenticity\nor visit: ${LGA_CONFIG.verification.domain}`,
    },

    footerBanner: {
      key: "footerBanner",
      x: 50.0,
      y: 94.6,
      width: 82.0,
      textAlign: "center",
      fontFamily: CERTIFICATE_FONTS.CINZEL,
      fontSize: "0.80cqw",
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: "#FEF08A",
      textTransform: "uppercase",
      format: () => `${LGA_CONFIG.identity.fullName.toUpperCase()} - ${LGA_CONFIG.identity.motto.toUpperCase()}`,
    },
  },
};

/**
 * @deprecated DISCARDED - The portrait template has been discarded entirely in favor of the unified landscape template.
 */
export const PORTRAIT_TEMPLATE_CONFIG: MasterCertificateConfig = LANDSCAPE_TEMPLATE_CONFIG;

/**
 * MASTER TEMPLATES DICTIONARY
 * Standardized exclusively on Landscape master template.
 */
export const MASTER_CERTIFICATE_CONFIGS: Record<string, MasterCertificateConfig> = {
  landscape: LANDSCAPE_TEMPLATE_CONFIG,
  portrait: LANDSCAPE_TEMPLATE_CONFIG, // Discarded in favor of landscape
};

/**
 * Helper to fetch configuration for a master template.
 * Always returns the unified LANDSCAPE_TEMPLATE_CONFIG.
 */
export function getMasterTemplateConfig(_template?: string): MasterCertificateConfig {
  return LANDSCAPE_TEMPLATE_CONFIG;
}

