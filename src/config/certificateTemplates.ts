/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @deprecated UNUSED LEGACY CONFIGURATION
 * 
 * This file is superseded by the canonical configuration architecture:
 * 1. Coordinates & Field Layouts: `src/config/certificateFieldConfig.ts`
 *    (uses `MasterCertificateConfig`, `PORTRAIT_TEMPLATE_CONFIG`, `LANDSCAPE_TEMPLATE_CONFIG`)
 * 2. Service-to-Template Mapping & Persistence: `src/config/certificateTemplateMap.ts`
 *    (uses `SERVICE_TEMPLATE_MAP`, `resolveTemplateForService`, `setServiceTemplateOverride` with 'legacy_custom_template_allocations')
 * 
 * This file is retained for reference and backward compatibility. It is disconnected from the active
 * `CertificateRenderer` and `CertificateViewer`. Do NOT import from this file in new code.
 */
import { PublicCertificate } from "@/types/publicCertificate";
import { LGA_CONFIG } from "@/config/lga.config";

/** @deprecated Use `MasterTemplateType` from `@/config/certificateTemplateMap` instead. */
export type CertificateOrientation = "landscape" | "portrait";

/** @deprecated Use `CertificateFieldDefinition` from `@/config/certificateFieldConfig` instead. */
export interface FieldPosition {
  key: string;
  label?: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width?: number; // percentage width (0 - 100)
  height?: number; // percentage height (0 - 100)
  textAlign?: "left" | "center" | "right";
  fontSize?: string; // e.g. "1.15cqw", "1.4cqi", "14px"
  fontFamily?: "serif" | "sans" | "mono";
  fontWeight?: "normal" | "medium" | "semibold" | "bold" | "black";
  color?: string;
  textTransform?: "uppercase" | "capitalize" | "lowercase" | "none";
  lineHeight?: string;
  maxLines?: number;
  // Custom formatter for the field value
  format?: (cert: PublicCertificate) => string;
}

/** @deprecated Use QR coordinates configured within `MasterCertificateConfig` in `@/config/certificateFieldConfig` instead. */
export interface QRCodePosition {
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width: number; // percentage width (0 - 100)
  height: number; // percentage height (0 - 100)
  padding?: number; // padding inside QR container in px
  showBorder?: boolean;
}

/** @deprecated Use `MasterCertificateConfig` from `@/config/certificateFieldConfig` instead. */
export interface CertificateTemplateConfig {
  id: string;
  name: string;
  description: string;
  orientation: CertificateOrientation;
  aspectRatio: string; // e.g. "1.414 / 1" for landscape A4, "1 / 1.414" for portrait A4
  minHeight: string;
  backgroundImage: string;
  qrCode: QRCodePosition;
  fields: Record<string, FieldPosition>;
  defaultTitle: string;
}

/**
 * MASTER TEMPLATE CONFIGURATIONS
 * 
 * @deprecated Superseded by `MASTER_CERTIFICATE_CONFIGS` in `src/config/certificateFieldConfig.ts`.
 */
