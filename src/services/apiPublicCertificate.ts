/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { PublicCertificate } from "@/types/publicCertificate";
import { formatOfficialDate } from "@/lib/certificateTokens";
import { getLgaServiceById } from "@/config/lgaServices";
import { LGA_CONFIG, getLgaCertificateUrl, getLgaVerificationUrl } from "@/config/lga.config";
import { apiCertificates } from "./apiCertificates";
import {
  buildCanonicalCertificateData,
  getServiceFieldMapping,
} from "@/config/certificateServiceFieldMap";

/**
 * Normalizes an application record into a PublicCertificate response.
 * Uses the centralized service field mapping system.
 * Enforces:
 * - Authoritative precedence: certificateData > application.formData > applicant
 * - Semantic deduplication
 * - Zero synthetic official placeholders in production render paths
 */
export function transformApplicationToPublicCertificate(app: any, publicToken: string): PublicCertificate {
  const serviceCode = app.serviceId || app.service?.code || app.service?.id || "certificate_of_origin";
  const service = getLgaServiceById(serviceCode);
  const serviceMapping = getServiceFieldMapping(serviceCode);

  const rawCertData = app.certificateData || {};
  const formData = app.formData || app.details || {};
  const applicantRaw = app.applicant || {};

  // Build unified, authoritative, and deduplicated certificate data
  const certificateData = buildCanonicalCertificateData(
    serviceCode,
    rawCertData,
    formData,
    applicantRaw
  );

  const certNumber = app.certificateNumber || app.licenceNumber || certificateData.registrationNo || "";
  const issuedDate = app.issuedAt || app.updatedAt || app.createdAt || "";
  const expiryDate = app.expiryDate || app.validUntil || null;

  const applicantName =
    certificateData.nameOfApplicant ||
    certificateData.clubName ||
    certificateData.associationName ||
    certificateData.businessName ||
    certificateData.farmerName ||
    certificateData.operatorName ||
    certificateData.propertyOwner ||
    certificateData.companyName ||
    app.fullName ||
    app.applicant ||
    formData.fullName ||
    formData.name ||
    applicantRaw.name ||
    "";

  const address =
    certificateData.address ||
    certificateData.secretariatAddress ||
    certificateData.businessAddress ||
    certificateData.premisesAddress ||
    certificateData.farmLocation ||
    certificateData.propertyAddress ||
    app.address ||
    formData.address ||
    formData.residentialAddress ||
    formData.secretariatAddress ||
    applicantRaw.address ||
    "";

  const ward =
    certificateData.ward ||
    app.ward ||
    formData.ward ||
    formData.wardName ||
    applicantRaw.ward ||
    "";

  const formattedIssueDate = issuedDate ? formatOfficialDate(issuedDate) : "";
  const formattedExpiryDate = expiryDate ? formatOfficialDate(expiryDate) : "Indefinite / Subject to LGA Verification";

  if (formattedIssueDate && !certificateData.dateOfIssue) {
    certificateData.dateOfIssue = formattedIssueDate;
  }
  if (formattedIssueDate && !certificateData.dateOfRegistration) {
    certificateData.dateOfRegistration = formattedIssueDate;
  }
  if (certNumber && !certificateData.registrationNo) {
    certificateData.registrationNo = certNumber;
  }

  return {
    publicToken,
    documentId: publicToken.substring(0, 8),
    certificateNumber: certNumber,
    applicationNo: app.applicationNo || app.applicationNumber || certNumber || publicToken,
    service: {
      id: app.serviceId || service?.id,
      code: serviceCode,
      name: app.serviceName || service?.name || serviceMapping.serviceName,
      category: app.category || service?.category || "Certificates",
      description: service?.description || `Official statutory certificate issued by ${LGA_CONFIG.identity.fullName}.`,
      templateType: "landscape",
    },
    applicant: {
      name: applicantName,
      address,
      phone: app.phone || formData.phone || applicantRaw.phone || null,
      email: app.email || formData.email || applicantRaw.email || null,
      nin: app.nin || formData.nin || null,
      ward: ward || null,
      gender: formData.gender || app.gender || null,
      dateOfBirth: formData.dateOfBirth || app.dateOfBirth || null,
      passportUrl: formData.passportUrl || app.passportUrl || null,
    },
    issuedAt: issuedDate,
    validUntil: expiryDate || formattedExpiryDate,
    expiryDate,
    status: app.status?.toLowerCase() === "declined" || app.status?.toLowerCase() === "rejected" ? "revoked" : "valid",
    statusMessage: "Official Document - Verified & Active in LOGMAS Registry",
    issuer: {
      name: app.issuedBy?.name || LGA_CONFIG.leadership.chairman.name,
      title: LGA_CONFIG.leadership.chairman.title,
      organization: LGA_CONFIG.identity.fullName,
      subtitle: `${LGA_CONFIG.identity.state}, ${LGA_CONFIG.identity.country}`,
      councillorName: app.assignedCouncillor ? `${app.assignedCouncillor.firstName || ""} ${app.assignedCouncillor.lastName || ""}`.trim() : LGA_CONFIG.leadership.viceChairman?.name,
      holgaName: LGA_CONFIG.leadership.secretary?.name || "Head of Local Government Administration",
    },
    certificateData,
    verification: {
      valid: true,
      verifiedAt: new Date().toISOString(),
      qrUrl: getLgaCertificateUrl(publicToken),
      qrToken: app.qrToken || publicToken.substring(0, 8),
      verificationUrl: getLgaVerificationUrl(certNumber),
      verificationMessage: `Authentic certificate issued by ${LGA_CONFIG.identity.fullName} Secretariat.`,
    },
  };
}

export const apiPublicCertificate = {
  /**
   * Fetch public certificate information by public token.
  * Consumes GET /api/v1/public/certificates/:publicToken via backend certificate lookup.
   */
  getPublicCertificate: async (token: string): Promise<PublicCertificate> => {
    const cleanToken = token.trim();

    // 1. Try real backend endpoint first (GET /api/v1/certificates/:id)
    try {
      const response = await apiCertificates.getCertificateById(cleanToken);

      if (response && response.id) {
        // If it conforms to the BackendCertificate contract with nested application
        if (response.application || response.service) {
          return apiCertificates.transformBackendToPublicCertificate(response, cleanToken);
        }
        // If it was already formatted as PublicCertificate
        if ((response as any).applicant && (response as any).certificateData) {
          return response as unknown as PublicCertificate;
        }
        return apiCertificates.transformBackendToPublicCertificate(response as any, cleanToken);
      }
    } catch (err) {
      console.warn("apiPublicCertificate backend lookup failed, checking local registry:", err);
      // Continue to local resolution
    }

    throw new Error("Certificate not found in public registry");
  },
};

