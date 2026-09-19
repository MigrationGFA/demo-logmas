/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { BackendCertificate } from "@/types/certificate";
import { PublicCertificate } from "@/types/publicCertificate";
import { formatOfficialDate, generatePublicToken } from "@/lib/certificateTokens";
import { LGA_CONFIG } from "@/config/lga.config";
import {
  buildCanonicalCertificateData,
  getServiceFieldMapping,
} from "@/config/certificateServiceFieldMap";

/**
 * Service for the official Backend Certificate Endpoints:
 * - GET /api/v1/certificates (List scoped to role)
 * - GET /api/v1/certificates/:id (Fetch one by ID, certificateNumber, or verificationCode)
 */
export const apiCertificates = {
  /**
   * List issued certificates, scoped to the logged-in user's role:
   * - citizen/business_owner: applicant OR createdBy
   * - field_officer: applications they created
   * - admin/super_admin/chairman/treasurer/auditor: all certificates
   */
  getCertificates: async (): Promise<BackendCertificate[]> => {
    try {
      const response = await api.get<BackendCertificate[] | { data: BackendCertificate[] }>(
        "/certificates"
      );

      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      }
      return [];
    } catch (err) {
      console.warn("apiCertificates.getCertificates error:", err);
      return [];
    }
  },

  /**
   * Fetch one certificate by its UUID id, its certificateNumber, or its verificationCode
   */
  getCertificateById: async (idOrNumberOrCode: string): Promise<BackendCertificate | null> => {
    if (!idOrNumberOrCode) return null;
    const cleanId = idOrNumberOrCode.trim();

    try {
      let response: any;
      try {
        response = await api.get<BackendCertificate | { data: BackendCertificate }>(
          `/certificates/${encodeURIComponent(cleanId)}`
        );
      } catch (firstErr) {
        // If encoded failed (e.g. backend expects raw slashes or unencoded path), try raw
        try {
          response = await api.get<BackendCertificate | { data: BackendCertificate }>(
            `/certificates/${cleanId}`
          );
        } catch {
          throw firstErr;
        }
      }

      if (response && (response as any).id) {
        return response as BackendCertificate;
      }
      if (response && (response as any).data && (response as any).data.id) {
        return (response as any).data as BackendCertificate;
      }
      return response as BackendCertificate;
    } catch (err) {
      console.warn(`apiCertificates.getCertificateById(${cleanId}) error:`, err);
      throw err;
    }
  },

  /**
   * Transforms the backend certificate contract response into the full PublicCertificate
   * model used by CertificateRenderer, templates, and public verification views.
   */
  transformBackendToPublicCertificate: (
    cert: BackendCertificate,
    tokenOverride?: string
  ): PublicCertificate => {
    const rawApp: any = cert.application || {};
    const formData: Record<string, any> = rawApp.formData || {};
    const applicantRaw: Record<string, any> = rawApp.applicant || {};
    const serviceRaw: Record<string, any> = cert.service || {};
    const rawCertData: Record<string, any> = (cert as any).certificateData || {};

    const serviceCode = serviceRaw.code || serviceRaw.id || "certificate_of_origin";
    const serviceMapping = getServiceFieldMapping(serviceCode);

    // Build unified, authoritative, and deduplicated certificate data
    // Data Precedence: certificateData is authoritative; formData is fallback.
    const certificateData = buildCanonicalCertificateData(
      serviceCode,
      rawCertData,
      formData,
      applicantRaw
    );

    const applicantName =
      certificateData.nameOfApplicant ||
      certificateData.clubName ||
      certificateData.associationName ||
      certificateData.businessName ||
      certificateData.farmerName ||
      certificateData.operatorName ||
      certificateData.propertyOwner ||
      certificateData.companyName ||
      applicantRaw.name ||
      formData.fullName ||
      formData.applicantName ||
      formData.name ||
      "";

    const applicantAddress =
      certificateData.address ||
      certificateData.secretariatAddress ||
      certificateData.businessAddress ||
      certificateData.premisesAddress ||
      certificateData.farmLocation ||
      certificateData.propertyAddress ||
      certificateData.siteLocation ||
      applicantRaw.address ||
      formData.residentialAddress ||
      formData.address ||
      "";

    const applicantWard =
      certificateData.ward ||
      applicantRaw.ward ||
      formData.ward ||
      formData.wardName ||
      formData.lgaWard ||
      "";

    const formattedIssuedDate = cert.issuedAt ? formatOfficialDate(cert.issuedAt) : "";
    const validUntilDate = cert.expiresAt
      ? formatOfficialDate(cert.expiresAt)
      : "Indefinite / Subject to LGA Verification";

    const effectiveToken =
      tokenOverride ||
      cert.qrToken ||
      cert.certificateNumber ||
      cert.verificationCode ||
      generatePublicToken(cert.id);

    // Ensure system dates are present in certificateData without fake static placeholders
    if (formattedIssuedDate && !certificateData.dateOfIssue) {
      certificateData.dateOfIssue = formattedIssuedDate;
    }
    if (formattedIssuedDate && !certificateData.dateOfRegistration) {
      certificateData.dateOfRegistration = formattedIssuedDate;
    }
    if (cert.certificateNumber && !certificateData.registrationNo) {
      certificateData.registrationNo = cert.certificateNumber;
    }

    return {
      id: cert.id,
      publicToken: effectiveToken,
      documentId: cert.id,
      certificateNumber: cert.certificateNumber || "",
      applicationNo: rawApp.applicationNumber || cert.certificateNumber || cert.id,
      service: {
        id: serviceRaw.id,
        code: serviceCode,
        name: serviceRaw.name || serviceMapping.serviceName,
        category: serviceRaw.category || "Certificates",
        description: serviceRaw.description,
        templateType: "landscape",
        revenueHead: serviceRaw.revenueHead,
        certificateType: serviceRaw.certificateType,
        estimatedDays: serviceRaw.estimatedDays,
      },
      applicant: {
        id: applicantRaw.id,
        name: applicantName,
        address: applicantAddress,
        phone: applicantRaw.phone || formData.phone || null,
        email: applicantRaw.email || formData.email || null,
        ward: applicantWard || null,
        nin: formData.nin || null,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        passportUrl: formData.passportUrl || formData.passportPhoto || null,
      },
      issuedAt: cert.issuedAt,
      validUntil: cert.expiresAt || validUntilDate,
      expiryDate: cert.expiresAt,
      status: "valid",
      statusMessage: `Official Document - Verified & Active in ${LGA_CONFIG.identity.name} LGA Registry`,
      issuer: {
        id: cert.issuedBy?.id,
        name: cert.issuedBy?.name || LGA_CONFIG.leadership.chairman.name,
        title:
          cert.issuedBy?.role === "chairman"
            ? LGA_CONFIG.leadership.chairman.title
            : cert.issuedBy?.name
              ? `${cert.issuedBy.name} (${cert.issuedBy.role || "Authorized Signatory"})`
              : LGA_CONFIG.leadership.chairman.title,
        organization: LGA_CONFIG.identity.fullName,
        subtitle: `${LGA_CONFIG.identity.state}, ${LGA_CONFIG.identity.country}`,
        councillorName: formData.councillorName || LGA_CONFIG.leadership.viceChairman?.name,
        holgaName: LGA_CONFIG.leadership.secretary?.name || "Head of Local Government Administration",
        role: cert.issuedBy?.role || "lga_admin",
      },
      certificateData,
      verification: {
        valid: true,
        verifiedAt: new Date().toISOString(),
        qrUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/certificate/${encodeURIComponent(cert.certificateNumber || effectiveToken)}`,
        qrToken: cert.qrToken,
        verificationCode: cert.verificationCode,
        verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/verify?code=${encodeURIComponent(cert.certificateNumber || cert.verificationCode || "")}`,
        verificationMessage:
          `Authentic certificate issued by ${LGA_CONFIG.identity.fullName} Secretariat.`,
      },
      backendCertificate: cert,
      invoice: cert.invoice || null,
      issuedBy: cert.issuedBy || null,
      application: cert.application,
      pdfUrl: cert.pdfUrl || null,
    };
  },
};