export const CERTIFICATE_TEMPLATES: Record<string, CertificateTemplateConfig> = {
  // =========================================================================
  // TEMPLATE A: LANDSCAPE  -  CLUB REGISTRATION & YOUTH / CDA SERVICES
  // Background Image: /certificates/templates/club-registration-template.jpg
  // =========================================================================
  club_landscape: {
    id: "club_landscape",
    name: "Landscape Club Registration (Official Blank)",
    description: "Official landscape blank certificate with green/gold corner wings, center seal, and two-column data structure.",
    orientation: "landscape",
    aspectRatio: "1.414 / 1",
    minHeight: "750px",
    backgroundImage: "/certificates/templates/club-registration-template.jpg",
    defaultTitle: "CERTIFICATE OF CLUB REGISTRATION",
    qrCode: {
      x: 78.4,
      y: 73.8,
      width: 7.8,
      height: 11.0,
      padding: 2,
      showBorder: false,
    },
    fields: {
      // Top Right Certificate Number line
      certificateNumber: {
        key: "certificateNumber",
        x: 88.2,
        y: 8.6,
        width: 17.0,
        textAlign: "left",
        fontFamily: "mono",
        fontWeight: "bold",
        fontSize: "0.95cqw",
        color: "#0D3B1E",
        format: (c) => c.certificateNumber || c.certificateData?.registrationNo || "LGA/CR/2026/CLB/00123",
      },

      // Top Right Date of Issue line
      dateOfIssue: {
        key: "dateOfIssue",
        x: 88.2,
        y: 14.5,
        width: 17.0,
        textAlign: "left",
        fontFamily: "serif",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.dateOfRegistration || c.certificateData?.dateOfIssue || "21st August, 2026",
      },

      // Green Ribbon Banner Certificate Title
      certificateTitle: {
        key: "certificateTitle",
        x: 50.0,
        y: 34.0,
        width: 65.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "black",
        fontSize: "1.65cqw",
        textTransform: "uppercase",
        color: "#FFFFFF",
        format: (c) => c.service.name?.toUpperCase() || "CERTIFICATE OF CLUB REGISTRATION",
      },

      // Prominent Centered Club / Applicant Name
      clubName: {
        key: "clubName",
        x: 50.0,
        y: 45.6,
        width: 60.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "black",
        fontSize: "1.6cqw",
        color: "#0D3B1E",
        textTransform: "uppercase",
        format: (c) => c.certificateData?.clubName || c.applicant.name || "Youth Empowerment Club",
      },

      // Left Column Row 1: Club Name Value Line
      clubNameField: {
        key: "clubNameField",
        x: 25.8,
        y: 58.2,
        width: 18.5,
        textAlign: "left",
        fontFamily: "serif",
        fontWeight: "bold",
        fontSize: "0.98cqw",
        color: "#0D3B1E",
        format: (c) => c.certificateData?.clubName || c.applicant.name || "Youth Empowerment Club",
      },

      // Left Column Row 2: Registration No. Value Line
      registrationNumber: {
        key: "registrationNumber",
        x: 25.8,
        y: 62.5,
        width: 18.5,
        textAlign: "left",
        fontFamily: "mono",
        fontWeight: "bold",
        fontSize: "0.95cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.registrationNo || c.certificateNumber || "LGA/CR/2026/CLB/00123",
      },

      // Left Column Row 3: Category Value Line
      category: {
        key: "category",
        x: 25.8,
        y: 66.8,
        width: 18.5,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.95cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.category || c.service.category || "Community Development",
      },

      // Left Column Row 4: Date of Registration Value Line
      dateOfRegistration: {
        key: "dateOfRegistration",
        x: 25.8,
        y: 71.0,
        width: 18.5,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.95cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.dateOfRegistration || c.certificateData?.dateOfIssue || "21st August, 2026",
      },

      // Right Column Row 1: Address Value Line
      address: {
        key: "address",
        x: 68.2,
        y: 58.2,
        width: 20.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.9cqw",
        lineHeight: "1.2",
        color: "#1E293B",
        format: (c) => c.certificateData?.address || c.applicant.address || `${LGA_CONFIG.identity.formalTitle}, ${LGA_CONFIG.identity.state}, ${LGA_CONFIG.identity.country}`,
      },

      // Right Column Row 2: Objectives Value Line
      objectives: {
        key: "objectives",
        x: 68.2,
        y: 62.5,
        width: 20.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.85cqw",
        lineHeight: "1.2",
        color: "#1E293B",
        format: (c) => c.certificateData?.objectives || "Youth Development, Skill Acquisition, Community Service",
      },

      // Right Column Row 3: Validity Value Line
      validity: {
        key: "validity",
        x: 68.2,
        y: 70.8,
        width: 20.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.95cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.validity || c.validUntil || "21st August, 2028",
      },

      // Signer Name above Executive Chairman
      signerName: {
        key: "signerName",
        x: 21.8,
        y: 83.2,
        width: 18.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "bold",
        fontSize: "1.0cqw",
        color: "#0D3B1E",
        format: (c) => c.issuer.name || "Hon. Akinyemi A. Odunayo",
      },
    },
  },

  // =========================================================================
  // TEMPLATE B: PORTRAIT  -  CERTIFICATE OF ORIGIN & STATUTORY PERMITS
  // Background Image: /certificates/templates/origin-template.jpg
  // =========================================================================
  origin_portrait: {
    id: "origin_portrait",
    name: "Portrait Certificate of Origin (Official Blank)",
    description: "Official portrait blank certificate with Guilloche borders, municipal skyline, bottom QR box and legal notice area.",
    orientation: "portrait",
    aspectRatio: "1 / 1.414",
    minHeight: "1050px",
    backgroundImage: "/certificates/templates/origin-template.jpg",
    defaultTitle: "CERTIFICATE OF ORIGIN",
    qrCode: {
      x: 13.0,
      y: 76.5,
      width: 14.2,
      height: 9.8,
      padding: 3,
      showBorder: false,
    },
    fields: {
      // Top Header: Council Title
      councilTitle: {
        key: "councilTitle",
        x: 50.0,
        y: 8.5,
        width: 60.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "black",
        fontSize: "1.8cqw",
        color: "#0D3B1E",
        textTransform: "uppercase",
        format: () => LGA_CONFIG.identity.fullName.toUpperCase(),
      },

      // Top Header: State & Country Subtitle
      councilSubtitle: {
        key: "councilSubtitle",
        x: 50.0,
        y: 11.5,
        width: 50.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.85cqw",
        color: "#15803D",
        textTransform: "uppercase",
        format: () => `${LGA_CONFIG.identity.state.toUpperCase()}, ${LGA_CONFIG.identity.country.toUpperCase()}`,
      },

      // Top Header: Secretariat Address & Web
      councilAddress: {
        key: "councilAddress",
        x: 50.0,
        y: 13.8,
        width: 60.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "normal",
        fontSize: "0.72cqw",
        color: "#475569",
        format: () => `${LGA_CONFIG.contact.shortAddress} • ${LGA_CONFIG.contact.email}`,
      },

      // Certificate Number (Top Right)
      certificateNumber: {
        key: "certificateNumber",
        x: 76.5,
        y: 20.5,
        width: 32.0,
        textAlign: "right",
        fontFamily: "mono",
        fontWeight: "bold",
        fontSize: "0.95cqw",
        color: "#0D3B1E",
        format: (c) => `Certificate No: ${c.certificateNumber || "ODE/CERT/2026/001"}`,
      },

      // Green Ribbon Banner Certificate Title
      certificateTitle: {
        key: "certificateTitle",
        x: 50.0,
        y: 33.0,
        width: 55.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "black",
        fontSize: "1.55cqw",
        textTransform: "uppercase",
        color: "#FFFFFF",
        format: (c) => c.service.name?.toUpperCase() || "CERTIFICATE OF ORIGIN",
      },

      // Certifying Introductory Paragraph
      certifyingIntro: {
        key: "certifyingIntro",
        x: 50.0,
        y: 38.2,
        width: 74.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "normal",
        fontSize: "0.88cqw",
        lineHeight: "1.4",
        color: "#1E293B",
        format: () => LGA_CONFIG.certificates.legalWording.originPreamble,
      },

      // ================= DATA TABLE ROWS (y â‰ˆ 43.5% to 67.5%) =================
      // Row 1: Name of Applicant
      nameOfApplicantLabel: {
        key: "nameOfApplicantLabel",
        x: 18.0,
        y: 44.0,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Name of Applicant",
      },
      nameOfApplicantColon: {
        key: "nameOfApplicantColon",
        x: 48.0,
        y: 44.0,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      nameOfApplicantValue: {
        key: "nameOfApplicantValue",
        x: 51.0,
        y: 44.0,
        width: 34.0,
        textAlign: "left",
        fontFamily: "serif",
        fontWeight: "black",
        fontSize: "1.05cqw",
        color: "#0D3B1E",
        format: (c) => c.certificateData?.nameOfApplicant || c.applicant.name || "Adebayo Olawale Babatunde",
      },

      // Row 2: Address
      addressLabel: {
        key: "addressLabel",
        x: 18.0,
        y: 47.3,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Address",
      },
      addressColon: {
        key: "addressColon",
        x: 48.0,
        y: 47.3,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      addressValue: {
        key: "addressValue",
        x: 51.0,
        y: 47.3,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.85cqw",
        lineHeight: "1.25",
        color: "#1E293B",
        format: (c) => c.certificateData?.address || c.applicant.address || `${LGA_CONFIG.wards[6]?.name || "Ward 7"}, ${LGA_CONFIG.identity.formalTitle}, ${LGA_CONFIG.identity.state}`,
      },

      // Row 3: Description of Goods
      descriptionOfGoodsLabel: {
        key: "descriptionOfGoodsLabel",
        x: 18.0,
        y: 50.8,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Description of Goods",
      },
      descriptionOfGoodsColon: {
        key: "descriptionOfGoodsColon",
        x: 48.0,
        y: 50.8,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      descriptionOfGoodsValue: {
        key: "descriptionOfGoodsValue",
        x: 51.0,
        y: 50.8,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.88cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.descriptionOfGoods || "General Merchandise / Indigene Verification Record",
      },

      // Row 4: Country of Destination
      countryOfDestinationLabel: {
        key: "countryOfDestinationLabel",
        x: 18.0,
        y: 54.2,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Country of Destination",
      },
      countryOfDestinationColon: {
        key: "countryOfDestinationColon",
        x: 48.0,
        y: 54.2,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      countryOfDestinationValue: {
        key: "countryOfDestinationValue",
        x: 51.0,
        y: 54.2,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.88cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.countryOfDestination || "Nigeria",
      },

      // Row 5: Purpose
      purposeLabel: {
        key: "purposeLabel",
        x: 18.0,
        y: 57.6,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Purpose",
      },
      purposeColon: {
        key: "purposeColon",
        x: 48.0,
        y: 57.6,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      purposeValue: {
        key: "purposeValue",
        x: 51.0,
        y: 57.6,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.88cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.purpose || "For Documentation / Official Use",
      },

      // Row 6: Ward
      wardLabel: {
        key: "wardLabel",
        x: 18.0,
        y: 61.0,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Ward",
      },
      wardColon: {
        key: "wardColon",
        x: 48.0,
        y: 61.0,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      wardValue: {
        key: "wardValue",
        x: 51.0,
        y: 61.0,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.88cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.ward || c.applicant.ward || "Ward 7 (Itesi / Camp)",
      },

      // Row 7: Date of Issue
      dateOfIssueLabel: {
        key: "dateOfIssueLabel",
        x: 18.0,
        y: 64.4,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Date of Issue",
      },
      dateOfIssueColon: {
        key: "dateOfIssueColon",
        x: 48.0,
        y: 64.4,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      dateOfIssueValue: {
        key: "dateOfIssueValue",
        x: 51.0,
        y: 64.4,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "medium",
        fontSize: "0.88cqw",
        color: "#1E293B",
        format: (c) => c.certificateData?.dateOfIssue || "21st August, 2026",
      },

      // Row 8: Valid Until
      validUntilLabel: {
        key: "validUntilLabel",
        x: 18.0,
        y: 67.8,
        width: 30.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "semibold",
        fontSize: "0.92cqw",
        color: "#334155",
        format: () => "Valid Until",
      },
      validUntilColon: {
        key: "validUntilColon",
        x: 48.0,
        y: 67.8,
        width: 3.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: () => ":",
      },
      validUntilValue: {
        key: "validUntilValue",
        x: 51.0,
        y: 67.8,
        width: 34.0,
        textAlign: "left",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: (c) => c.certificateData?.validUntil || c.validUntil || "21st August, 2027",
      },

      // Statutory Law Legal Notice Box (inside green rounded rectangle)
      statutoryLawNotice: {
        key: "statutoryLawNotice",
        x: 50.0,
        y: 72.2,
        width: 68.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "medium",
        fontSize: "0.75cqw",
        lineHeight: "1.25",
        color: "#1E293B",
        format: (c) =>
          c.certificateData?.statutoryLawNotice ||
          "This Certificate is issued in accordance with the provisions of the Local Government (Establishment) Law of Ogun State, 2006 and other applicable laws.",
      },

      // Chairman Signature Text & Title on Bottom Right
      signerName: {
        key: "signerName",
        x: 74.0,
        y: 81.8,
        width: 25.0,
        textAlign: "center",
        fontFamily: "serif",
        fontWeight: "bold",
        fontSize: "0.92cqw",
        color: "#0D3B1E",
        format: (c) => c.issuer.name || "Hon. Akinyemi A. Odunayo",
      },
      signerTitle: {
        key: "signerTitle",
        x: 74.0,
        y: 85.5,
        width: 25.0,
        textAlign: "center",
        fontFamily: "sans",
        fontWeight: "bold",
        fontSize: "0.78cqw",
        color: "#334155",
        format: (c) => c.issuer.title || `${LGA_CONFIG.leadership.chairman.title}, ${LGA_CONFIG.identity.fullName}`,
      },
    },
  },
};

/**
 * DEFAULT SERVICE TO TEMPLATE MAPPING
 * 
 * @deprecated Superseded by `SERVICE_TEMPLATE_MAP` in `src/config/certificateTemplateMap.ts`.
 */
export const DEFAULT_SERVICE_TEMPLATE_MAPPINGS: Record<string, string> = {
  certificate_of_origin: "club_landscape",
  state_of_origin: "club_landscape",
  origin: "club_landscape",
  
  club_registration: "club_landscape",
  cda_registration: "club_landscape",
  farmers_registration: "club_landscape",
  environmental_sanitation: "club_landscape",
  street_naming: "club_landscape",
  tenement_rate: "club_landscape",
  viewing_centre_licence: "club_landscape",
  liquor_licence: "club_landscape",
  quarry_permit: "club_landscape",
  kiosk_licence: "club_landscape",
  haulage_fees: "club_landscape",
};

const STORAGE_KEY_TEMPLATE_OVERRIDES = `${LGA_CONFIG.identity.id}_service_template_overrides`;
const LEGACY_STORAGE_KEY_TEMPLATE_OVERRIDES = "legacy_service_template_overrides";

/**
 * Retrieves all saved custom overrides from localStorage
 * @deprecated Superseded by `getSavedTemplateOverrides` in `src/config/certificateTemplateMap.ts` which uses key 'legacy_custom_template_allocations'.
 */
export function getSavedTemplateOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATE_OVERRIDES) || localStorage.getItem(LEGACY_STORAGE_KEY_TEMPLATE_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save a custom template assignment for a service
 * @deprecated Superseded by `setServiceTemplateOverride` in `src/config/certificateTemplateMap.ts`.
 */
export function setServiceTemplateOverride(serviceId: string, templateId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedTemplateOverrides();
    current[serviceId] = templateId;
    localStorage.setItem(STORAGE_KEY_TEMPLATE_OVERRIDES, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent(`${LGA_CONFIG.identity.id}:template-override-change`, { detail: { serviceId, templateId } }));
    window.dispatchEvent(new CustomEvent("lga:template-override-change", { detail: { serviceId, templateId } }));
  } catch (e) {
    console.error("Error saving template override", e);
  }
}

/**
 * Resolves the effective template configuration for a given service code or template override ID.
 * @deprecated Superseded by `resolveTemplateForService` in `src/config/certificateTemplateMap.ts` + `getMasterTemplateConfig` in `src/config/certificateFieldConfig.ts`.
 */
export function getCertificateTemplateConfig(
  _serviceCodeOrId?: string,
  _explicitTemplateId?: string
): CertificateTemplateConfig {
  return CERTIFICATE_TEMPLATES.club_landscape;
}

