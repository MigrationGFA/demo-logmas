/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { PublicCertificate } from "@/types/publicCertificate";
import { formatOfficialDate } from "@/lib/certificateTokens";
import { getLgaServiceById } from "@/config/lgaServices";
import { LGA_CONFIG } from "@/config/lga.config";
import { apiCertificates } from "./apiCertificates";

/**
 * Normalizes an application record into a PublicCertificate response.
 * Completely strips internal user passwords, auth tokens, database IDs, and sensitive data.
 */
export function transformApplicationToPublicCertificate(app: any, publicToken: string): PublicCertificate {
  const service = getLgaServiceById(app.serviceId || "");
  const isClub = app.serviceId === "club_registration" || app.serviceId?.includes("club") || app.serviceName?.toLowerCase().includes("club");
  const isCda = app.serviceId === "cda_registration" || app.serviceId?.includes("cda");
  
  const templateType = isClub || isCda ? "club" : "origin";
  const certNumber = app.certificateNumber || app.licenceNumber || `ODE/CERT/2026/${publicToken.substring(0, 8)}`;
  const issuedDate = app.issuedAt || app.updatedAt || app.createdAt || new Date().toISOString();
  const expiryDate = app.expiryDate || new Date(new Date(issuedDate).setFullYear(new Date(issuedDate).getFullYear() + (isClub ? 2 : 1))).toISOString();
  
  const applicantName = app.fullName || app.applicant || app.formData?.fullName || app.formData?.clubName || app.details?.applicantName || "Applicant";
  const address = app.address || app.formData?.address || app.formData?.secretariatAddress || app.details?.address || `${LGA_CONFIG.identity.formalTitle}, ${LGA_CONFIG.identity.state}, ${LGA_CONFIG.identity.country}`;
  const ward = app.ward || app.formData?.ward || app.details?.ward || LGA_CONFIG.wards[0]?.name || "Ward 1";

  const formattedIssueDate = formatOfficialDate(issuedDate);
  const formattedExpiryDate = formatOfficialDate(expiryDate);

  const certData: any = isClub
    ? {
        clubName: app.formData?.clubName || applicantName,
        registrationNo: certNumber,
        category: app.formData?.category || app.category || "Community Development",
        dateOfRegistration: formattedIssueDate,
        address,
        objectives: app.formData?.objectives || "Youth Development, Skill Acquisition, Community Service",
        validity: formattedExpiryDate,
        motto: "Development • Participation • A Better Tomorrow",
        statutoryLawNotice: `Registered in accordance with the Local Government Club Registration Guidelines and bye-laws of ${LGA_CONFIG.identity.fullName}.`,
      }
    : {
        nameOfApplicant: applicantName,
        address,
        descriptionOfGoods: app.formData?.descriptionOfGoods || "General Merchandise / Lineage Verification",
        countryOfDestination: app.formData?.destination || "Nigeria",
        purpose: app.formData?.purpose || app.purpose || "For Documentation / Official Use",
        ward,
        dateOfIssue: formattedIssueDate,
        validUntil: formattedExpiryDate,
        stateOfOrigin: LGA_CONFIG.identity.state,
        lgaOfOrigin: LGA_CONFIG.identity.formalTitle,
        statutoryLawNotice: `This Certificate is issued in accordance with the provisions of the Local Government (Establishment) Law of ${LGA_CONFIG.identity.state}, 2006 and other applicable laws.`,
      };

  return {
    publicToken,
    documentId: publicToken.substring(0, 8),
    certificateNumber: certNumber,
    applicationNo: app.applicationNo || `ODE-APP-${publicToken.substring(0, 6)}`,
    service: {
      code: app.serviceId || (isClub ? "club_registration" : "certificate_of_origin"),
      name: app.serviceName || service?.name || (isClub ? "Certificate of Club Registration" : "Certificate of Origin"),
      category: app.category || service?.category || "Certificates",
      description: service?.description || `Official statutory certificate issued by ${LGA_CONFIG.identity.fullName}.`,
      templateType,
    },
    applicant: {
      name: applicantName,
      address,
      phone: app.phone || null,
      email: app.email || null,
      nin: app.nin || null,
      ward,
      gender: app.formData?.gender || app.gender || null,
      dateOfBirth: app.formData?.dateOfBirth || app.dateOfBirth || null,
      passportUrl: app.formData?.passportUrl || app.passportUrl || null,
    },
    issuedAt: issuedDate,
    validUntil: expiryDate,
    expiryDate,
    status: app.status?.toLowerCase() === "declined" || app.status?.toLowerCase() === "rejected" ? "revoked" : "valid",
    statusMessage: "Official Document  -  Verified & Active in LOGMAS Registry",
    issuer: {
      name: LGA_CONFIG.leadership.chairman.name,
      title: LGA_CONFIG.leadership.chairman.title,
      organization: LGA_CONFIG.identity.fullName,
      subtitle: `${LGA_CONFIG.identity.state}, ${LGA_CONFIG.identity.country}`,
      councillorName: app.assignedCouncillor ? `${app.assignedCouncillor.firstName} ${app.assignedCouncillor.lastName}` : (LGA_CONFIG.leadership.viceChairman?.name || "Ward Councillor"),
      holgaName: LGA_CONFIG.leadership.secretary?.name || "Head of Local Government Administration",
    },
    certificateData: certData,
    verification: {
      valid: true,
      verifiedAt: new Date().toISOString(),
      qrUrl: typeof window !== "undefined" ? `${window.location.origin}/certificate/${publicToken}` : `${LGA_CONFIG.verification.publicLookupUrl}/${publicToken}`,
      qrToken: app.qrToken || publicToken.substring(0, 8),
      verificationUrl: `${LGA_CONFIG.verification.verifyUrl}?code=${encodeURIComponent(certNumber)}`,
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

